import { z } from "zod";

export const AGREEMENT_VERSION = "2026-07-21";

const optionalText = (maximum: number) =>
    z
        .union([
            z.string().trim().max(maximum),
            z.null(),
            z.undefined(),
        ])
        .transform((value) =>
            typeof value === "string" && value.length > 0
                ? value
                : null
        );

const yesNo = z.enum(["yes", "no"]);

export const bookingRequestSchema = z
    .object({
        firstName: z
            .string()
            .trim()
            .min(2, "First name is required.")
            .max(100),
        lastName: z
            .string()
            .trim()
            .min(2, "Last name is required.")
            .max(100),
        email: z
            .string()
            .trim()
            .toLowerCase()
            .email("Enter a valid email address.")
            .max(254),
        phone: z
            .string()
            .trim()
            .min(7, "Enter a valid phone number.")
            .max(40),
        organization: optionalText(180),

        eventType: z
            .string()
            .trim()
            .min(2, "Event type is required.")
            .max(120),
        eventDate: z
            .string()
            .regex(
                /^\d{4}-\d{2}-\d{2}$/,
                "Enter a valid event date."
            ),
        startTime: z
            .string()
            .regex(
                /^([01]\d|2[0-3]):[0-5]\d$/,
                "Enter a valid start time."
            ),
        layout: z.enum(["theater", "round-table"]),
        hours: z.coerce
            .number()
            .int()
            .min(3, "The minimum rental is 3 hours.")
            .max(
                12,
                "Contact RoyalwayCC Space for rentals over 12 hours."
            ),
        guestCount: z.coerce
            .number()
            .int()
            .min(1, "Guest count is required."),

        alcoholServed: yesNo,
        alcoholProvider: optionalText(180),
        alcoholPermitStatus: optionalText(120),

        outsideCatering: yesNo,
        cateringCompany: optionalText(180),
        catererPhone: optionalText(40),
        foodServiceType: optionalText(120),
        onSiteCooking: yesNo,

        eventDescription: z
            .string()
            .trim()
            .min(
                10,
                "Provide a short event description."
            )
            .max(3000),
        specialRequests: optionalText(3000),

        agreementAccepted: z
            .boolean()
            .refine((value) => value, {
                message:
                    "The rental agreement must be accepted.",
            }),
        agreementVersion: z
            .string()
            .trim()
            .default(AGREEMENT_VERSION),
    })
    .superRefine((booking, context) => {
        const maximumGuests =
            booking.layout === "theater" ? 100 : 50;

        if (booking.guestCount > maximumGuests) {
            context.addIssue({
                code: "custom",
                path: ["guestCount"],
                message:
                    booking.layout === "theater"
                        ? "The theater layout supports up to 100 guests."
                        : "The round-table layout supports up to 50 guests.",
            });
        }

        if (
            booking.alcoholServed === "yes" &&
            !booking.alcoholProvider
        ) {
            context.addIssue({
                code: "custom",
                path: ["alcoholProvider"],
                message:
                    "Provide the alcohol service provider.",
            });
        }

        if (
            booking.alcoholServed === "yes" &&
            !booking.alcoholPermitStatus
        ) {
            context.addIssue({
                code: "custom",
                path: ["alcoholPermitStatus"],
                message:
                    "Provide the alcohol permit or licence status.",
            });
        }

        if (
            booking.outsideCatering === "yes" &&
            !booking.cateringCompany
        ) {
            context.addIssue({
                code: "custom",
                path: ["cateringCompany"],
                message:
                    "Provide the catering company name.",
            });
        }

        const todayText = new Intl.DateTimeFormat(
            "en-CA",
            {
                timeZone: "America/New_York",
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
            }
        ).format(new Date());

        if (booking.eventDate < todayText) {
            context.addIssue({
                code: "custom",
                path: ["eventDate"],
                message:
                    "The event date cannot be in the past.",
            });
        }

        const [hour, minute] = booking.startTime
            .split(":")
            .map(Number);

        const endMinutes =
            hour * 60 + minute + booking.hours * 60;

        if (endMinutes > 24 * 60) {
            context.addIssue({
                code: "custom",
                path: ["hours"],
                message:
                    "The selected rental cannot continue past midnight.",
            });
        }
    });

export type BookingRequest = z.infer<
    typeof bookingRequestSchema
>;

export function calculateEndTime(
    startTime: string,
    hours: number
): string {
    const [hour, minute] = startTime
        .split(":")
        .map(Number);

    const endMinutes =
        hour * 60 + minute + hours * 60;

    const endHour = Math.floor(endMinutes / 60);
    const endMinute = endMinutes % 60;

    return `${String(endHour).padStart(
        2,
        "0"
    )}:${String(endMinute).padStart(2, "0")}:00`;
}

export function calculateBookingPrice(
    layout: BookingRequest["layout"],
    hours: number
) {
    const hourlyRateCents =
        layout === "theater" ? 10_500 : 14_500;

    const rentalSubtotalCents =
        hourlyRateCents * hours;

    const damageDepositCents = 10_000;

    return {
        hourlyRateCents,
        rentalSubtotalCents,
        damageDepositCents,
        totalAmountCents:
            rentalSubtotalCents +
            damageDepositCents,
        currency: "USD" as const,
    };
}
