import { NextResponse } from "next/server";

import { testDatabaseConnection } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const result =
            await testDatabaseConnection();

        return NextResponse.json(
            {
                ok: true,
                database: result.databaseName,
            },
            {
                status: 200,
                headers: {
                    "Cache-Control": "no-store",
                },
            }
        );
    } catch (error) {
        console.error(
            "Database health check failed:",
            error
        );

        return NextResponse.json(
            {
                ok: false,
                message:
                    "Database connection failed.",
            },
            {
                status: 503,
                headers: {
                    "Cache-Control": "no-store",
                },
            }
        );
    }
}
