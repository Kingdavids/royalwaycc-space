import mysql from "mysql2/promise";

const requiredEnvironmentVariables = [
    "DB_HOST",
    "DB_PORT",
    "DB_NAME",
    "DB_USER",
    "DB_PASSWORD",
] as const;

for (const variable of requiredEnvironmentVariables) {
    if (!process.env[variable]) {
        throw new Error(`Missing environment variable: ${variable}`);
    }
}

const globalForDatabase = globalThis as unknown as {
    mysqlPool?: mysql.Pool;
};

export const db =
    globalForDatabase.mysqlPool ??
    mysql.createPool({
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,

        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,

        dateStrings: true,
        timezone: "Z",
    });

if (process.env.NODE_ENV !== "production") {
    globalForDatabase.mysqlPool = db;
}