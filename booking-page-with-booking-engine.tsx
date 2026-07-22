"use client";

import {
    FormEvent,
    ReactNode,
    Suspense,
    useEffect,
    useMemo,
    useState,
} from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
} from "../lib/pricing";

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
    "royalwaycc-space-agreement-read-v1";

const BOOKING_DRAFT_STORAGE_KEY =
    "royalwaycc-space-booking-draft-v1";

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

    const [startHour, startMinute] = startTime.split(":").map(Number);
    const totalMinutes = startHour * 60 + startMinute + durationHours * 60;

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

function BookingForm() {
    const searchParams = useSearchParams();

    const requestedLayout = searchParams.get("layout");
    const requestedHours = Number(searchParams.get("hours"));

    const initialLayout: HallLayout =
        requestedLayout === "round-table"
            ? "round-table"
            : "theater";

    const initialHours =
        Number.isFinite(requestedHours) && requestedHours >= 3
            ? Math.min(requestedHours, 12)
            : 3;

    const today = useMemo(() => getTodayDate(), []);

    const [layout, setLayout] =
        useState<HallLayout>(initialLayout);

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [organization, setOrganization] =
        useState("");
    const [eventType, setEventType] = useState("");
    const [eventDescription, setEventDescription] =
        useState("");
    const [specialRequests, setSpecialRequests] =
        useState("");
    const [alcoholProvider, setAlcoholProvider] =
        useState("");
    const [
        alcoholPermitStatus,
        setAlcoholPermitStatus,
    ] = useState("");
    const [cateringCompany, setCateringCompany] =
        useState("");
    const [catererPhone, setCatererPhone] =
        useState("");
    const [foodServiceType, setFoodServiceType] =
        useState("Drop-off catering");
    const [onSiteCooking, setOnSiteCooking] =
        useState("No");

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

    const [errors, setErrors] = useState<FormErrors>({});

    useEffect(() => {
        function refreshAgreementStatus() {
            const agreementWasRead =
                window.localStorage.getItem(
                    AGREEMENT_STORAGE_KEY
                ) === "true";

            setTermsRead(agreementWasRead);

            if (!agreementWasRead) {
                setAgreementAccepted(false);
            }
        }

        const savedDraft =
            window.sessionStorage.getItem(
                BOOKING_DRAFT_STORAGE_KEY
            );

        if (savedDraft) {
            try {
                const draft = JSON.parse(savedDraft);

                setFirstName(draft.firstName || "");
                setLastName(draft.lastName || "");
                setEmail(draft.email || "");
                setPhone(draft.phone || "");
                setOrganization(
                    draft.organization || ""
                );
                setEventType(draft.eventType || "");
                setEventDate(draft.eventDate || "");
                setStartTime(draft.startTime || "");
                setLayout(
                    draft.layout === "round-table"
                        ? "round-table"
                        : "theater"
                );
                setHours(
                    Number(draft.hours) >= 3
                        ? Number(draft.hours)
                        : 3
                );
                setGuestCount(
                    draft.guestCount || ""
                );
                setAlcoholServed(
                    draft.alcoholServed || "no"
                );
                setAlcoholProvider(
                    draft.alcoholProvider || ""
                );
                setAlcoholPermitStatus(
                    draft.alcoholPermitStatus || ""
                );
                setOutsideCatering(
                    draft.outsideCatering || "no"
                );
                setCateringCompany(
                    draft.cateringCompany || ""
                );
                setCatererPhone(
                    draft.catererPhone || ""
                );
                setFoodServiceType(
                    draft.foodServiceType ||
                        "Drop-off catering"
                );
                setOnSiteCooking(
                    draft.onSiteCooking || "No"
                );
                setEventDescription(
                    draft.eventDescription || ""
                );
                setSpecialRequests(
                    draft.specialRequests || ""
                );
                setAgreementAccepted(
                    Boolean(
                        draft.agreementAccepted
                    )
                );
            } catch {
                window.sessionStorage.removeItem(
                    BOOKING_DRAFT_STORAGE_KEY
                );
            }
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

    useEffect(() => {
        const draft = {
            firstName,
            lastName,
            email,
            phone,
            organization,
            eventType,
            eventDate,
            startTime,
            layout,
            hours,
            guestCount,
            alcoholServed,
            alcoholProvider,
            alcoholPermitStatus,
            outsideCatering,
            cateringCompany,
            catererPhone,
            foodServiceType,
            onSiteCooking,
            eventDescription,
            specialRequests,
            agreementAccepted,
        };

        window.sessionStorage.setItem(
            BOOKING_DRAFT_STORAGE_KEY,
            JSON.stringify(draft)
        );
    }, [
        firstName,
        lastName,
        email,
        phone,
        organization,
        eventType,
        eventDate,
        startTime,
        layout,
        hours,
        guestCount,
        alcoholServed,
        alcoholProvider,
        alcoholPermitStatus,
        outsideCatering,
        cateringCompany,
        catererPhone,
        foodServiceType,
        onSiteCooking,
        eventDescription,
        specialRequests,
        agreementAccepted,
    ]);

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
            newErrors.eventDate = "Select an event date.";
        } else if (eventDate < today) {
            newErrors.eventDate =
                "Past dates cannot be booked.";
        }

        if (!startTime) {
            newErrors.startTime = "Select a start time.";
        }

        if (eventDate === today && startTime) {
            const selectedStart = new Date(
                `${eventDate}T${startTime}:00`
            );

            if (selectedStart.getTime() <= Date.now()) {
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
            selectedLayout === "theater" ? 100 : 50;

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
        const validationErrors =
            validateBooking();

        setErrors(validationErrors);
        setPaymentError("");

        if (!form.checkValidity()) {
            form.reportValidity();
        }

        if (
            !form.checkValidity() ||
            Object.keys(validationErrors).length > 0
        ) {
            const firstInvalidField =
                form.querySelector<HTMLElement>(
                    "[aria-invalid='true'], :invalid"
                );

            firstInvalidField?.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });

            firstInvalidField?.focus();
            return;
        }

        const formData = new FormData(form);

        setIsSubmitting(true);

        try {
            const response = await fetch(
                "/api/bookings",
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
                        endTime: calculatedEndTime,
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
                        agreementVersion:
                            "2026-07-21",
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

            window.sessionStorage.removeItem(
                BOOKING_DRAFT_STORAGE_KEY
            );

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
                            Complete the required details, review the
                            rental agreement, and proceed to secure
                            online payment.
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
                                        value={firstName}
                                        onChange={(event) =>
                                            setFirstName(
                                                event.target.value
                                            )
                                        }
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
                                        value={lastName}
                                        onChange={(event) =>
                                            setLastName(
                                                event.target.value
                                            )
                                        }
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
                                        value={email}
                                        onChange={(event) =>
                                            setEmail(
                                                event.target.value
                                            )
                                        }
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
                                        value={phone}
                                        onChange={(event) =>
                                            setPhone(
                                                event.target.value
                                            )
                                        }
                                        className="booking-input"
                                    />
                                </FormField>

                                <FormField label="Organization">
                                    <input
                                        name="organization"
                                        value={organization}
                                        onChange={(event) =>
                                            setOrganization(
                                                event.target.value
                                            )
                                        }
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
                                        value={eventType}
                                        onChange={(event) =>
                                            setEventType(
                                                event.target.value
                                            )
                                        }
                                        className="booking-input"
                                    >
                                        <option value="" disabled>
                                            Select event type
                                        </option>

                                        <option>Church Event</option>
                                        <option>Corporate Meeting</option>
                                        <option>
                                            Training or Seminar
                                        </option>
                                        <option>Birthday Party</option>
                                        <option>Baby Shower</option>
                                        <option>Reception</option>
                                        <option>Community Event</option>
                                        <option>
                                            Private Celebration
                                        </option>
                                        <option>Other</option>
                                    </select>
                                </FormField>

                                <FormField
                                    label="Event Date"
                                    required
                                    error={errors.eventDate}
                                >
                                    <input
                                        required
                                        type="date"
                                        name="eventDate"
                                        min={today}
                                        value={eventDate}
                                        onChange={(event) => {
                                            setEventDate(event.target.value);

                                            setErrors((current) => ({
                                                ...current,
                                                eventDate: undefined,
                                            }));
                                        }}
                                        aria-invalid={
                                            Boolean(errors.eventDate)
                                        }
                                        className="booking-input"
                                    />
                                </FormField>

                                <FormField
                                    label="Start Time"
                                    required
                                    error={errors.startTime}
                                >
                                    <input
                                        required
                                        type="time"
                                        name="startTime"
                                        value={startTime}
                                        onChange={(event) => {
                                            setStartTime(event.target.value);

                                            setErrors((current) => ({
                                                ...current,
                                                startTime: undefined,
                                            }));
                                        }}
                                        aria-invalid={
                                            Boolean(errors.startTime)
                                        }
                                        className="booking-input"
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
                                                event.target.value as HallLayout
                                            )
                                        }
                                        className="booking-input"
                                    >
                                        <option value="theater">
                                            Theater Setting — $105/hour
                                        </option>

                                        <option value="round-table">
                                            Round-Table Setting — $145/hour
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
                                                Number(event.target.value)
                                            )
                                        }
                                        className="booking-input"
                                    >
                                        {Array.from(
                                            { length: 10 },
                                            (_, index) => index + 3
                                        ).map((hour) => (
                                            <option
                                                key={hour}
                                                value={hour}
                                            >
                                                {hour}{" "}
                                                {hour === 1
                                                    ? "hour"
                                                    : "hours"}
                                            </option>
                                        ))}
                                    </select>
                                </FormField>

                                <FormField
                                    label="Expected Guests"
                                    required
                                    error={errors.guestCount}
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
                                                event.target.value
                                            );

                                            setErrors((current) => ({
                                                ...current,
                                                guestCount: undefined,
                                            }));
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
                                                event.target.value
                                            )
                                        }
                                        className="booking-input"
                                    >
                                        <option value="no">No</option>
                                        <option value="yes">Yes</option>
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
                                                event.target.value
                                            )
                                        }
                                        className="booking-input"
                                    >
                                        <option value="no">No</option>
                                        <option value="yes">Yes</option>
                                    </select>
                                </FormField>
                            </div>

                            {alcoholServed === "yes" && (
                                <div className="mt-6 rounded-[26px] border border-[#d7bd76] bg-[#fff8e3] p-5 dark:border-[#d7bd76]/30 dark:bg-[#2a271c]">
                                    <p className="font-extrabold text-[#654c17] dark:text-[#ead9a2]">
                                        Alcohol service information
                                    </p>

                                    <p className="mt-2 text-sm leading-7 text-[#6f5d37] dark:text-white/60">
                                        Provide details of the person or
                                        licensed vendor responsible for
                                        alcohol service. Required permits,
                                        licensing, and insurance must be
                                        submitted before the event.
                                    </p>

                                    <div className="mt-5 grid gap-5 sm:grid-cols-2">
                                        <FormField
                                            label="Alcohol Service Provider"
                                            required
                                        >
                                            <input
                                                required
                                                name="alcoholProvider"
                                                value={alcoholProvider}
                                                onChange={(event) =>
                                                    setAlcoholProvider(
                                                        event.target.value
                                                    )
                                                }
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
                                                value={alcoholPermitStatus}
                                                onChange={(event) =>
                                                    setAlcoholPermitStatus(
                                                        event.target.value
                                                    )
                                                }
                                                className="booking-input"
                                            >
                                                <option
                                                    value=""
                                                    disabled
                                                >
                                                    Select status
                                                </option>

                                                <option>
                                                    Not required for this event
                                                </option>

                                                <option>
                                                    Application in progress
                                                </option>

                                                <option>
                                                    License or permit obtained
                                                </option>

                                                <option>
                                                    Licensed caterer will provide
                                                    service
                                                </option>

                                                <option>
                                                    Unsure — assistance required
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
                                                value={cateringCompany}
                                                onChange={(event) =>
                                                    setCateringCompany(
                                                        event.target.value
                                                    )
                                                }
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
                                                value={catererPhone}
                                                onChange={(event) =>
                                                    setCatererPhone(
                                                        event.target.value
                                                    )
                                                }
                                                className="booking-input"
                                            />
                                        </FormField>

                                        <FormField label="Type of Food Service">
                                            <select
                                                name="foodServiceType"
                                                value={foodServiceType}
                                                onChange={(event) =>
                                                    setFoodServiceType(
                                                        event.target.value
                                                    )
                                                }
                                                className="booking-input"
                                            >
                                                <option>
                                                    Drop-off catering
                                                </option>
                                                <option>
                                                    Buffet service
                                                </option>
                                                <option>
                                                    Plated service
                                                </option>
                                                <option>Food stations</option>
                                                <option>Other</option>
                                            </select>
                                        </FormField>

                                        <FormField label="On-Site Cooking">
                                            <select
                                                name="onSiteCooking"
                                                value={onSiteCooking}
                                                onChange={(event) =>
                                                    setOnSiteCooking(
                                                        event.target.value
                                                    )
                                                }
                                                className="booking-input"
                                            >
                                                <option>No</option>
                                                <option>
                                                    Yes — approval required
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
                      value={eventDescription}
                      onChange={(event) =>
                          setEventDescription(
                              event.target.value
                          )
                      }
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
                      value={specialRequests}
                      onChange={(event) =>
                          setSpecialRequests(
                              event.target.value
                          )
                      }
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

                                    {errors.agreement && (
                                        <span className="mt-2 flex items-center gap-2 text-sm font-bold text-red-600 dark:text-red-400">
                                            <AlertCircle
                                                size={15}
                                            />
                                            {
                                                errors.agreement
                                            }
                                        </span>
                                    )}
                                </span>
                            </label>

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
                                Availability will be verified before
                                Stripe payment begins.
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
                                    icon={<UsersRound size={18} />}
                                    label="Hall arrangement"
                                    value={hallPricing[layout].name}
                                />

                                <SummaryRow
                                    icon={<Clock3 size={18} />}
                                    label="Rental duration"
                                    value={`${estimate.hours} hours`}
                                />

                                <SummaryRow
                                    icon={<CalendarDays size={18} />}
                                    label="Capacity"
                                    value={hallPricing[layout].capacity}
                                />

                                {eventDate && (
                                    <SummaryRow
                                        icon={<CalendarDays size={18} />}
                                        label="Event date"
                                        value={new Date(
                                            `${eventDate}T12:00:00`
                                        ).toLocaleDateString("en-US", {
                                            weekday: "short",
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                        })}
                                    />
                                )}

                                {startTime && (
                                    <SummaryRow
                                        icon={<Clock3 size={18} />}
                                        label="Event time"
                                        value={`${new Date(
                                            `2000-01-01T${startTime}:00`
                                        ).toLocaleTimeString("en-US", {
                                            hour: "numeric",
                                            minute: "2-digit",
                                        })} – ${calculatedEndTime}`}
                                    />
                                )}
                            </div>

                            <div className="mt-7 space-y-4">
                                <PriceRow
                                    label={`${estimate.hours} hours × $${estimate.hourlyRate}`}
                                    amount={estimate.rentalSubtotal}
                                />

                                <PriceRow
                                    label="Refundable damage deposit"
                                    amount={estimate.damageDeposit}
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
                                The $100 damage deposit will be
                                initiated for return within 48 hours
                                after the event, following inspection
                                and subject to documented deductions.
                            </p>

                            <div className="mt-7 flex gap-3 rounded-[22px] bg-white/[0.06] p-4 text-sm leading-6 text-white/55">
                                <Check
                                    size={18}
                                    className="mt-1 shrink-0 text-[#d8bd72]"
                                />

                                <p>
                                    Booking is confirmed only after
                                    availability is verified, payment
                                    succeeds, and the reservation is
                                    accepted.
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

                <p className="mt-1 font-bold">{value}</p>
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

            <span className="font-bold">${amount}</span>
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