import "server-only";

import Stripe from "stripe";

import { env } from "@/lib/env";

declare global {
    // eslint-disable-next-line no-var
    var royalwayStripe: Stripe | undefined;
}

export const stripe =
    global.royalwayStripe ??
    new Stripe(env.stripeSecretKey, {
        maxNetworkRetries: 2,
        timeout: 20_000,
    });

if (process.env.NODE_ENV !== "production") {
    global.royalwayStripe = stripe;
}
