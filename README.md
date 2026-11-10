# Meow — Cat Sitter Booking Platform

**Trusted care for your cat, while you’re away.**

**Live site:** [https://meow-client-nine.vercel.app](https://meow-client-nine.vercel.app)  
**Frontend repository:** [DibajitRoy/meow-client](https://github.com/DibajitRoy/meow-client)  
**Backend repository:** [DibajitRoy/meow-server](https://github.com/DibajitRoy/meow-server)

Meow is a cat-care marketplace that helps cat owners find verified sitters, manage their cats, and request bookings. Sitters can publish their services, manage availability, and respond to booking requests. Admins can manage users, verify sitter profiles, and moderate reviews.

---

## Key Features

- **Find a sitter:** Browse sitter profiles and filter by city, dates, price, rating, experience, and services.
- **Sitter profiles:** Sitters can describe their experience, services, rates, location, and availability.
- **Cat profiles:** Owners can save their cats’ care details and choose a cat when requesting a booking.
- **Booking management:** Owners can send requests and track booking status; sitters can respond to requests and manage accepted bookings.
- **Availability and conflict checks:** The API checks sitter availability, blocked dates, and overlapping bookings.
- **Reviews:** Owners can review a sitter after a completed booking. Admins can moderate reviews.
- **Role-based dashboards:** Separate tools for owners, sitters, and admins.
- **Notifications:** In-app notifications keep users up to date on booking activity.
- **Authentication:** Email/password sign-in and optional Google sign-in using Better Auth and MongoDB.
- **Responsive design:** Public pages and dashboards are designed for desktop, tablet, and mobile.

---

## Pages

| Route | Access | Description |
| --- | --- | --- |
| `/` | Public | Introduction, services, and featured sitters |
| `/sitters` | Public | Search and browse sitter profiles |
| `/sitters/[id]` | Public | Sitter details, availability, reviews, and booking link |
| `/login` | Public | Email/password and optional Google login |
| `/register` | Public | Create an owner or sitter account |
| `/forgot-password` | Public | Request a password reset email |
| `/reset-password` | Public | Set a new password from a reset link |
| `/dashboard` | Private | Role-based dashboard entry point |
| `/dashboard/owner/cats` | Owner | Manage cat profiles |
| `/dashboard/owner/bookings` | Owner | View and manage booking requests |
| `/dashboard/owner/reviews` | Owner | Review completed bookings |
| `/dashboard/sitter/profile` | Sitter | Edit sitter profile and services |
| `/dashboard/sitter/availability` | Sitter | Manage available and blocked dates |
| `/dashboard/sitter/requests` | Sitter | Respond to booking requests |
| `/dashboard/sitter/bookings` | Sitter | Manage accepted bookings |
| `/dashboard/sitter/reviews` | Sitter | View sitter reviews |
| `/dashboard/admin` | Admin | View platform administration tools |
| `/dashboard/admin/users` | Admin | Manage user access and roles |
| `/dashboard/admin/sitters` | Admin | Review sitter verification requests |
| `/dashboard/admin/reviews` | Admin | Moderate reviews |
| `/dashboard/notifications` | Private | View in-app notifications |
| `/dashboard/profile` | Private | Update account details and password |

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js 16 App Router, React, TypeScript |
| Styling | Tailwind CSS 4 |
| Authentication | Better Auth, MongoDB adapter, JWT plugin |
| Validation | Zod |
| Icons | Lucide React |
| Backend | Express.js API in a separate repository |
| Database | MongoDB Atlas or local MongoDB |
| Hosting | Vercel |

---

## Getting Started

### Requirements

- Node.js 20.9 or newer
- npm
- MongoDB Atlas or a local MongoDB instance
- The [Meow API](https://github.com/DibajitRoy/meow-server) repository

### 1. Clone and install

```bash
git clone https://github.com/DibajitRoy/meow-client.git
cd meow-client
npm install
```

Clone and install the API in a separate folder using its repository instructions.

### 2. Configure environment variables

Copy `.env.example` to `.env` in the frontend project and set the values needed for your local setup:

```env
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB=meow
BETTER_AUTH_SECRET=replace-with-a-long-random-secret
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SERVICE_FEE=5

NEXT_PUBLIC_GOOGLE_ENABLED=false
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

Keep `.env` private; never commit database credentials, auth secrets, or OAuth secrets. The frontend and API must use the same MongoDB database. `BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL` must be the frontend origin, while `NEXT_PUBLIC_API_URL` must be the API origin.

To enable Google sign-in, set `NEXT_PUBLIC_GOOGLE_ENABLED=true`, provide the Google OAuth client ID and secret, and add this redirect URI to the Google OAuth client:

```text
http://localhost:3000/api/auth/callback/google
```

For the deployed site, use:

```text
https://meow-client-nine.vercel.app/api/auth/callback/google
```

Password reset email delivery needs a Resend-compatible email API. Configure `EMAIL_API_KEY` and a verified `EMAIL_FROM` address before enabling password reset in a deployed environment.

### 3. Configure the API

In the API project’s `.env`, configure the database and local origins:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB=meow
CLIENT_URL=http://localhost:3000
AUTH_URL=http://localhost:3000
AUTH_AUDIENCE=http://localhost:3000
SERVICE_FEE=5
```

`AUTH_URL` must match the frontend’s `BETTER_AUTH_URL`. For production, set `CLIENT_URL`, `AUTH_URL`, and `AUTH_AUDIENCE` to the deployed frontend origin, and set `NEXT_PUBLIC_API_URL` to the deployed API origin. Keep `SERVICE_FEE` and `NEXT_PUBLIC_SERVICE_FEE` in sync.

### 4. Run locally

Start the API first, following its repository instructions. Then, in the frontend project:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The API health endpoint is available at [http://localhost:5000/](http://localhost:5000/).

### Optional: seed demo data

With the frontend `.env` configured for the intended MongoDB database, run:

```bash
npm run seed:demo
```

This creates 12 verified sitter profiles, 8 sample owner records, and 96 reviews attached to completed demo bookings. The sample accounts use `@example.com` addresses and **do not have login credentials**. Register a real account to sign in. The script can be run more than once; it updates the same demo records.

### Optional: promote an existing account to admin

Set `ADMIN_EMAIL` in `.env` to the email of an existing account, then run:

```bash
npm run admin:promote
```

The account must already exist in the configured database. Sign out and sign back in after promotion to refresh the role in the session.

---

## Project Structure

```text
src/
  app/          Public pages, dashboards, and Better Auth API route
  components/   Shared UI, sitter, booking, owner, and dashboard components
  lib/          Auth setup, API client, types, and date utilities
scripts/        Demo data seeding and admin promotion scripts
public/         Logo and image assets
```

---

## Authentication and API

Better Auth stores account data in MongoDB and provides email/password authentication, optional Google sign-in, and JWT support. The frontend calls the separate Express API for sitter, cat, booking, review, notification, and admin data. The API validates authenticated requests and applies role and ownership checks before allowing protected actions.

---

## Deployment

The frontend is deployed on Vercel at [meow-client-nine.vercel.app](https://meow-client-nine.vercel.app). Configure production environment variables in the Vercel settings for both the frontend and API projects. Use HTTPS origins in production, and redeploy each project after changing its environment variables.

Do not commit `.env` files or publish secrets in issues, screenshots, or chat. Use a different Better Auth secret for production and rotate any credential that has been exposed.
