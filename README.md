# Loft Studio (Hauzisha)

A real-estate listing and booking platform with immersive virtual loft tours, built with PHP, MySQL and vanilla JavaScript.

## Features

- **Property marketplace** – search with smart suggestions, filters, favourites, reviews and recommendations
- **Virtual loft tours** – 360° panorama tour editor and viewer (hotspots, scene linking, 3G-friendly loading, offline support)
- **Bookings** – viewing/stay bookings with agent and unit management
- **Payments** – Paystack integration
- **Auth** – email/password, Google sign-in, SMS verification (Africa's Talking)
- **Admin "control room"** – dashboard for properties, agents, users, bookings, payments, notifications and rate-limit monitoring
- **Security** – API rate limiting, input sanitising helpers, prepared statements

## Tech stack

PHP 8 · MySQL · JavaScript (ES6) · Firebase Auth · PHPMailer · Paystack · Google Maps/Places · Docker

## Getting started

1. Clone and install dependencies
   ```bash
   git clone https://github.com/Leon04-Urio/<repo>.git
   cd <repo>
   composer install
   npm install
   ```
2. Create the database and import your schema (SQL dumps are not committed).
3. Copy the config template and fill in your own values
   ```bash
   cp api/config/app.ini.example api/config/app.ini
   ```
   `app.ini` holds database, SMTP, SMS and Google credentials and is git-ignored.
4. Add your Paystack keys in `services/paystack-config.php` (see [PAYSTACK_QUICK_START.md](PAYSTACK_QUICK_START.md)).
5. Serve from Apache/XAMPP (or `docker build`) and open `http://localhost/hauzisha/`.

## Project layout

| Path | Purpose |
| --- | --- |
| `api/` | REST endpoints, classes (Property, Booking, User, Agent…), config, helpers |
| `control-room/` | Admin dashboard |
| `loft-tour/` | Virtual tour editor and viewer |
| `user-profile/` | Customer account pages |
| `services/` | Payment services |
| `js/`, `css/`, `assets/` | Front-end code and static files |
| `read/` | Extra documentation |

## Notes

Never commit `api/config/app.ini` or real API keys. Firebase web config values are public by design but should be restricted by domain in the Firebase console.
