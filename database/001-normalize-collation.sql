-- Your screenshot showed the bookings table using latin1_swedish_ci.
-- Run this once in phpMyAdmin so all booking data supports utf8mb4.

ALTER TABLE bookings
    CONVERT TO CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;
