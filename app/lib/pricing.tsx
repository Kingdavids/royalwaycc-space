export type HallLayout = "theater" | "round-table";

export const MINIMUM_HOURS = 3;
export const DAMAGE_DEPOSIT = 100;

export const hallPricing = {
    theater: {
        name: "Theater Setting",
        rate: 105,
        capacity: "Up to 100 chairs",
    },
    "round-table": {
        name: "Round-Table Setting",
        rate: 145,
        capacity: "Up to 50 guests",
    },
} as const;

export function calculateBookingTotal(
    layout: HallLayout,
    requestedHours: number
) {
    const hours = Math.max(requestedHours, MINIMUM_HOURS);
    const hourlyRate = hallPricing[layout].rate;
    const rentalSubtotal = hourlyRate * hours;
    const total = rentalSubtotal + DAMAGE_DEPOSIT;

    return {
        hours,
        hourlyRate,
        rentalSubtotal,
        damageDeposit: DAMAGE_DEPOSIT,
        total,
    };
}