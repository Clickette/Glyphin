const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const Logger = require('../Utilities/Logger');

// very cool db helper :DDDDD
// shout out to chatgpt for writng the jsdocs (i am too lazy)
class SQLiteHelper {
    /**
     * Creates an instance of SQLiteHelper.
     * 
     * @param {string} dbPath - The path to the SQLite database file.
     */
    constructor(dbPath) {
        this.dbPath = dbPath;
        this.db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                Logger.error(`Error opening database: ${err.message}`);
            } else {
                Logger.info(`Connected to the SQLite database at ${dbPath}`);
            }
        });
    }

    /**
     * Executes an SQL query.
     * 
     * @param {string} query - The SQL query to execute.
     * @param {Array} [params=[]] - The parameters for the SQL query.
     * @returns {Promise<Object>} A promise that resolves with the query result.
     */
    run(query, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(query, params, function (err) {
                if (err) {
                    reject(new Error({
                        http: {
                            code: 500,
                            message: `Internal Server Error: ${err.message}`
                        }
                    }));
                } else {
                    resolve({
                        http: {
                            code: 200,
                            message: "OK"
                        },
                        data: {
                            id: this.lastID,
                            changes: this.changes
                        }
                    });
                }
            });
        });
    }

    /**
     * Executes an SQL query and returns the first result formatted as JSON.
     * 
     * @param {string} query - The SQL query to execute.
     * @param {Array} [params=[]] - The parameters for the SQL query.
     * @returns {Promise<Object>} A promise that resolves with the first query result as JSON.
     */
    get(query, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(query, params, (err, row) => {
                if (err) {
                    reject(new Error({
                        http: {
                            code: 500,
                            message: `Internal Server Error: ${err.message}`
                        }
                    }));
                } else {
                    resolve({
                        http: {
                            code: 200,
                            message: "OK"
                        },
                        data: row
                    });
                }
            });
        });
    }

    /**
     * Executes an SQL query and returns all results formatted as JSON.
     * 
     * @param {string} query - The SQL query to execute.
     * @param {Array} [params=[]] - The parameters for the SQL query.
     * @returns {Promise<Object>} A promise that resolves with the query results as JSON.
     */
    all(query, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(query, params, (err, rows) => {
                if (err) {
                    reject(new Error({
                        http: {
                            code: 500,
                            message: `Internal Server Error: ${err.message}`
                        }
                    }));
                } else {
                    resolve({
                        http: {
                            code: 200,
                            message: "OK"
                        },
                        data: rows
                    });
                }
            });
        });
    }

    /**
     * Closes the SQLite database.
     * 
     * @returns {Promise<Object>} A promise that resolves when the database is closed.
     */
    close() {
        return new Promise((resolve, reject) => {
            this.db.close((err) => {
                if (err) {
                    reject(new Error({
                        http: {
                            code: 500,
                            message: `Internal Server Error: ${err.message}`
                        }
                    }));
                } else {
                    resolve({
                        http: {
                            code: 200,
                            message: "OK"
                        }
                    });
                }
            });
        });
    }

    /**
     * Creates a new SQLite database file.
     * 
     * @param {string} dbName - The name of the new database.
     * @param {Array<{name: string, type: string}>} [columns=[]] - The columns for the initial table.
     * @param {string} [tableName='main'] - The name of the initial table.
     * @returns {Promise<Object>} A promise that resolves when the database is created.
     */
    static async createDB(dbName, columns = [], tableName = 'main') {
        const dbDir = path.join(__dirname, 'Databases');
        if (!fs.existsSync(dbDir)) {
            fs.mkdirSync(dbDir, { recursive: true });
        }

        const dbPath = path.join(dbDir, `${dbName}.sqlite`);
        const db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                Logger.error(`Error creating database: ${err.message}`);
            } else {
                Logger.info(`Created SQLite database at ${dbPath}`);
            }
        });

        if (columns.length > 0) {
            const columnsDefinition = columns.map(col => `${col.name} ${col.type}`).join(', ');
            const createTableQuery = `CREATE TABLE IF NOT EXISTS ${tableName} (${columnsDefinition});`;

            await new Promise((resolve, reject) => {
                db.run(createTableQuery, (err) => {
                    if (err) {
                        reject(new Error({
                            http: {
                                code: 500,
                                message: `Internal Server Error: ${err.message}`
                            }
                        }));
                    } else {
                        resolve({
                            http: {
                                code: 200,
                                message: "OK"
                            }
                        });
                    }
                });
            });
        }

        db.close();
    }

    /**
     * Creates a new table in the database.
     * 
     * @param {string} tableName - The name of the table to create.
     * @param {Array<{name: string, type: string}>} columns - The columns for the table.
     * @returns {Promise<Object>} A promise that resolves when the table is created.
     */
    createTable(tableName, columns) {
        const columnsDefinition = columns.map(col => `${col.name} ${col.type}`).join(', ');
        const createTableQuery = `CREATE TABLE IF NOT EXISTS ${tableName} (${columnsDefinition});`;

        return this.run(createTableQuery);
    }

    /**
     * Deletes a table from the database.
     * 
     * @param {string} tableName - The name of the table to delete.
     * @returns {Promise<Object>} A promise that resolves when the table is deleted.
     */
    deleteTable(tableName) {
        const deleteTableQuery = `DROP TABLE IF EXISTS ${tableName};`;
        return this.run(deleteTableQuery);
    }

    /**
     * Inserts data into a table.
     * 
     * @param {string} tableName - The name of the table to insert data into.
     * @param {Object} data - The data to insert.
     * @returns {Promise<Object>} A promise that resolves when the data is inserted.
     */
    insert(tableName, data) {
        const columns = Object.keys(data).join(', ');
        const placeholders = Object.keys(data).map(() => '?').join(', ');
        const values = Object.values(data);
        const insertQuery = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders});`;

        return this.run(insertQuery, values);
    }

    /**
     * Updates data in a table.
     * 
     * @param {string} tableName - The name of the table to update data in.
     * @param {Object} data - The data to update.
     * @param {string} whereClause - The WHERE clause to specify which rows to update.
     * @param {Array} [whereParams=[]] - The parameters for the WHERE clause.
     * @returns {Promise<Object>} A promise that resolves when the data is updated.
     */
    update(tableName, data, whereClause, whereParams = []) {
        const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ');
        const values = Object.values(data).concat(whereParams);
        const updateQuery = `UPDATE ${tableName} SET ${setClause} WHERE ${whereClause};`;

        return this.run(updateQuery, values);
    }

    /**
     * Deletes data from a table.
     * 
     * @param {string} tableName - The name of the table to delete data from.
     * @param {string} whereClause - The WHERE clause to specify which rows to delete.
     * @param {Array} [whereParams=[]] - The parameters for the WHERE clause.
     * @returns {Promise<Object>} A promise that resolves when the data is deleted.
     */
    delete(tableName, whereClause, whereParams = []) {
        const deleteQuery = `DELETE FROM ${tableName} WHERE ${whereClause};`;
        return this.run(deleteQuery, whereParams);
    }
}

module.exports = SQLiteHelper;
