import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import { stripe } from "@/app/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
    const signature = request.headers.get("stripe-signature");
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!signature || !webhookSecret) {
        return NextResponse.json(
            {
                error: "Webhook configuration is missing.",
            },
            { status: 400 }
        );
    }

    const rawBody = await request.text();

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            rawBody,
            signature,
            webhookSecret
        );
    } catch (error) {
        console.error("Invalid Stripe webhook signature:", error);

        return NextResponse.json(
            {
                error: "Invalid webhook signature.",
            },
            { status: 400 }
        );
    }

    try {
        switch (event.type) {
            case "checkout.session.completed": {
                const session =
                    event.data.object as Stripe.Checkout.Session;

                if (session.payment_status === "paid") {
                    console.log("Royalway booking paid:", {
                        checkoutSessionId: session.id,
                        paymentIntentId: session.payment_intent,
                        customerEmail:
                            session.customer_details?.email ||
                            session.customer_email,
                        amountTotal: session.amount_total,
                        metadata: session.metadata,
                    });

                    /*
                     * NEXT DATABASE STEP:
                     *
                     * Insert or update the booking in MySQL here.
                     * Use session.id as a UNIQUE value so Stripe webhook
                     * retries cannot create duplicate bookings.
                     */
                }

                break;
            }

            case "checkout.session.async_payment_succeeded": {
                const session =
                    event.data.object as Stripe.Checkout.Session;

                console.log(
                    "Delayed Stripe payment succeeded:",
                    session.id
                );

                break;
            }

            case "checkout.session.async_payment_failed": {
                const session =
                    event.data.object as Stripe.Checkout.Session;

                console.error(
                    "Delayed Stripe payment failed:",
                    session.id
                );

                break;
            }

            default:
                console.log(`Unhandled Stripe event: ${event.type}`);
        }

        return NextResponse.json({
            received: true,
        });
    } catch (error) {
        console.error("Stripe webhook processing failed:", error);

        return NextResponse.json(
            {
                error: "Webhook processing failed.",
            },
            { status: 500 }
        );
    }
}