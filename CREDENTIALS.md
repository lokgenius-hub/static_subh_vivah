# VivahSthal — Credentials & Setup Guide
> **CONFIDENTIAL** — Do not share publicly. Keep this file secure.

---

## 🔐 Super Admin Account

| Field    | Value                  |
|----------|------------------------|
| Email    | `admin@vivahsthal.com` |
| Password | `Admin@Vivah2024`      |
| Role     | `admin`                |

**Login URL:** `https://your-domain.com/login`  
**Dashboard:** `https://your-domain.com/admin/leads`

---

## 🏢 Partner / Venue Accounts

Each venue has its own partner login. All passwords follow the pattern: `VenueName@2024!`

| # | Venue Name | Email | Password | City |
|---|-----------|-------|----------|------|
| 1 | Sharda Palace | `sharda.palace@vivahsthal.com` | `Sharda@2024!` | Bhabua |
| 2 | Rajwanti Vatica | `rajwanti.vatica@vivahsthal.com` | `Rajwanti@2024!` | Bhabua |
| 3 | Marriage Hall Vimla Palace | `vimla.palace@vivahsthal.com` | `Vimla@2024!` | Bhabua |
| 4 | Atul Vatika | `atul.vatika@vivahsthal.com` | `Atul@2024!` | Bhabua |
| 5 | Gulzar Vatica | `gulzar.vatica@vivahsthal.com` | `Gulzar@2024!` | Bhabua |
| 6 | Shankar Palace | `shankar.palace@vivahsthal.com` | `Shankar@2024!` | Bhabua |
| 7 | Aashirwad Palace | `aashirwad.palace@vivahsthal.com` | `Aashirwad@2024!` | Bhabua |
| 8 | RamaPal Palace | `ramapal.palace@vivahsthal.com` | `Ramapal@2024!` | Bhabua |
| 9 | Shail Rajendram Palace | `shail.palace@vivahsthal.com` | `Shail@2024!` | Bhabua |
| 10 | Mohini Mahal | `mohini.mahal@vivahsthal.com` | `Mohini@2024!` | Mohania |
| 11 | Green Valley Resort | `green.valley@vivahsthal.com` | `GreenValley@2024!` | Bhabua |
| 12 | Patel Bhawan Marriage Hall & Hotel | `patel.bhawan@vivahsthal.com` | `Patel@2024!` | Bhabua |
| 13 | Swyamvar Vatika | `swyamvar.vatika@vivahsthal.com` | `Swyamvar@2024!` | Bhabua |
| 14 | Varmala Palace | `varmala.palace@vivahsthal.com` | `Varmala@2024!` | Bhabua |
| 15 | Radha Krishna Vatika (Lawn) | `radha.krishna@vivahsthal.com` | `RadhaKrishna@2024!` | Bhabua |
| 16 | Shree Ganesh Vatika | `shree.ganesh@vivahsthal.com` | `ShreeGanesh@2024!` | Bhabua |
| 17 | Radha Palace & Hotel | `radha.palace@vivahsthal.com` | `RadhaPalace@2024!` | Bhabua |
| 18 | Nagababa Marriage Hall | `nagababa.hall@vivahsthal.com` | `Nagababa@2024!` | Bhabua |
| 19 | Sanjay Vatika | `sanjay.vatika@vivahsthal.com` | `Sanjay@2024!` | Bhabua |
| 20 | NAGABABA RESIDENCY | `nagababa.residency@vivahsthal.com` | `NagababaR@2024!` | Bhabua |

**Partner Dashboard:** `https://your-domain.com/partner/dashboard`

---

## 🛠️ Setup Instructions (One-Time)

### Step 1: Apply Database Migration
Run migration `004_inbox_packages_testimonials.sql` in your Supabase SQL Editor:
- Go to `https://supabase.com/dashboard` → Your Project → SQL Editor
- Copy-paste the contents of `supabase/migrations/004_inbox_packages_testimonials.sql`
- Click "Run"

### Step 2: Create Super Admin
Visit: `https://your-domain.com/api/setup-admin`
This creates the admin account in Supabase Auth + profiles table.

### Step 3: Seed All Venues, Partners & Blogs
Visit: `https://your-domain.com/api/seed-venues`
This will:
- Create 20 partner accounts (Supabase Auth)
- Create 20 real Bhabua-area venues with Google Maps coordinates
- Create 5 SEO-optimized blog posts
- Return a JSON summary with all credentials

> **Note:** The seed route is idempotent — running it again won't create duplicates.

---

## 📍 Venue Features

Each venue includes:
- **Google Maps embed** on the venue detail page (lat/lng coordinates)
- **Get Directions** button for users
- **Open in Google Maps** link
- Real Google review ratings and review counts

Partners can update their venue's latitude/longitude from the Partner Dashboard → Venues.

---

## 📝 Testimonial / Feedback Form

- **URL:** `https://your-domain.com/testimonials`
- Users can submit reviews via the form at the bottom of the testimonials page
- Reviews are **auto-published** immediately (no admin approval needed)
- Fields: Couple Name, City, Venue Name (optional), Rating (1-5 stars), Review Text

---

## 📰 Blog Posts (Seeded)

| # | Title | Slug |
|---|-------|------|
| 1 | Top 10 Wedding Venues in Bhabua for 2025-2026 | `top-10-wedding-venues-bhabua-2025` |
| 2 | Complete Guide to Wedding Planning in Kaimur District | `wedding-planning-guide-kaimur-district` |
| 3 | Why Bhabua is Becoming Bihar's Next Wedding Destination | `bhabua-next-wedding-destination-bihar` |
| 4 | Auspicious Wedding Dates (Shubh Muhurat) 2025-2026 for Bihar | `auspicious-wedding-dates-2025-2026-bihar` |
| 5 | Budget Wedding in Bhabua: How to Plan Under ₹3 Lakhs | `budget-wedding-bhabua-under-3-lakhs` |

---

## 🔑 Environment Variables (Already configured in `.env.local`)

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (admin ops) |
| `RESEND_API_KEY` | Email sending via Resend |
| `GROQ_API_KEY` | AI chatbot (Groq) |

---

*Last updated: $(Get-Date -Format "yyyy-MM-dd")*
