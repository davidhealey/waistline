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

var dbMigration = {};

dbMigration.STORES = ["foodList", "diary", "meals", "recipes"];

dbMigration.run = async function() {
  await dbMigration.backupBeforeMigrating();
  await dbMigration.copyAllStores();

  app.Settings.put("migration", "sqliteComplete", true);
};

dbMigration.backupBeforeMigrating = async function() {
  let data = await indexedDbHandler.export();
  let json = JSON.stringify(data);
  let timestamp = new Date().toISOString().replace(/[:.]/g, "-");

  await app.Utils.writeFile(json, `pre-migration-backup-${timestamp}.json`);
};

dbMigration.copyAllStores = async function() {
  for (const store of dbMigration.STORES) {
    let items = await indexedDbHandler.getAllItems(store);

    for (const item of items) {
      await sqliteHandler.put(item, store);
    }
  }
};