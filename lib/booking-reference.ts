import "server-only";

import { randomBytes } from "crypto";

export function createBookingReference(
    eventDate: string
): string {
    const compactDate = eventDate.replaceAll("-", "");
    const suffix = randomBytes(3)
        .toString("hex")
        .toUpperCase();

    return `RWS-${compactDate}-${suffix}`;
}
