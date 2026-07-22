import "server-only";

function required(name: string): string {
    const value = process.env[name]?.trim();

    if (!value) {
        throw new Error(
            `Missing required environment variable: ${name}`
        );
    }

    return value;
}

function normalizedSiteUrl(value: string): string {
    return value.replace(/\/+$/, "");
}

export const env = {
    get siteUrl() {
        return normalizedSiteUrl(
            required("NEXT_PUBLIC_SITE_URL")
        );
    },

    get databaseHost() {
        return required("DB_HOST");
    },

    get databasePort() {
        const value = Number(
            process.env.DB_PORT?.trim() || "3306"
        );

        if (!Number.isInteger(value) || value <= 0) {
            throw new Error(
                "DB_PORT must be a positive integer."
            );
        }

        return value;
    },

    get databaseName() {
        return required("DB_NAME");
    },

    get databaseUser() {
        return required("DB_USER");
    },

    get databasePassword() {
        return required("DB_PASSWORD");
    },

    get stripeSecretKey() {
        return required("STRIPE_SECRET_KEY");
    },

    get stripeWebhookSecret() {
        return required("STRIPE_WEBHOOK_SECRET");
    },

    get bookingAdminEmail() {
        return required("BOOKING_ADMIN_EMAIL");
    },
};
