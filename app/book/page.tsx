"use client";

import {
    FormEvent,
    ReactNode,
    Suspense,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { DayPicker } from "@daypicker/react";
import {
    AlertCircle,
    ArrowLeft,
    CalendarDays,
    Check,
    Clock3,
    CreditCard,
    LockKeyhole,
    ShieldCheck,
    UsersRound,
} from "lucide-react";

import {
    calculateBookingTotal,
    hallPricing,
    type HallLayout,
} from "@/app/lib/pricing";

type FormErrors = {
    eventDate?: string;
    startTime?: string;
    guestCount?: string;
    agreement?: string;
};

type CheckoutResponse = {
    url?: string;
    error?: string;
};

const AGREEMENT_STORAGE_KEY =
    "royalwaycc-space-agreement-read-v2";

const AGREEMENT_CONFIRMATION_LIMIT_MS =
    30 * 60 * 1000;

function getTodayDate(): string {
    const today = new Date();
    const timezoneOffset = today.getTimezoneOffset() * 60_000;

    return new Date(today.getTime() - timezoneOffset)
        .toISOString()
        .split("T")[0];
}

function calculateEndTime(
    startTime: string,
    durationHours: number
): string {
    if (!startTime) {
        return "";
    }

    const [startHour, startMinute] = startTime
        .split(":")
        .map(Number);

    const totalMinutes =
        startHour * 60 +
        startMinute +
        durationHours * 60;

    const endDayOffset = Math.floor(totalMinutes / 1440);
    const endMinutes = totalMinutes % 1440;

    const endHour = Math.floor(endMinutes / 60);
    const endMinute = endMinutes % 60;

    const formattedTime = new Date(
        2000,
        0,
        1,
        endHour,
        endMinute
    ).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
    });

    return endDayOffset > 0
        ? `${formattedTime} · next day`
        : formattedTime;
}


function formatDateValue(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function parseDateValue(value: string): Date | undefined {
    if (!value) {
        return undefined;
    }

    const [year, month, day] = value.split("-").map(Number);

    if (!year || !month || !day) {
        return undefined;
    }

    return new Date(year, month - 1, day);
}

function formatDisplayDate(value: string): string {
    const date = parseDateValue(value);

    if (!date) {
        return "Select event date";
    }

    return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "long",
        day: "numeric",
        year: "numeric",
    });
}

function EventDatePicker({
                             value,
                             minimumDate,
                             error,
                             onChange,
                         }: {
    value: string;
    minimumDate: string;
    error?: string;
    onChange: (value: string) => void;
}) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isOpen, setIsOpen] = useState(false);

    const selectedDate = parseDateValue(value);
    const firstAllowedDate =
        parseDateValue(minimumDate) ?? new Date();

    const finalAllowedDate = new Date(
        firstAllowedDate.getFullYear() + 2,
        firstAllowedDate.getMonth(),
        firstAllowedDate.getDate()
    );

    useEffect(() => {
        function handlePointerDown(event: PointerEvent) {
            if (
                containerRef.current &&
                !containerRef.current.contains(
                    event.target as Node
                )
            ) {
                setIsOpen(false);
            }
        }

        function handleEscape(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setIsOpen(false);
            }
        }

        document.addEventListener(
            "pointerdown",
            handlePointerDown
        );
        document.addEventListener(
            "keydown",
            handleEscape
        );

        return () => {
            document.removeEventListener(
                "pointerdown",
                handlePointerDown
            );
            document.removeEventListener(
                "keydown",
                handleEscape
            );
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="royalway-date-picker"
        >
            <input
                type="hidden"
                name="eventDate"
                value={value}
            />

            <button
                type="button"
                onClick={() =>
                    setIsOpen((current) => !current)
                }
                aria-haspopup="dialog"
                aria-expanded={isOpen}
                aria-invalid={Boolean(error)}
                className={`booking-input royalway-date-trigger ${
                    error
                        ? "royalway-date-trigger-error"
                        : ""
                }`}
            >
                <span
                    className={
                        value
                            ? "royalway-date-value"
                            : "royalway-date-placeholder"
                    }
                >
                    {formatDisplayDate(value)}
                </span>

                <CalendarDays
                    size={19}
                    aria-hidden="true"
                    className="royalway-date-icon"
                />
            </button>

            {isOpen && (
                <div
                    role="dialog"
                    aria-label="Choose event date"
                    className="royalway-calendar-popover"
                >
                    <DayPicker
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => {
                            if (!date) {
                                return;
                            }

                            onChange(formatDateValue(date));
                            setIsOpen(false);
                        }}
                        disabled={{
                            before: firstAllowedDate,
                        }}
                        startMonth={firstAllowedDate}
                        endMonth={finalAllowedDate}
                        showOutsideDays
                        fixedWeeks
                        className="royalway-calendar"
                    />

                    <div className="royalway-calendar-footer">
                        <span>
                            Available dates begin today.
                        </span>

                        {value && (
                            <button
                                type="button"
                                onClick={() => onChange("")}
                                className="royalway-calendar-clear"
                            >
                                Clear date
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}


function formatTimeLabel(value: string): string {
    if (!value) {
        return "Select start time";
    }

    return new Date(
        `2000-01-01T${value}:00`
    ).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
    });
}

function buildTimeOptions(): {
    value: string;
    label: string;
    period: "Morning" | "Afternoon" | "Evening";
}[] {
    const options: {
        value: string;
        label: string;
        period: "Morning" | "Afternoon" | "Evening";
    }[] = [];

    for (let hour = 8; hour <= 23; hour++) {
        for (const minute of [0, 30]) {
            if (hour === 23 && minute === 30) {
                continue;
            }

            const value =
                `${String(hour).padStart(2, "0")}:` +
                `${String(minute).padStart(2, "0")}`;

            const label = new Date(
                `2000-01-01T${value}:00`
            ).toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
            });

            const period =
                hour < 12
                    ? "Morning"
                    : hour < 17
                        ? "Afternoon"
                        : "Evening";

            options.push({
                value,
                label,
                period,
            });
        }
    }

    return options;
}

const BOOKING_TIME_OPTIONS = buildTimeOptions();

function EventTimePicker({
                             value,
                             error,
                             onChange,
                         }: {
    value: string;
    error?: string;
    onChange: (value: string) => void;
}) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        function handlePointerDown(event: PointerEvent) {
            if (
                containerRef.current &&
                !containerRef.current.contains(
                    event.target as Node
                )
            ) {
                setIsOpen(false);
            }
        }

        function handleEscape(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setIsOpen(false);
            }
        }

        document.addEventListener(
            "pointerdown",
            handlePointerDown
        );
        document.addEventListener(
            "keydown",
            handleEscape
        );

        return () => {
            document.removeEventListener(
                "pointerdown",
                handlePointerDown
            );
            document.removeEventListener(
                "keydown",
                handleEscape
            );
        };
    }, []);

    const periods = [
        "Morning",
        "Afternoon",
        "Evening",
    ] as const;

    return (
        <div
            ref={containerRef}
            className="royalway-time-picker"
        >
            <input
                type="hidden"
                name="startTime"
                value={value}
            />

            <button
                type="button"
                onClick={() =>
                    setIsOpen((current) => !current)
                }
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-invalid={Boolean(error)}
                className={`booking-input royalway-time-trigger ${
                    error
                        ? "royalway-time-trigger-error"
                        : ""
                }`}
            >
                <span
                    className={
                        value
                            ? "royalway-time-value"
                            : "royalway-time-placeholder"
                    }
                >
                    {formatTimeLabel(value)}
                </span>

                <Clock3
                    size={19}
                    aria-hidden="true"
                    className="royalway-time-icon"
                />
            </button>

            {isOpen && (
                <div
                    role="listbox"
                    aria-label="Choose start time"
                    className="royalway-time-popover"
                >
                    <div className="royalway-time-heading">
                        <div>
                            <p className="royalway-time-eyebrow">
                                Event start
                            </p>

                            <p className="royalway-time-title">
                                Choose a time
                            </p>
                        </div>

                        {value && (
                            <button
                                type="button"
                                onClick={() => onChange("")}
                                className="royalway-time-clear"
                            >
                                Clear
                            </button>
                        )}
                    </div>

                    <div className="royalway-time-groups">
                        {periods.map((period) => (
                            <section
                                key={period}
                                className="royalway-time-group"
                            >
                                <p className="royalway-time-period">
                                    {period}
                                </p>

                                <div className="royalway-time-grid">
                                    {BOOKING_TIME_OPTIONS
                                        .filter(
                                            (option) =>
                                                option.period ===
                                                period
                                        )
                                        .map((option) => {
                                            const isSelected =
                                                value ===
                                                option.value;

                                            return (
                                                <button
                                                    key={
                                                        option.value
                                                    }
                                                    type="button"
                                                    role="option"
                                                    aria-selected={
                                                        isSelected
                                                    }
                                                    onClick={() => {
                                                        onChange(
                                                            option.value
                                                        );
                                                        setIsOpen(
                                                            false
                                                        );
                                                    }}
                                                    className={`royalway-time-option ${
                                                        isSelected
                                                            ? "royalway-time-option-selected"
                                                            : ""
                                                    }`}
                                                >
                                                    {
                                                        option.label
                                                    }
                                                </button>
                                            );
                                        })}
                                </div>
                            </section>
                        ))}
                    </div>

                    <p className="royalway-time-note">
                        Times are shown in 30-minute intervals.
                    </p>
                </div>
            )}
        </div>
    );
}

function BookingForm() {
    const searchParams = useSearchParams();

    const requestedLayout = searchParams.get("layout");
    const requestedHours = Number(searchParams.get("hours"));

    const initialLayout: HallLayout =
        requestedLayout === "round-table"
            ? "round-table"
            : "theater";

    const initialHours =
        Number.isFinite(requestedHours) &&
        requestedHours >= 3
            ? Math.min(requestedHours, 12)
            : 3;

    const today = useMemo(() => getTodayDate(), []);

    const [layout, setLayout] =
        useState<HallLayout>(initialLayout);

    const [hours, setHours] = useState(initialHours);
    const [eventDate, setEventDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [guestCount, setGuestCount] = useState("");

    const [agreementAccepted, setAgreementAccepted] =
        useState(false);

    const [termsRead, setTermsRead] = useState(false);
    const [isSubmitting, setIsSubmitting] =
        useState(false);

    const [paymentError, setPaymentError] =
        useState("");

    const [alcoholServed, setAlcoholServed] =
        useState("no");

    const [outsideCatering, setOutsideCatering] =
        useState("no");

    const [errors, setErrors] =
        useState<FormErrors>({});

    useEffect(() => {
        function refreshAgreementStatus() {
            const storedConfirmation =
                window.localStorage.getItem(
                    AGREEMENT_STORAGE_KEY
                );

            if (!storedConfirmation) {
                setTermsRead(false);
                setAgreementAccepted(false);
                return;
            }

            const confirmationTime = Number(
                storedConfirmation
            );

            const confirmationIsValid =
                Number.isFinite(confirmationTime) &&
                Date.now() - confirmationTime <=
                AGREEMENT_CONFIRMATION_LIMIT_MS;

            /*
             * Consume the confirmation immediately so
             * it cannot unlock future reservations.
             */
            window.localStorage.removeItem(
                AGREEMENT_STORAGE_KEY
            );

            if (confirmationIsValid) {
                setTermsRead(true);
                setAgreementAccepted(false);

                setErrors((current) => ({
                    ...current,
                    agreement: undefined,
                }));

                return;
            }

            setTermsRead(false);
            setAgreementAccepted(false);
        }

        refreshAgreementStatus();

        window.addEventListener(
            "focus",
            refreshAgreementStatus
        );

        window.addEventListener(
            "storage",
            refreshAgreementStatus
        );

        return () => {
            window.removeEventListener(
                "focus",
                refreshAgreementStatus
            );

            window.removeEventListener(
                "storage",
                refreshAgreementStatus
            );
        };
    }, []);

    const estimate = useMemo(
        () => calculateBookingTotal(layout, hours),
        [layout, hours]
    );

    const maximumGuests =
        layout === "theater" ? 100 : 50;

    const calculatedEndTime = useMemo(
        () => calculateEndTime(startTime, hours),
        [startTime, hours]
    );

    function validateBooking(): FormErrors {
        const newErrors: FormErrors = {};
        const guestTotal = Number(guestCount);

        if (!eventDate) {
            newErrors.eventDate =
                "Select an event date.";
        } else if (eventDate < today) {
            newErrors.eventDate =
                "Past dates cannot be booked.";
        }

        if (!startTime) {
            newErrors.startTime =
                "Select a start time.";
        }

        if (eventDate === today && startTime) {
            const selectedStart = new Date(
                `${eventDate}T${startTime}:00`
            );

            if (
                selectedStart.getTime() <= Date.now()
            ) {
                newErrors.startTime =
                    "The start time must be later than the current time.";
            }
        }

        if (!guestCount || guestTotal < 1) {
            newErrors.guestCount =
                "Enter the expected number of guests.";
        } else if (guestTotal > maximumGuests) {
            newErrors.guestCount =
                layout === "theater"
                    ? "Theater setting allows a maximum of 100 guests."
                    : "Round-table setting allows a maximum of 50 guests.";
        }

        if (!termsRead || !agreementAccepted) {
            newErrors.agreement =
                "Read the rental agreement to the end and accept it before continuing.";
        }

        return newErrors;
    }

    function handleLayoutChange(
        selectedLayout: HallLayout
    ) {
        setLayout(selectedLayout);

        const newMaximum =
            selectedLayout === "theater"
                ? 100
                : 50;

        if (
            guestCount &&
            Number(guestCount) > newMaximum
        ) {
            setGuestCount("");
        }

        setErrors((currentErrors) => ({
            ...currentErrors,
            guestCount: undefined,
        }));
    }


    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        const form = event.currentTarget;
        const newErrors = validateBooking();

        if (!form.checkValidity()) {
            form.reportValidity();
        }

        if (
            !form.checkValidity() ||
            Object.keys(newErrors).length > 0
        ) {
            setErrors(newErrors);
            setPaymentError("");

            const firstInvalidField =
                form.querySelector<HTMLElement>(
                    ":invalid"
                );

            firstInvalidField?.focus();
            return;
        }

        setErrors({});
        setPaymentError("");
        setIsSubmitting(true);

        try {
            const formData = new FormData(form);

            const response = await fetch(
                "/api/checkout",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        firstName:
                            formData.get("firstName"),
                        lastName:
                            formData.get("lastName"),
                        email:
                            formData.get("email"),
                        phone:
                            formData.get("phone"),
                        organization:
                            formData.get(
                                "organization"
                            ),
                        eventType:
                            formData.get("eventType"),
                        eventDate,
                        startTime,
                        layout,
                        hours,
                        guestCount:
                            Number(guestCount),
                        alcoholServed,
                        alcoholProvider:
                            formData.get(
                                "alcoholProvider"
                            ),
                        alcoholPermitStatus:
                            formData.get(
                                "alcoholPermitStatus"
                            ),
                        outsideCatering,
                        cateringCompany:
                            formData.get(
                                "cateringCompany"
                            ),
                        catererPhone:
                            formData.get(
                                "catererPhone"
                            ),
                        foodServiceType:
                            formData.get(
                                "foodServiceType"
                            ),
                        onSiteCooking:
                            formData.get(
                                "onSiteCooking"
                            ),
                        eventDescription:
                            formData.get(
                                "eventDescription"
                            ),
                        specialRequests:
                            formData.get(
                                "specialRequests"
                            ),
                        agreementAccepted,
                        termsRead,
                    }),
                }
            );

            const data =
                (await response.json()) as CheckoutResponse;

            if (!response.ok || !data.url) {
                throw new Error(
                    data.error ||
                    "Unable to start the secure payment."
                );
            }

            window.location.assign(data.url);
        } catch (error) {
            setPaymentError(
                error instanceof Error
                    ? error.message
                    : "Unable to start the secure payment."
            );

            setIsSubmitting(false);
        }
    }

    return (
        <main className="min-h-screen bg-[#f7f4ed] px-5 py-8 text-[#171717] dark:bg-[#10120f] dark:text-[#f7f1e5] md:px-8 md:py-14">
            <div className="mx-auto max-w-7xl">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 font-bold text-[#6f675a] transition hover:text-[#a77c25] dark:text-white/60"
                >
                    <ArrowLeft size={18} />
                    Return to venue
                </Link>

                <div className="mt-9 grid gap-9 lg:grid-cols-[1fr_420px]">
                    <section>
                        <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-[#9d7623] dark:text-[#d8bd72]">
                            Secure Reservation
                        </p>

                        <h1 className="mt-4 max-w-3xl text-5xl font-bold leading-[0.94] tracking-[-0.05em] md:text-7xl">
                            Tell us about your event.
                        </h1>

                        <p className="mt-5 max-w-2xl text-lg leading-8 text-[#716a5e] dark:text-white/60">
                            Complete the required details,
                            review the rental agreement, and
                            proceed to secure online payment.
                        </p>

                        <form
                            onSubmit={handleSubmit}
                            noValidate
                            className="mt-10 rounded-[36px] border border-black/8 bg-white p-5 shadow-[0_30px_90px_rgba(0,0,0,.08)] dark:border-white/10 dark:bg-[#191b17] md:p-9"
                        >
                            <div className="grid gap-6 sm:grid-cols-2">
                                <FormField
                                    label="First Name"
                                    required
                                >
                                    <input
                                        required
                                        name="firstName"
                                        autoComplete="given-name"
                                        className="booking-input"
                                    />
                                </FormField>

                                <FormField
                                    label="Last Name"
                                    required
                                >
                                    <input
                                        required
                                        name="lastName"
                                        autoComplete="family-name"
                                        className="booking-input"
                                    />
                                </FormField>

                                <FormField
                                    label="Email Address"
                                    required
                                >
                                    <input
                                        required
                                        type="email"
                                        name="email"
                                        autoComplete="email"
                                        className="booking-input"
                                    />
                                </FormField>

                                <FormField
                                    label="Phone Number"
                                    required
                                >
                                    <input
                                        required
                                        type="tel"
                                        name="phone"
                                        autoComplete="tel"
                                        className="booking-input"
                                    />
                                </FormField>

                                <FormField label="Organization">
                                    <input
                                        name="organization"
                                        className="booking-input"
                                        placeholder="Optional"
                                    />
                                </FormField>

                                <FormField
                                    label="Event Type"
                                    required
                                >
                                    <select
                                        required
                                        name="eventType"
                                        defaultValue=""
                                        className="booking-input"
                                    >
                                        <option
                                            value=""
                                            disabled
                                        >
                                            Select event type
                                        </option>
                                        <option>
                                            Church Event
                                        </option>
                                        <option>
                                            Corporate Meeting
                                        </option>
                                        <option>
                                            Training or Seminar
                                        </option>
                                        <option>
                                            Birthday Party
                                        </option>
                                        <option>
                                            Baby Shower
                                        </option>
                                        <option>
                                            Reception
                                        </option>
                                        <option>
                                            Community Event
                                        </option>
                                        <option>
                                            Private Celebration
                                        </option>
                                        <option>
                                            Other
                                        </option>
                                    </select>
                                </FormField>

                                <FormField
                                    label="Event Date"
                                    required
                                    error={errors.eventDate}
                                >
                                    <EventDatePicker
                                        value={eventDate}
                                        minimumDate={today}
                                        error={errors.eventDate}
                                        onChange={(selectedDate) => {
                                            setEventDate(
                                                selectedDate
                                            );

                                            setErrors(
                                                (current) => ({
                                                    ...current,
                                                    eventDate:
                                                    undefined,
                                                })
                                            );
                                        }}
                                    />
                                </FormField>

                                <FormField
                                    label="Start Time"
                                    required
                                    error={errors.startTime}
                                >
                                    <EventTimePicker
                                        value={startTime}
                                        error={errors.startTime}
                                        onChange={(selectedTime) => {
                                            setStartTime(
                                                selectedTime
                                            );

                                            setErrors(
                                                (current) => ({
                                                    ...current,
                                                    startTime:
                                                    undefined,
                                                })
                                            );
                                        }}
                                    />
                                </FormField>

                                <FormField
                                    label="Hall Setup"
                                    required
                                >
                                    <select
                                        required
                                        name="layout"
                                        value={layout}
                                        onChange={(event) =>
                                            handleLayoutChange(
                                                event.target
                                                    .value as HallLayout
                                            )
                                        }
                                        className="booking-input"
                                    >
                                        <option value="theater">
                                            Theater Setting —
                                            $105/hour
                                        </option>
                                        <option value="round-table">
                                            Round-Table Setting —
                                            $145/hour
                                        </option>
                                    </select>
                                </FormField>

                                <FormField
                                    label="Rental Duration"
                                    required
                                >
                                    <select
                                        required
                                        name="hours"
                                        value={hours}
                                        onChange={(event) =>
                                            setHours(
                                                Number(
                                                    event.target
                                                        .value
                                                )
                                            )
                                        }
                                        className="booking-input"
                                    >
                                        {Array.from(
                                            { length: 10 },
                                            (_, index) =>
                                                index + 3
                                        ).map((hour) => (
                                            <option
                                                key={hour}
                                                value={hour}
                                            >
                                                {hour} hours
                                            </option>
                                        ))}
                                    </select>
                                </FormField>

                                <FormField
                                    label="Expected Guests"
                                    required
                                    error={
                                        errors.guestCount
                                    }
                                    helper={`Maximum ${maximumGuests} guests for this setup.`}
                                >
                                    <input
                                        required
                                        type="number"
                                        name="guestCount"
                                        min="1"
                                        max={maximumGuests}
                                        value={guestCount}
                                        onChange={(event) => {
                                            setGuestCount(
                                                event.target
                                                    .value
                                            );

                                            setErrors(
                                                (current) => ({
                                                    ...current,
                                                    guestCount:
                                                    undefined,
                                                })
                                            );
                                        }}
                                        aria-invalid={Boolean(
                                            errors.guestCount
                                        )}
                                        placeholder={`Maximum ${maximumGuests}`}
                                        className="booking-input"
                                    />
                                </FormField>

                                <FormField label="Event End Time">
                                    <div className="flex min-h-14 items-center rounded-2xl border border-[#ded7ca] bg-[#f5f2eb] px-4 font-bold text-[#746d60] dark:border-white/10 dark:bg-white/[0.04] dark:text-white/55">
                                        {calculatedEndTime ||
                                            "Select a start time"}
                                    </div>
                                </FormField>

                                <FormField
                                    label="Will Alcohol Be Served?"
                                    required
                                >
                                    <select
                                        required
                                        name="alcoholServed"
                                        value={alcoholServed}
                                        onChange={(event) =>
                                            setAlcoholServed(
                                                event.target
                                                    .value
                                            )
                                        }
                                        className="booking-input"
                                    >
                                        <option value="no">
                                            No
                                        </option>
                                        <option value="yes">
                                            Yes
                                        </option>
                                    </select>
                                </FormField>

                                <FormField
                                    label="Outside Catering?"
                                    required
                                >
                                    <select
                                        required
                                        name="outsideCatering"
                                        value={outsideCatering}
                                        onChange={(event) =>
                                            setOutsideCatering(
                                                event.target
                                                    .value
                                            )
                                        }
                                        className="booking-input"
                                    >
                                        <option value="no">
                                            No
                                        </option>
                                        <option value="yes">
                                            Yes
                                        </option>
                                    </select>
                                </FormField>
                            </div>

                            {alcoholServed === "yes" && (
                                <div className="mt-6 rounded-[26px] border border-[#d7bd76] bg-[#fff8e3] p-5 dark:border-[#d7bd76]/30 dark:bg-[#2a271c]">
                                    <p className="font-extrabold text-[#654c17] dark:text-[#ead9a2]">
                                        Alcohol service
                                        information
                                    </p>

                                    <p className="mt-2 text-sm leading-7 text-[#6f5d37] dark:text-white/60">
                                        Provide details of the
                                        person or licensed vendor
                                        responsible for alcohol
                                        service. Required permits,
                                        licensing, and insurance
                                        must be submitted before
                                        the event.
                                    </p>

                                    <div className="mt-5 grid gap-5 sm:grid-cols-2">
                                        <FormField
                                            label="Alcohol Service Provider"
                                            required
                                        >
                                            <input
                                                required
                                                name="alcoholProvider"
                                                className="booking-input"
                                                placeholder="Bartender, caterer, organization, or host"
                                            />
                                        </FormField>

                                        <FormField
                                            label="License or Permit Status"
                                            required
                                        >
                                            <select
                                                required
                                                name="alcoholPermitStatus"
                                                defaultValue=""
                                                className="booking-input"
                                            >
                                                <option
                                                    value=""
                                                    disabled
                                                >
                                                    Select
                                                    status
                                                </option>
                                                <option>
                                                    Not required
                                                    for this
                                                    event
                                                </option>
                                                <option>
                                                    Application
                                                    in progress
                                                </option>
                                                <option>
                                                    License or
                                                    permit
                                                    obtained
                                                </option>
                                                <option>
                                                    Licensed
                                                    caterer will
                                                    provide
                                                    service
                                                </option>
                                                <option>
                                                    Unsure —
                                                    assistance
                                                    required
                                                </option>
                                            </select>
                                        </FormField>
                                    </div>
                                </div>
                            )}

                            {outsideCatering === "yes" && (
                                <div className="mt-6 rounded-[26px] border border-black/8 bg-[#f8f5ee] p-5 dark:border-white/10 dark:bg-white/[0.04]">
                                    <p className="font-extrabold">
                                        Outside caterer details
                                    </p>

                                    <div className="mt-5 grid gap-5 sm:grid-cols-2">
                                        <FormField
                                            label="Catering Company"
                                            required
                                        >
                                            <input
                                                required
                                                name="cateringCompany"
                                                className="booking-input"
                                            />
                                        </FormField>

                                        <FormField
                                            label="Caterer Phone Number"
                                            required
                                        >
                                            <input
                                                required
                                                type="tel"
                                                name="catererPhone"
                                                className="booking-input"
                                            />
                                        </FormField>

                                        <FormField label="Type of Food Service">
                                            <select
                                                name="foodServiceType"
                                                defaultValue="Drop-off catering"
                                                className="booking-input"
                                            >
                                                <option>
                                                    Drop-off
                                                    catering
                                                </option>
                                                <option>
                                                    Buffet
                                                    service
                                                </option>
                                                <option>
                                                    Plated
                                                    service
                                                </option>
                                                <option>
                                                    Food stations
                                                </option>
                                                <option>
                                                    Other
                                                </option>
                                            </select>
                                        </FormField>

                                        <FormField label="On-Site Cooking">
                                            <select
                                                name="onSiteCooking"
                                                defaultValue="No"
                                                className="booking-input"
                                            >
                                                <option>
                                                    No
                                                </option>
                                                <option>
                                                    Yes —
                                                    approval
                                                    required
                                                </option>
                                            </select>
                                        </FormField>
                                    </div>
                                </div>
                            )}

                            <div className="mt-6">
                                <FormField
                                    label="Event Description"
                                    required
                                >
                                    <textarea
                                        required
                                        name="eventDescription"
                                        rows={5}
                                        className="booking-input min-h-36 resize-y py-4"
                                        placeholder="Describe your event, activities, decorations, vendors, catering, music, and special requirements."
                                    />
                                </FormField>
                            </div>

                            <div className="mt-6">
                                <FormField label="Special Requests">
                                    <textarea
                                        name="specialRequests"
                                        rows={4}
                                        className="booking-input min-h-28 resize-y py-4"
                                        placeholder="Accessibility needs, setup requests, equipment, arrival instructions, or other details."
                                    />
                                </FormField>
                            </div>

                            <label
                                className={`mt-8 flex items-start gap-4 rounded-[24px] border p-5 transition ${
                                    errors.agreement
                                        ? "border-red-400 bg-red-50 dark:border-red-400/40 dark:bg-red-950/20"
                                        : termsRead
                                            ? "cursor-pointer border-[#ddd4c3] bg-[#fbf7ed] dark:border-white/10 dark:bg-white/[0.04]"
                                            : "cursor-not-allowed border-[#e3ddcf] bg-[#f5f1e8] opacity-75 dark:border-white/8 dark:bg-white/[0.025]"
                                }`}
                            >
                                <input
                                    type="checkbox"
                                    checked={agreementAccepted}
                                    disabled={!termsRead}
                                    onChange={(event) => {
                                        setAgreementAccepted(
                                            event.target.checked
                                        );

                                        if (
                                            event.target.checked
                                        ) {
                                            setErrors(
                                                (current) => ({
                                                    ...current,
                                                    agreement:
                                                    undefined,
                                                })
                                            );
                                        }
                                    }}
                                    aria-invalid={Boolean(
                                        errors.agreement
                                    )}
                                    className="mt-1 h-5 w-5 shrink-0 accent-[#a77c25] disabled:cursor-not-allowed"
                                />

                                <span className="text-sm leading-7 text-[#625c51] dark:text-white/65">
                                    I have reviewed and agree
                                    to the{" "}
                                    <Link
                                        href="/agreement"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-extrabold text-[#8d681d] underline underline-offset-4 dark:text-[#e0c373]"
                                    >
                                        RoyalwayCC Space Rental
                                        Agreement
                                    </Link>
                                    , including the payment,
                                    cancellation, capacity,
                                    damage, cleaning, overtime,
                                    alcohol, catering, and
                                    facility-use terms.

                                    {!termsRead && (
                                        <span className="mt-2 block text-xs font-bold text-[#8d681d] dark:text-[#e0c373]">
                                            Open the agreement,
                                            read to the end, and
                                            confirm that you have
                                            read it to unlock this
                                            checkbox.
                                        </span>
                                    )}

                                    {termsRead && (
                                        <span className="mt-2 flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                                            <Check size={14} />
                                            Agreement read —
                                            checkbox unlocked.
                                        </span>
                                    )}
                                </span>
                            </label>

                            {errors.agreement && (
                                <div
                                    role="alert"
                                    className="mt-4 flex items-start gap-2 rounded-[18px] border border-red-300 bg-red-50 px-5 py-4 text-sm font-bold text-red-700 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-200"
                                >
                                    <AlertCircle
                                        size={17}
                                        className="mt-0.5 shrink-0"
                                    />
                                    {
                                        errors.agreement
                                    }
                                </div>
                            )}

                            {paymentError && (
                                <div
                                    role="alert"
                                    className="mt-4 flex items-start gap-2 rounded-[18px] border border-red-300 bg-red-50 px-5 py-4 text-sm font-bold text-red-700 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-200"
                                >
                                    <AlertCircle
                                        size={17}
                                        className="mt-0.5 shrink-0"
                                    />
                                    {paymentError}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={
                                    !termsRead ||
                                    !agreementAccepted ||
                                    isSubmitting
                                }
                                className="mt-6 flex min-h-16 w-full items-center justify-center gap-3 rounded-full bg-[#171914] px-7 font-extrabold text-white transition hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 dark:bg-[#dfc477] dark:text-[#171914]"
                            >
                                <CreditCard size={20} />

                                {isSubmitting
                                    ? "Opening Secure Payment…"
                                    : "Check Availability & Continue"}
                            </button>

                            <p className="mt-4 flex items-center justify-center gap-2 text-center text-sm text-[#777064] dark:text-white/45">
                                <LockKeyhole size={15} />
                                Availability will be verified
                                before Stripe payment begins.
                            </p>
                        </form>
                    </section>

                    <aside className="lg:sticky lg:top-8 lg:self-start">
                        <div className="rounded-[34px] bg-[#171914] p-6 text-white shadow-[0_35px_100px_rgba(0,0,0,.18)] md:p-8">
                            <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-[#d8bd72]">
                                Reservation Summary
                            </p>

                            <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em]">
                                RoyalwayCC Space
                            </h2>

                            <div className="mt-7 space-y-5 border-y border-white/10 py-7">
                                <SummaryRow
                                    icon={
                                        <UsersRound
                                            size={18}
                                        />
                                    }
                                    label="Hall arrangement"
                                    value={
                                        hallPricing[
                                            layout
                                            ].name
                                    }
                                />

                                <SummaryRow
                                    icon={
                                        <Clock3
                                            size={18}
                                        />
                                    }
                                    label="Rental duration"
                                    value={`${estimate.hours} hours`}
                                />

                                <SummaryRow
                                    icon={
                                        <CalendarDays
                                            size={18}
                                        />
                                    }
                                    label="Capacity"
                                    value={
                                        hallPricing[
                                            layout
                                            ].capacity
                                    }
                                />

                                {eventDate && (
                                    <SummaryRow
                                        icon={
                                            <CalendarDays
                                                size={
                                                    18
                                                }
                                            />
                                        }
                                        label="Event date"
                                        value={new Date(
                                            `${eventDate}T12:00:00`
                                        ).toLocaleDateString(
                                            "en-US",
                                            {
                                                weekday:
                                                    "short",
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric",
                                            }
                                        )}
                                    />
                                )}

                                {startTime && (
                                    <SummaryRow
                                        icon={
                                            <Clock3
                                                size={
                                                    18
                                                }
                                            />
                                        }
                                        label="Event time"
                                        value={`${new Date(
                                            `2000-01-01T${startTime}:00`
                                        ).toLocaleTimeString(
                                            "en-US",
                                            {
                                                hour: "numeric",
                                                minute: "2-digit",
                                            }
                                        )} – ${calculatedEndTime}`}
                                    />
                                )}
                            </div>

                            <div className="mt-7 space-y-4">
                                <PriceRow
                                    label={`${estimate.hours} hours × $${estimate.hourlyRate}`}
                                    amount={
                                        estimate.rentalSubtotal
                                    }
                                />

                                <PriceRow
                                    label="Refundable damage deposit"
                                    amount={
                                        estimate.damageDeposit
                                    }
                                />
                            </div>

                            <div className="mt-7 flex items-end justify-between border-t border-white/10 pt-7">
                                <div>
                                    <p className="text-sm font-semibold text-white/50">
                                        Total due
                                    </p>

                                    <p className="mt-2 text-5xl font-extrabold tracking-[-0.06em]">
                                        ${estimate.total}
                                    </p>
                                </div>

                                <ShieldCheck
                                    className="text-[#d8bd72]"
                                    size={30}
                                />
                            </div>

                            <p className="mt-4 text-sm leading-6 text-white/45">
                                The $100 damage deposit
                                will be initiated for
                                return within 48 hours
                                after the event, following
                                inspection and subject to
                                documented deductions.
                            </p>

                            <div className="mt-7 flex gap-3 rounded-[22px] bg-white/[0.06] p-4 text-sm leading-6 text-white/55">
                                <Check
                                    size={18}
                                    className="mt-1 shrink-0 text-[#d8bd72]"
                                />

                                <p>
                                    Booking is confirmed
                                    only after availability
                                    is verified, payment
                                    succeeds, and the
                                    reservation is accepted.
                                </p>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </main>
    );
}

function FormField({
                       label,
                       required = false,
                       error,
                       helper,
                       children,
                   }: {
    label: string;
    required?: boolean;
    error?: string;
    helper?: string;
    children: ReactNode;
}) {
    return (
        <label className="block">
            <span className="mb-2 block text-xs font-extrabold uppercase tracking-[0.14em] text-[#776f61] dark:text-white/55">
                {label}

                {required && (
                    <span className="ml-1 text-[#a77c25]">
                        *
                    </span>
                )}
            </span>

            {children}

            {error ? (
                <span className="mt-2 flex items-center gap-1.5 text-sm font-bold text-red-600 dark:text-red-400">
                    <AlertCircle size={14} />
                    {error}
                </span>
            ) : (
                helper && (
                    <span className="mt-2 block text-xs text-[#8b8478] dark:text-white/35">
                        {helper}
                    </span>
                )
            )}
        </label>
    );
}

function SummaryRow({
                        icon,
                        label,
                        value,
                    }: {
    icon: ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="flex gap-3">
            <span className="mt-1 text-[#d8bd72]">
                {icon}
            </span>

            <div>
                <p className="text-sm text-white/45">
                    {label}
                </p>

                <p className="mt-1 font-bold">
                    {value}
                </p>
            </div>
        </div>
    );
}

function PriceRow({
                      label,
                      amount,
                  }: {
    label: string;
    amount: number;
}) {
    return (
        <div className="flex justify-between gap-5">
            <span className="text-white/55">
                {label}
            </span>

            <span className="font-bold">
                ${amount}
            </span>
        </div>
    );
}

export default function BookingPage() {
    return (
        <Suspense
            fallback={
                <main className="flex min-h-screen items-center justify-center bg-[#f7f4ed] dark:bg-[#10120f]">
                    <p className="font-bold">
                        Loading reservation…
                    </p>
                </main>
            }
        >
            <BookingForm />
        </Suspense>
    );
}