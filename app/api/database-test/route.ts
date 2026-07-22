import { NextResponse } from "next/server";
import { db } from "../../lib/db";

export async function GET() {
    try {
        const [rows] = await db.execute(
            "SELECT DATABASE() AS databaseName, NOW() AS serverTime"
        );

        return NextResponse.json({
            connected: true,
            result: rows,
        });
    } catch (error) {
        console.error("Database connection failed:", error);

        return NextResponse.json(
            {
                connected: false,
                message: "Database connection failed.",
            },
            { status: 500 }
        );
    }
}