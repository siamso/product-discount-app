import sqlite3 from "sqlite3";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { existsSync, mkdirSync, readFileSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let db = null;

export const initDatabase = () => {
  const dbPath = join(__dirname, "data/bundles.db");

  const dataDir = dirname(dbPath);
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }

  db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error("Error opening database:", err);
      return;
    }
    console.log("Connected to SQLite database");
    createTables();
  });

  db.run("PRAGMA foreign_keys = ON");

  return db;
};

const createTables = () => {
  const schemaPath = join(__dirname, "schema.sql");
  const schema = readFileSync(schemaPath, "utf8");

  db.exec(schema, (err) => {
    if (err) {
      console.error("Error creating tables:", err);
      return;
    }
    console.log("Database tables created successfully");
  });
};

export const runQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, changes: this.changes });
      }
    });
  });
};

export const getRow = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

export const getAllRows = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

export const runTransaction = async (callback) => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run("BEGIN TRANSACTION");

      callback()
        .then((result) => {
          db.run("COMMIT", (err) => {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
          });
        })
        .catch((error) => {
          db.run("ROLLBACK", () => {
            reject(error);
          });
        });
    });
  });
};

export const closeDatabase = () => {
  if (db) {
    db.close((err) => {
      if (err) {
        console.error("Error closing database:", err);
        return;
      }
      console.log("Database connection closed");
    });
  }
};

export const getDatabase = () => db;
