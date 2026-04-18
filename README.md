# GolfGives — Golf + Charity + Prize Draw Platform

A subscription-driven web application combining golf performance tracking, charity fundraising, and a monthly draw-based reward engine.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Backend | Node.js + Express.js |
| ORM | Prisma |
| Database | PostgreSQL |
| Auth | Custom Auth (bcrypt + JWT) |
| Styling | Vanilla CSS with CSS Modules |

## Project Structure

```
digitalHeros/
├── client/                # React frontend (Vite)
├── server/                # Express.js backend
│   ├── config/            # Prisma client configuration
│   ├── lib/               # Draw engine + prize calculator
│   ├── middleware/         # Auth, admin, subscriber guards
│   ├── prisma/            # Prisma schema + migrations
│   └── routes/            # All API route handlers
└── README.md
```

## Setup Instructions

### 1. Database Setup (Postgres)

1. Create a new Postgres database (e.g. at [supabase.com](https://supabase.com))
2. Get your PostgreSQL connection string from your provider (e.g., **Settings → Database → Connection string (URI)** in Supabase)

### 2. Backend Setup

```bash
cd server
cp .env.example .env
# Edit .env with your DATABASE_URL
npm install
npx prisma migrate dev --name init   # Creates tables via Prisma
npx prisma generate                   # Generate Prisma client
npm start
```

Server runs on `http://localhost:5000`

### 3. Seed Database

Run the generic Prisma seed command to populate the database with charities, an admin user, and test data:
```bash
npx prisma db seed
```

### 4. Frontend Setup

```bash
cd client
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

### 5. Test Accounts and Payment Simulations

The seed script automatically populates the database with default test accounts you can use immediately:

#### Test Users

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@gmail.com | 123456 |
| **Test Setup User** | user1@gmail.com | 123456 |

> **Note:** Any new users created via the signup page will default to the `user` role. 
#### Testing Subscriptions & Payments (Razorpay)

The application uses Razorpay in **Test Mode** for subscription processing. To test the payment and subscription upgrade flow:

1. Log in as a Regular User.
2. Navigate to the User Dashboard and initiate a subscription upgrade.
3. When the Razorpay checkout modal appears, **select any Bank** from the Netbanking options (or any other test payment method).
4. Proceed to payment and click the **"Success"** button on the simulated bank page to complete the transaction.

*No real bank details or credentials are required since the integration runs completely in a simulated test environment.*

## Environment Variables

### Server (`server/.env`)
```
DATABASE_URL=postgresql://postgres:YOUR-PASSWORD@localhost:5432/postgres
JWT_SECRET=your_super_secret_jwt_key_here
PORT=5000
CLIENT_URL=http://localhost:5173
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### Client (`client/.env`)
```
VITE_API_URL=http://localhost:5000
```

## Key Features

- **Prisma ORM** — Type-safe database access with auto-generated client
- **Subscription System** — Monthly/yearly plans with recurring billing integrated via Razorpay
- **Score Management** — 5-score rolling system (Stableford 1-45)
- **Draw Engine** — Random + algorithmic modes with simulation
- **Prize Pool** — Auto-calculated (40% / 35% / 25% split) with jackpot rollover
- **Charity System** — Directory, profiles, independent donations
- **Winner Verification** — Proof upload, admin approve/reject, payout tracking
- **User Dashboard** — Subscription, scores, draws, winnings overview
- **Admin Panel** — Full user/draw/charity/winner management + analytics

## Useful Commands

```bash
npx prisma studio         # Visual DB browser
npx prisma migrate dev    # Apply schema changes
npx prisma generate       # Regenerate Prisma client
npx prisma db push        # Push schema without migration
```
