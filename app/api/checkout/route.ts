import { NextRequest, NextResponse } from "next/server";

import { stripe } from "@/app/lib/stripe";

type HallLayout = "theater" | "round-table";

type CheckoutRequest = {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    organization?: string;
    eventType?: string;
    eventDate?: string;
    startTime?: string;
    layout?: HallLayout;
    hours?: number;
    guestCount?: number;
    alcoholServed?: string;
    outsideCatering?: string;
    eventDescription?: string;
    specialRequests?: string;
    agreementAccepted?: boolean;
    termsRead?: boolean;
};

const DAMAGE_DEPOSIT = 100;

const HALL_PRICING: Record<
    HallLayout,
    {
        name: string;
        hourlyRate: number;
        capacity: number;
    }
> = {
    theater: {
        name: "Theater Setting",
        hourlyRate: 105,
        capacity: 100,
    },
    "round-table": {
        name: "Round-Table Setting",
        hourlyRate: 145,
        capacity: 50,
    },
};

function cleanMetadata(value: unknown, maxLength = 500): string {
    if (typeof value !== "string") {
        return "";
    }

    return value.trim().slice(0, maxLength);
}

export async function POST(request: NextRequest) {
    try {
        const body = (await request.json()) as CheckoutRequest;

        const layout: HallLayout =
            body.layout === "round-table" ? "round-table" : "theater";

        const hours = Number(body.hours);
        const guestCount = Number(body.guestCount);
        const pricing = HALL_PRICING[layout];

        if (!body.agreementAccepted || !body.termsRead) {
            return NextResponse.json(
                {
                    error:
                        "You must read and accept the rental agreement before payment.",
                },
                { status: 400 }
            );
        }

        if (!Number.isInteger(hours) || hours < 3 || hours > 12) {
            return NextResponse.json(
                {
                    error: "Rental duration must be between 3 and 12 hours.",
                },
                { status: 400 }
            );
        }

        if (
            !Number.isInteger(guestCount) ||
            guestCount < 1 ||
            guestCount > pricing.capacity
        ) {
            return NextResponse.json(
                {
                    error: `Guest count must be between 1 and ${pricing.capacity}.`,
                },
                { status: 400 }
            );
        }

        const firstName = cleanMetadata(body.firstName, 80);
        const lastName = cleanMetadata(body.lastName, 80);
        const email = cleanMetadata(body.email, 150);
        const phone = cleanMetadata(body.phone, 50);
        const eventType = cleanMetadata(body.eventType, 100);
        const eventDate = cleanMetadata(body.eventDate, 30);
        const startTime = cleanMetadata(body.startTime, 30);
        const eventDescription = cleanMetadata(
            body.eventDescription,
            500
        );

        if (
            !firstName ||
            !lastName ||
            !email ||
            !phone ||
            !eventType ||
            !eventDate ||
            !startTime ||
            !eventDescription
        ) {
            return NextResponse.json(
                {
                    error: "Please complete all required booking fields.",
                },
                { status: 400 }
            );
        }

        const rentalSubtotal = pricing.hourlyRate * hours;
        const siteUrl =
            process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;

        const session = await stripe.checkout.sessions.create({
            mode: "payment",

            customer_email: email,

            success_url:
                `${siteUrl}/payment/success` +
                "?session_id={CHECKOUT_SESSION_ID}",

            cancel_url: `${siteUrl}/payment/cancel`,

            billing_address_collection: "required",

            phone_number_collection: {
                enabled: true,
            },

            line_items: [
                {
                    quantity: hours,
                    price_data: {
                        currency: "cad",
                        unit_amount: pricing.hourlyRate * 100,
                        product_data: {
                            name: `${pricing.name} Hall Rental`,
                            description:
                                `${hours}-hour RoyalwayCC Space reservation ` +
                                `for ${eventDate} at ${startTime}`,
                        },
                    },
                },
                {
                    quantity: 1,
                    price_data: {
                        currency: "cad",
                        unit_amount: DAMAGE_DEPOSIT * 100,
                        product_data: {
                            name: "Refundable Damage Deposit",
                            description:
                                "Refundable subject to the RoyalwayCC Space Rental Agreement.",
                        },
                    },
                },
            ],

            metadata: {
                bookingStatus: "payment_pending",
                firstName,
                lastName,
                phone,
                organization: cleanMetadata(body.organization, 120),
                eventType,
                eventDate,
                startTime,
                layout,
                hours: String(hours),
                guestCount: String(guestCount),
                alcoholServed:
                    body.alcoholServed === "yes" ? "yes" : "no",
                outsideCatering:
                    body.outsideCatering === "yes" ? "yes" : "no",
                rentalSubtotal: String(rentalSubtotal),
                damageDeposit: String(DAMAGE_DEPOSIT),
                total: String(rentalSubtotal + DAMAGE_DEPOSIT),
                eventDescription,
                specialRequests: cleanMetadata(
                    body.specialRequests,
                    500
                ),
                agreementAcceptedAt: new Date().toISOString(),
            },
        });

        if (!session.url) {
            return NextResponse.json(
                {
                    error: "Stripe did not return a checkout URL.",
                },
                { status: 500 }
            );
        }

        return NextResponse.json({
            url: session.url,
        });
    } catch (error) {
        console.error("Stripe Checkout error:", error);

        return NextResponse.json(
            {
                error:
                    "We could not start the payment. Please try again.",
            },
            { status: 500 }
        );
    }
}