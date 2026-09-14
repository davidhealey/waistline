/*
  Copyright 2026 Andrew Franqueira

  This file is part of Waistline.

  Waistline is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  Waistline is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with Waistline.  If not, see <http://www.gnu.org/licenses/>.
*/

var dbHandler = {};

dbHandler._impl = null;
dbHandler._initPromise = null;

// In-flight guard to prevent concurrent calls.
dbHandler.initializeDb = function() {
  if (dbHandler._initPromise) {
    return dbHandler._initPromise;
  }

  dbHandler._initPromise = dbHandler._doInitializeDb().finally(() => {
    dbHandler._initPromise = null;
  });

  return dbHandler._initPromise;
};

dbHandler._doInitializeDb = async function() {
  if (app.Settings.get("migration", "sqliteComplete") === true) {
    try {
      await sqliteHandler.initializeDb();
      dbHandler._impl = sqliteHandler;
    } catch (err) {
      console.error("Failed to open the SQLite database", err);
      app.Utils.notify("Waistline couldn't open its database. Try restarting the app.", "error");
      throw err;
    }

  } else {
    await indexedDbHandler.initializeDb();
    await sqliteHandler.initializeDb();

    app.f7.preloader.show();
    try {
      await dbMigration.run();
      dbHandler._impl = sqliteHandler;
    } catch (e) {
      console.error("Migration to SQLite failed, staying on IndexedDB for this session", e);
      dbHandler._impl = indexedDbHandler;
    } finally {
      app.f7.preloader.hide();
    }
  }
};

dbHandler.get                 = (...args) => dbHandler._impl.get(...args);
dbHandler.getByKey            = (...args) => dbHandler._impl.getByKey(...args);
dbHandler.getByMultipleKeys   = (...args) => dbHandler._impl.getByMultipleKeys(...args);
dbHandler.getFirstNonArchived = (...args) => dbHandler._impl.getFirstNonArchived(...args);
dbHandler.getIndexSorted      = (...args) => dbHandler._impl.getIndexSorted(...args);
dbHandler.put                 = (...args) => toPromise(dbHandler._impl.put(...args));
dbHandler.processItems        = (...args) => dbHandler._impl.processItems(...args);
dbHandler.deleteItem          = (...args) => toPromise(dbHandler._impl.deleteItem(...args));
dbHandler.export              = (...args) => dbHandler._impl.export(...args);
dbHandler.import              = (...args) => dbHandler._impl.import(...args);

function toPromise(requestOrPromise) {
  if (requestOrPromise instanceof Promise) {
    return requestOrPromise;
  }

  return new Promise((resolve, reject) => {
    requestOrPromise.addEventListener("success", (e) => resolve(e.target.result));
    requestOrPromise.addEventListener("error", (e) => reject(e));
  });
}