# Meow cat care marketplace

Meow connects cat owners with verified cat sitters. This repository contains the Next.js web app. The Express and MongoDB API is in the sibling `Meow-server/Meow-server` project.

## Features

- Owner and sitter registration, login, and role based dashboards
- Cat profile management and sitter search by city, dates, price, rating, experience, and service
- Sitter profiles, verification, and availability blocks
- Booking requests, status changes, conflict checks, and booking history
- Reviews restricted to owners with completed bookings
- In app notifications and admin tools for user access, sitter verification, and review moderation
- Responsive public pages and dashboard navigation

## Requirements

- Node.js 20.9 or newer
- MongoDB, local or Atlas
- Both project folders: this frontend and the sibling Express API

## Configure the frontend

Copy `.env.example` to `.env` and set the MongoDB URI and a private Better Auth secret. `BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL` must be the frontend's public origin. Set `NEXT_PUBLIC_API_URL` to the Express server origin.

Google sign in is optional. To enable it, set both Google client values, set `NEXT_PUBLIC_GOOGLE_ENABLED=true`, and register the Better Auth callback URL with Google.

Password reset delivery requires a Resend-compatible email API. Set `EMAIL_API_KEY` and a verified `EMAIL_FROM` address before users request reset links.

## Configure the API

In `Meow-server/Meow-server`, create a `.env` file with:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB=meow
CLIENT_URL=http://localhost:3000
AUTH_URL=http://localhost:3000
AUTH_AUDIENCE=http://localhost:3000
SERVICE_FEE=5
```

`AUTH_URL` must match the frontend's `BETTER_AUTH_URL`. `NEXT_PUBLIC_SERVICE_FEE` and `SERVICE_FEE` should use the same amount. The API checks Better Auth JWT signatures through its JWKS endpoint and checks the issuer and audience before reading the user record and applying role and ownership rules.

## Run locally

Install dependencies in each project folder. Start the Express API first, then start the frontend:

```powershell
Set-Location "F:\Desktop\MEOW PROJECT\Meow-server\Meow-server"
npm install
npm run dev
```

In another terminal:

```powershell
Set-Location "F:\Desktop\MEOW PROJECT\meow"
npm install
npm run dev
```

The frontend runs at `http://localhost:3000`; the API health endpoint is `http://localhost:5000/`.

To add repeatable sample data to the MongoDB database configured in the frontend `.env`, run this from the frontend folder:

```powershell
npm run seed:demo
```

This creates 12 verified sample sitter profiles, 8 sample owner records, and 96 demo reviews attached to completed sample bookings. The records use `@example.com` addresses and do not have login credentials. Running the command again updates the same records instead of creating duplicates. Start the Express API before opening the sitter search page.

## Core booking rules

Owners can book verified sitters with active profiles and can only choose their own cats. The API calculates duration and price, checks the sitter's blocked dates and accepted bookings, and checks for conflicting cat bookings. Sitters handle requests and can complete accepted work after it starts. Only an owner on a completed booking can submit its one review. Admin endpoints are restricted to admin accounts.

## Environment variables

Never commit `.env` files or real credentials. Use separate Better Auth secrets for local development and production, and use HTTPS origins for deployed services.
