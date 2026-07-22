import "server-only";

import mysql, {
    Pool,
    PoolConnection,
    RowDataPacket,
} from "mysql2/promise";

import { env } from "@/lib/env";

declare global {
    // eslint-disable-next-line no-var
    var royalwayDbPool: Pool | undefined;
}

function createPool(): Pool {
    return mysql.createPool({
        host: env.databaseHost,
        port: env.databasePort,
        user: env.databaseUser,
        password: env.databasePassword,
        database: env.databaseName,
        charset: "utf8mb4",
        timezone: "Z",
        waitForConnections: true,
        connectionLimit: 10,
        maxIdle: 10,
        idleTimeout: 60_000,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0,
        decimalNumbers: true,
    });
}

export const db =
    global.royalwayDbPool ?? createPool();

if (process.env.NODE_ENV !== "production") {
    global.royalwayDbPool = db;
}

export async function withTransaction<T>(
    callback: (
        connection: PoolConnection
    ) => Promise<T>
): Promise<T> {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();
        const result = await callback(connection);
        await connection.commit();
        return result;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

export async function testDatabaseConnection() {
    const [rows] = await db.execute<RowDataPacket[]>(
        "SELECT DATABASE() AS databaseName"
    );

    const databaseName = String(
        rows[0]?.databaseName || ""
    );

    if (!databaseName) {
        throw new Error(
            "MySQL connected without a selected database."
        );
    }

    return {
        connected: true as const,
        databaseName,
    };
}
