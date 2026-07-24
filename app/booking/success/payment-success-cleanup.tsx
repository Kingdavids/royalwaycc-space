"use client";

import { useEffect } from "react";

const AGREEMENT_STORAGE_KEY =
    "royalwaycc-space-agreement-read-v2";

const BOOKING_DRAFT_STORAGE_KEY =
    "royalwaycc-space-booking-draft-v1";

export default function PaymentSuccessCleanup() {
    useEffect(() => {
        window.localStorage.removeItem(
            AGREEMENT_STORAGE_KEY
        );
        window.localStorage.removeItem(
            BOOKING_DRAFT_STORAGE_KEY
        );
    }, []);

    return null;
}