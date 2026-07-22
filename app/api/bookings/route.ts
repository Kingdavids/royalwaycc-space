import { NextResponse } from "next/server";
import { ZodError } from "zod";

import {
    bookingRequestSchema,
} from "@/lib/booking-schema";
import {
    BookingConflictError,
    createBookingCheckout,
} from "@/lib/booking-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function validationResponse(error: ZodError) {
    const fields: Record<string, string> = {};

    for (const issue of error.issues) {
        const field = String(
            issue.path[0] || "booking"
        );

        if (!fields[field]) {
            fields[field] = issue.message;
        }
    }

    return NextResponse.json(
        {
            error:
                "Please correct the highlighted booking information.",
            fields,
        },
        {
            status: 400,
            headers: {
                "Cache-Control": "no-store",
            },
        }
    );
}

export async function POST(request: Request) {
    try {
        const contentType =
            request.headers.get("content-type") || "";

        if (
            !contentType
                .toLowerCase()
                .includes("application/json")
        ) {
            return NextResponse.json(
                {
                    error:
                        "The booking request must be JSON.",
                },
                { status: 415 }
            );
        }

        const body = await request.json();

        const booking =
            bookingRequestSchema.parse(body);

        const result =
            await createBookingCheckout(booking);

        return NextResponse.json(
            {
                url: result.checkoutUrl,
                bookingReference:
                    result.bookingReference,
            },
            {
                status: 201,
                headers: {
                    "Cache-Control": "no-store",
                },
            }
        );
    } catch (error) {
        if (error instanceof ZodError) {
            return validationResponse(error);
        }

        if (error instanceof BookingConflictError) {
            return NextResponse.json(
                {
                    error: error.message,
                },
                {
                    status: 409,
                    headers: {
                        "Cache-Control": "no-store",
                    },
                }
            );
        }

        if (error instanceof SyntaxError) {
            return NextResponse.json(
                {
                    error:
                        "The booking request contains invalid JSON.",
                },
                { status: 400 }
            );
        }

        console.error(
            "Booking creation failed:",
            error
        );

        return NextResponse.json(
            {
                error:
                    "We could not create the booking. No payment was taken. Please try again.",
            },
            {
                status: 500,
                headers: {
                    "Cache-Control": "no-store",
                },
            }
        );
    }
}
