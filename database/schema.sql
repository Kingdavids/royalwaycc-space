-- RoyalwayCC Space Rental
-- Beta database foundation
-- Compatible with MySQL 8+ and current MariaDB releases commonly used by cPanel.
-- Run this inside the royalwaycc_space_booking database in phpMyAdmin.

SET NAMES utf8mb4;
SET time_zone = '+00:00';

CREATE TABLE IF NOT EXISTS bookings (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    booking_reference VARCHAR(32) NOT NULL,

    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(254) NOT NULL,
    phone VARCHAR(40) NOT NULL,
    organization VARCHAR(180) NULL,

    event_type VARCHAR(120) NOT NULL,
    event_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    layout VARCHAR(30) NOT NULL,
    duration_hours SMALLINT UNSIGNED NOT NULL,
    guest_count SMALLINT UNSIGNED NOT NULL,

    alcohol_served TINYINT(1) NOT NULL DEFAULT 0,
    alcohol_provider VARCHAR(180) NULL,
    alcohol_permit_status VARCHAR(120) NULL,

    outside_catering TINYINT(1) NOT NULL DEFAULT 0,
    catering_company VARCHAR(180) NULL,
    caterer_phone VARCHAR(40) NULL,
    food_service_type VARCHAR(120) NULL,
    on_site_cooking TINYINT(1) NOT NULL DEFAULT 0,

    event_description TEXT NOT NULL,
    special_requests TEXT NULL,

    hourly_rate_cents INT UNSIGNED NOT NULL,
    rental_subtotal_cents INT UNSIGNED NOT NULL,
    damage_deposit_cents INT UNSIGNED NOT NULL DEFAULT 10000,
    total_amount_cents INT UNSIGNED NOT NULL,
    currency CHAR(3) NOT NULL DEFAULT 'USD',

    status VARCHAR(40) NOT NULL DEFAULT 'PENDING_PAYMENT',
    payment_expires_at DATETIME NULL,

    agreement_version VARCHAR(30) NOT NULL,
    agreement_accepted_at DATETIME NOT NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_bookings_reference (booking_reference),
    KEY idx_bookings_email (email),
    KEY idx_bookings_event_date (event_date),
    KEY idx_bookings_status (status),
    KEY idx_bookings_availability (
        event_date,
        start_time,
        end_time,
        status
    ),
    KEY idx_bookings_created_at (created_at)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS payments (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    booking_id BIGINT UNSIGNED NOT NULL,

    provider VARCHAR(30) NOT NULL DEFAULT 'STRIPE',
    stripe_checkout_session_id VARCHAR(255) NULL,
    stripe_payment_intent_id VARCHAR(255) NULL,

    amount_cents INT UNSIGNED NOT NULL,
    currency CHAR(3) NOT NULL DEFAULT 'USD',
    payment_status VARCHAR(40) NOT NULL DEFAULT 'PENDING',

    paid_at DATETIME NULL,
    refunded_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_payments_checkout_session (
        stripe_checkout_session_id
    ),
    UNIQUE KEY uq_payments_payment_intent (
        stripe_payment_intent_id
    ),
    KEY idx_payments_booking_id (booking_id),
    KEY idx_payments_status (payment_status),

    CONSTRAINT fk_payments_booking
        FOREIGN KEY (booking_id)
        REFERENCES bookings (id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS stripe_webhook_events (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    stripe_event_id VARCHAR(255) NOT NULL,
    event_type VARCHAR(120) NOT NULL,
    processing_status VARCHAR(40) NOT NULL DEFAULT 'RECEIVED',
    error_message TEXT NULL,
    received_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processed_at DATETIME NULL,

    PRIMARY KEY (id),
    UNIQUE KEY uq_webhook_event_id (stripe_event_id),
    KEY idx_webhook_processing_status (processing_status),
    KEY idx_webhook_received_at (received_at)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS booking_activity (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    booking_id BIGINT UNSIGNED NOT NULL,
    action VARCHAR(80) NOT NULL,
    old_status VARCHAR(40) NULL,
    new_status VARCHAR(40) NULL,
    actor_type VARCHAR(30) NOT NULL DEFAULT 'SYSTEM',
    actor_identifier VARCHAR(254) NULL,
    details_json JSON NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    KEY idx_activity_booking_id (booking_id),
    KEY idx_activity_action (action),
    KEY idx_activity_created_at (created_at),

    CONSTRAINT fk_activity_booking
        FOREIGN KEY (booking_id)
        REFERENCES bookings (id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;
