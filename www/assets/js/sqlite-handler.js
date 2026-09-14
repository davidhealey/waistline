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


var sqliteHandler = {};

sqliteHandler.db = null;

sqliteHandler.VERSION = "sqlite-kv-v1";

sqliteHandler.STORE_COLUMNS = {
  foodList: ["barcode", "name", "brand", "dateTime", "archived"],
  diary: ["dateTime"],
  meals: ["name", "dateTime"],
  recipes: ["name", "dateTime"]
};

sqliteHandler.SCHEMA_DDL = [
  `CREATE TABLE IF NOT EXISTS foodList (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      barcode TEXT,
      name TEXT,
      brand TEXT,
      dateTime TEXT,
      archived INTEGER DEFAULT 0,
      data TEXT NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS idx_foodList_barcode ON foodList(barcode)`,
  `CREATE INDEX IF NOT EXISTS idx_foodList_name ON foodList(name)`,
  `CREATE INDEX IF NOT EXISTS idx_foodList_brand ON foodList(brand)`,
  `CREATE INDEX IF NOT EXISTS idx_foodList_dateTime ON foodList(dateTime)`,
  
  `CREATE TABLE IF NOT EXISTS diary (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      dateTime TEXT,
      data TEXT NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS idx_diary_dateTime ON diary(dateTime)`,

  `CREATE TABLE IF NOT EXISTS meals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT, dateTime TEXT,
      data TEXT NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS idx_meals_name ON meals(name)`,
  `CREATE INDEX IF NOT EXISTS idx_meals_dateTime ON meals(dateTime)`,
  
  `CREATE TABLE IF NOT EXISTS recipes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      dateTime TEXT,
      data TEXT NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS idx_recipes_name ON recipes(name)`,
  `CREATE INDEX IF NOT EXISTS idx_recipes_dateTime ON recipes(dateTime)`,
  
  `CREATE TABLE IF NOT EXISTS category_links (
      store_name TEXT NOT NULL,
      item_id INTEGER NOT NULL,
      category TEXT NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS idx_category_links_lookup ON category_links(store_name, category)`,
  `CREATE INDEX IF NOT EXISTS idx_category_links_item ON category_links(store_name, item_id)`
];

sqliteHandler.initializeDb = function() {
  return new Promise((resolve, reject) => {
    sqliteHandler.db = window.sqlitePlugin.openDatabase(
      { name: "waistline.db", location: "default" },
      () => sqliteHandler.upgradeSchema().then(resolve).catch(reject),
      (err) => reject(err)
    );
  });
};

sqliteHandler.upgradeSchema = async function() {
  const rows = await sqliteHandler.query("PRAGMA user_version");
  const version = rows[0].user_version;

  if (version < 1) {
    await new Promise((resolve, reject) => {
      sqliteHandler.db.sqlBatch(sqliteHandler.SCHEMA_DDL, resolve, reject);
    });
    await sqliteHandler.query("PRAGMA user_version = 1");
  }
};

sqliteHandler.get = async function(store, indexName, value) {
  if (value instanceof Date) {
    value = value.toISOString();
  }

  const rows = await sqliteHandler.query(
    `SELECT id, data FROM ${store} WHERE ${indexName} = ? LIMIT 1`,
    [value]
  );
  return rows.length ? sqliteHandler.parseItem(rows[0]) : undefined;
};

sqliteHandler.getByKey = async function(id, store) {
  const rows = await sqliteHandler.query(`SELECT id, data FROM ${store} WHERE id = ?`, [id]);
  return rows.length ? sqliteHandler.parseItem(rows[0]) : undefined;
};

sqliteHandler.getByMultipleKeys = async function(ids, store) {
  if (!ids.length) {
    return [];
  }

  const placeholders = ids.map(() => "?").join(", ");
  const rows = await sqliteHandler.query(`SELECT id, data FROM ${store} WHERE id IN (${placeholders})`, ids);
  return rows.map(row => sqliteHandler.parseItem(row));
};

sqliteHandler.getFirstNonArchived = async function(store, indexName, value) {
  if (value instanceof Date) {
    value = value.toISOString();
  }

  const rows = await sqliteHandler.query(
    `SELECT id, data FROM ${store} WHERE ${indexName} = ? AND (archived IS NULL OR archived = 0) LIMIT 1`,
    [value]
  );
  return rows.length ? sqliteHandler.parseItem(rows[0]) : undefined;
};

sqliteHandler.getIndexSorted = async function(store, indexName, direction, range) {
  direction = direction || "next";
  let sql = `SELECT id, data FROM ${store}`;
  const params = [];

  if (range) {
    sql += ` WHERE ${indexName} BETWEEN ? AND ?`;
    let lower = range.lower instanceof Date ? range.lower.toISOString() : range.lower;
    let upper = range.upper instanceof Date ? range.upper.toISOString() : range.upper;
    params.push(lower, upper);
  }

  sql += ` ORDER BY ${indexName} ${direction === "prev" ? "DESC" : "ASC"}`;

  const rows = await sqliteHandler.query(sql, params);
  return rows.map(row => sqliteHandler.parseItem(row));
};

sqliteHandler.put = async function(item, store) {
  const cols = sqliteHandler.extractColumns(store, item);

  if (item.id === undefined) {
    const result = await sqliteHandler.query(
      `INSERT INTO ${store} (${cols.names}, data) VALUES (${cols.qs}, ?)`,
      [...cols.values, JSON.stringify(item)]
    );

    item.id = result.insertId;
    await sqliteHandler.query(`UPDATE ${store} SET data = ? WHERE id = ?`, [JSON.stringify(item), item.id]);
  } else {
    await sqliteHandler.query(
      `INSERT OR REPLACE INTO ${store} (id, ${cols.names}, data) VALUES (?, ${cols.qs}, ?)`,
      [item.id, ...cols.values, JSON.stringify(item)]
    );
  }

  await sqliteHandler.syncCategoryLinks(store, item.id, item.categories);
  return item.id;
};

sqliteHandler.processItems = async function(store, indexName, condition, callbackAction) {
  let items;

  if (indexName === "categories") {
    const rows = await sqliteHandler.query(
      "SELECT item_id FROM category_links WHERE store_name = ? AND category = ?",
      [store, condition.lower]
    );
    items = await sqliteHandler.getByMultipleKeys(rows.map(row => row.item_id), store);
  } else {
    const rows = await sqliteHandler.query(`SELECT id, data FROM ${store}`);
    items = rows.map(row => sqliteHandler.parseItem(row));
  }

  for (const item of items) {
    let updated = false;
    callbackAction({
      value: item,
      update: (newItem) => { Object.assign(item, newItem); updated = true; }
    });
    if (updated) {
      await sqliteHandler.put(item, store);
    }
  }
};

sqliteHandler.deleteItem = async function(id, store) {
  await sqliteHandler.query(`DELETE FROM ${store} WHERE id = ?`, [id]);
  await sqliteHandler.query(
    "DELETE FROM category_links WHERE store_name = ? AND item_id = ?",
    [store, id]
  );
};

sqliteHandler.export = function() {
  const stores = Object.keys(sqliteHandler.STORE_COLUMNS);
  const result = { format: sqliteHandler.VERSION, exportedAt: new Date().toISOString(), stores: {} };

  return new Promise((resolve, reject) => {
    sqliteHandler.db.transaction(
      transaction => {
        for (const store of stores) {
          transaction.executeSql(`SELECT id, data FROM ${store}`, [], (transaction, resultSet) => {
            const rows = [];
            for (let i = 0; i < resultSet.rows.length; i++) {
              rows.push(sqliteHandler.parseItem(resultSet.rows.item(i)));
            }
            result.stores[store] = rows;
          });
        }

        transaction.executeSql("SELECT store_name, item_id, category FROM category_links", [], (transaction, resultSet) => {
          const links = [];
          for (let i = 0; i < resultSet.rows.length; i++) {
            const row = resultSet.rows.item(i);
            links.push({ store_name: row.store_name, item_id: row.item_id, category: row.category });
          }
          result.categoryLinks = links;
        });
      },
      (err) => reject(err),
      () => resolve(result)
    );
  });
};

sqliteHandler.import = function(data) {
  if (data.format !== sqliteHandler.VERSION) {
    throw new Error("This backup was made by an older version of the app and cannot be restored here.");
  }

  const stores = Object.keys(sqliteHandler.STORE_COLUMNS);
  const statements = stores.map(store => [`DELETE FROM ${store}`]);
  statements.push(["DELETE FROM category_links"]);

  for (const store of stores) {
    for (const item of data.stores[store] || []) {
      const cols = sqliteHandler.extractColumns(store, item);
      statements.push([
        `INSERT INTO ${store} (id, ${cols.names}, data) VALUES (?, ${cols.qs}, ?)`,
        [item.id, ...cols.values, JSON.stringify(item)]
      ]);
    }
  }

  for (const link of data.categoryLinks || []) {
    statements.push([
      "INSERT INTO category_links (store_name, item_id, category) VALUES (?, ?, ?)",
      [link.store_name, link.item_id, link.category]
    ]);
  }

  return new Promise((resolve, reject) => sqliteHandler.db.sqlBatch(statements, resolve, reject));
};

// Wraps the callback-style API so every adapter function can just `await` it
sqliteHandler.query = function(sql, params) {
  params = params || [];
  return new Promise((resolve, reject) => {
    sqliteHandler.db.transaction(
      transaction => {
        transaction.executeSql(sql, params,
          (transaction, resultSet) => {
            const rows = [];
            for (let i = 0; i < resultSet.rows.length; i++) {
              rows.push(resultSet.rows.item(i));
            }
            rows.insertId = resultSet.insertId;
            resolve(rows);
          },
          (transaction, err) => reject(err)
        );
      },
      (err) => reject(err)
    );
  });
};

sqliteHandler.extractColumns = function(store, item) {
  const columns = sqliteHandler.STORE_COLUMNS[store];
  const names = columns.join(", ");
  const qs = columns.map(() => "?").join(", ");
  const values = columns.map(col => {
    const value = item[col];
    return value instanceof Date ? value.toISOString() : value;
  });

  return { names, qs, values };
};

sqliteHandler.syncCategoryLinks = async function(store, itemId, categories) {
  await sqliteHandler.query(
    "DELETE FROM category_links WHERE store_name = ? AND item_id = ?",
    [store, itemId]
  );

  if (!categories) {
    return;
  }

  for (const category of categories) {
    await sqliteHandler.query(
      "INSERT INTO category_links (store_name, item_id, category) VALUES (?, ?, ?)",
      [store, itemId, category]
    );
  }
};

sqliteHandler.parseItem = function(row) {
  const item = JSON.parse(row.data);
  item.id = row.id;
  if (item.dateTime !== undefined) {
    item.dateTime = new Date(item.dateTime);
  }
  return item;
};