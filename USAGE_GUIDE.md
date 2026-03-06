# 🎊 VivahSthal — Complete Admin & Usage Guide

> **Your wedding venue marketplace for Bihar.** This guide explains everything you need to manage your website — from updating venue details and images to approving new partners and viewing enquiries.

---

## 🌐 Live Website URLs

| Page | URL |
|------|-----|
| 🏠 Home | https://lokgenius-hub.github.io/static_subh_vivah/ |
| 🔐 Login | https://lokgenius-hub.github.io/static_subh_vivah/login |
| 🛡️ Admin Panel | https://lokgenius-hub.github.io/static_subh_vivah/admin/leads |
| 🤝 Partner Portal | https://lokgenius-hub.github.io/static_subh_vivah/partner/dashboard |
| 🏛️ Browse Venues | https://lokgenius-hub.github.io/static_subh_vivah/venues |

---

## 🔐 How to Login as Super Admin

1. Go to → **https://lokgenius-hub.github.io/static_subh_vivah/login**
2. Enter:
   - **Email:** `admin@vivahsthal.com`
   - **Password:** `Admin@Vivah2024`
3. Click **Sign In**
4. You will be **automatically redirected to the Admin Panel**

> ⚠️ **Common mistake:** Do NOT go to `/admin/` directly — always login first via `/login`

---

## 🏢 How to Update Venue Details (Address, Phone, Images etc.)

### As Admin — Edit Any Venue

1. Login at `/login` → Admin Panel opens automatically
2. Click **"All Venues"** in the left sidebar
3. Find the venue → Click **"Edit"** button
4. Update any field:
   - 📍 **Address / City / State / Pincode**
   - 📞 **Contact Phone** (stored in the partner profile)
   - 🖼️ **Cover Image** — paste a new image URL from Unsplash or upload to Supabase Storage
   - 🖼️ **Gallery Images** — add/remove multiple image URLs
   - 💰 **Pricing** — per slot price, per plate price
   - 👥 **Capacity** — min and max guests
   - ✅ **Amenities** — toggle checkboxes
   - 📝 **Description** — rich text description
   - ⭐ **Featured** — toggle to show on homepage
   - 🗺️ **Google Maps** — update Latitude and Longitude
5. Click **"Save Changes"**

### As Partner — Edit Your Own Venue

1. Login → Redirected to `/partner/dashboard`
2. Click **"Venues"** in sidebar
3. Click **"Edit Venue"** next to your venue
4. Same fields available (address, images, pricing, amenities, description)
5. Save changes

---

## 🖼️ How to Change Venue Photos

### Method 1: Use Free Unsplash Image URLs
Images are stored as URLs. Use high-quality wedding venue photos from:
```
https://images.unsplash.com/photo-XXXX?w=1200&q=80
```
Examples of good venue images to use:
- `https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200&q=80` (banquet hall)
- `https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200&q=80` (wedding lawn)
- `https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&q=80` (reception)

### Method 2: Upload to Supabase Storage
1. Go to **Supabase Dashboard** → **Storage** → **Create bucket** named `venue-images`
2. Upload your image
3. Copy the public URL
4. Paste it in the venue's Cover Image or Gallery Images field

---

## 📞 How to Update Admin's Phone / Contact Info

The admin contact number shown on the website is controlled by the environment variable `NEXT_PUBLIC_HOTEL_PHONE`.

**To change it:**
1. Go to `https://github.com/lokgenius-hub/static_subh_vivah` → **Settings** → **Secrets and variables** → **Actions**
2. Add/update secret:
   - **Name:** `NEXT_PUBLIC_HOTEL_PHONE`
   - **Value:** your new phone number (e.g. `7303584266`)
3. Then go to **Actions** → **Deploy to GitHub Pages** → **Run workflow** to rebuild

---

## 📊 How to View Enquiries / Leads

1. Login → Admin Panel
2. Click **"Leads"** in sidebar → All enquiries from the website contact forms
3. Click **"Enquiry Inbox"** → Detailed enquiry view with customer requirements

**You also get an email** at `bhabuasavvy@gmail.com` every time a new enquiry is submitted (after setting up the Edge Function — see below).

---

## 👥 How to Approve New Partners

When a new venue owner registers:
1. Login → Admin Panel → Click **"Users"**
2. Find users with status **"Pending"**
3. Click **"Approve"** to give them access to the Partner Portal
4. Click **"Reject"** to deny access

Approved partners can then login and manage their venue.

---

## 💎 How to Manage Wedding Packages

Packages (Silver / Golden / Diamond) are shown on the Packages page.

1. Login → Admin Panel → Click **"Packages"**
2. Click **"Add Package"** or edit existing ones
3. Set:
   - Package name and badge color
   - Price and "per couple" text
   - List of features included
   - Whether it is "Popular" (shows highlighted)

---

## 📝 How to Manage Blog Posts

1. Login → Admin Panel → Click **"Blog & Ads"**
2. Add/edit/delete blog posts
3. Each post has: Title, Slug (URL), Content, Cover Image, Tags, Author

---

## ⭐ How to Manage Testimonials

1. Login → Admin Panel → **Settings** → Testimonials section
2. Or customers can submit testimonials at `/testimonials` (auto-published)

---

## 🔑 GitHub Secrets — What to Set

Go to: `https://github.com/lokgenius-hub/static_subh_vivah` → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

| Secret Name | Value | Where to get |
|-------------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://qvuxmnysvmebwpiupink.supabase.co` | Supabase Dashboard → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGci...` (anon key) | Supabase Dashboard → Project Settings → API |
| `NEXT_PUBLIC_ADMIN_EMAIL` | `bhabuasavvy@gmail.com` | Your admin email |
| `NEXT_PUBLIC_HOTEL_PHONE` | `7303584266` | Your contact number |

> **Note:** `RESEND_API_KEY`, `GROQ_API_KEY`, and `ADMIN_EMAIL` go into **Supabase Edge Function secrets** (not GitHub) — see Supabase Edge Functions setup below.

---

## 🤖 Supabase Edge Functions Setup (One-Time)

These run the AI chatbot and email notifications **without exposing any API keys in code**.

### Install Supabase CLI
```powershell
npm install -g supabase
supabase login
supabase link --project-ref qvuxmnysvmebwpiupink
```

### Deploy functions and set secrets
```powershell
supabase functions deploy chat
supabase functions deploy notify-lead

supabase secrets set GROQ_API_KEY=<your-groq-key-from-console.groq.com>
supabase secrets set RESEND_API_KEY=<your-resend-key-from-resend.com>
supabase secrets set ADMIN_EMAIL=bhabuasavvy@gmail.com
```

### Create DB Webhook for email notifications
In **Supabase Dashboard → Database → Webhooks → Create webhook**:
- **Name:** `notify-new-lead`
- **Table:** `leads` — Events: `INSERT`
- **URL:** `https://qvuxmnysvmebwpiupink.supabase.co/functions/v1/notify-lead`

---

## 🗺️ How to Update Venue Map Location

1. Go to **Google Maps** → Search for the venue
2. Right-click on the venue pin → Copy the coordinates (e.g. `25.0392, 83.6082`)
3. In Admin Panel → All Venues → Edit the venue
4. Update **Latitude** (25.0392) and **Longitude** (83.6082)
5. Save — the map embed and "Get Directions" button will show the new location

---

## 🔄 How to Re-deploy the Website

Any push to the `main` branch auto-deploys. To manually trigger:
1. Go to `https://github.com/lokgenius-hub/static_subh_vivah` → **Actions**
2. Click **"Deploy to GitHub Pages"** → **"Run workflow"** → **"Run workflow"**

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| Admin page shows 404 | Go to `/login` first, not `/admin` directly |
| Venue card not showing | Check venue is marked `is_active = true` in Supabase |
| Email not received | Run `supabase functions deploy notify-lead` and set up the DB webhook |
| Chatbot not responding | Run `supabase functions deploy chat` and set `GROQ_API_KEY` secret |
| Build fails on GitHub | Check all 4 Secrets are set in GitHub repo settings |
| Login redirect loop | Clear browser cookies and try again |

---

*Last updated: March 2026 · VivahSthal Platform*

---

## 1. Database Setup (One-Time)

### Run Migration 004

Go to your **Supabase Dashboard → SQL Editor** and run the contents of:

```
supabase/migrations/004_inbox_packages_testimonials.sql
```

This creates 4 new tables:
- `enquiry_inbox` — Stores all customer enquiries
- `marriage_packages` — Silver/Golden/Diamond wedding packages
- `testimonials` — Customer testimonials
- `success_stories` — Wedding success stories

It also seeds demo data for Bhabua/Sasaram area.

---

## 2. Environment Variables

Create a `.env.local` file with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
RESEND_API_KEY=your_resend_api_key
```

---

## 3. Running Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 4. Public Pages

| Page | URL | Description |
|------|-----|-------------|
| Home | `/` | Hero, featured venues, packages preview, testimonials |
| Venues | `/venues` | Browse & filter all venues |
| Venue Detail | `/venues/[slug]` | Individual venue with enquiry form |
| Packages | `/packages` | Silver/Golden/Diamond wedding packages |
| Testimonials | `/testimonials` | All customer testimonials |
| Success Stories | `/stories` | Wedding success stories |
| Story Detail | `/stories/[slug]` | Individual success story |
| Enquiry | `/enquiry` | General enquiry form + WhatsApp |
| Blog | `/blog` | Wedding tips & articles |
| About | `/about` | About VivahSthal |

---

## 5. Partner Portal (Vendors)

**URL:** `/partner/venues`

### Access
- Register as vendor at `/partner-register`
- Login at `/login`

### Features
- **My Venues** — Add/edit venues, upload images, set pricing
- **Enquiry Inbox** — View customer enquiries for your venues only
- **Availability Calendar** — Manage venue slot availability
- **Settings** — Update profile & contact info

### Enquiry Inbox (`/partner/inbox`)
- See all enquiries for YOUR venues only
- Click to expand: customer phone, email, event date, guest count, budget
- Quick actions: Call, WhatsApp
- Filter: All / Unread / Read
- Search by customer name, phone, or venue

---

## 6. Admin Panel (Super Admin)

**URL:** `/admin/leads`

### Access
- Set up admin via `/api/setup-admin` (first time)
- Or assign `admin` role in Supabase `profiles` table

### Admin Navigation
| Menu Item | Description |
|-----------|-------------|
| **Leads** | All customer leads/enquiries |
| **Enquiry Inbox** | All enquiries across ALL venues (vendor + admin view) |
| **All Venues** | Manage all vendor venues |
| **Packages** | Create/edit/delete marriage packages |
| **Users** | Manage user roles |
| **Blog & Ads** | Create blog posts |
| **Settings** | Platform settings |

### Managing Marriage Packages (`/admin/packages`)

1. Click **"Add Package"**
2. Fill in:
   - **Name** — e.g., "Golden Wedding Package"
   - **Tier** — Silver / Golden / Diamond / Custom
   - **Price** — Package price in ₹
   - **Original Price** — Strikethrough price (for showing discount)
   - **Features** — JSON array: `[{"title":"Venue Decoration","desc":"Premium floral decoration"}]`
   - **Inclusions** — Comma-separated: `Venue, Catering, Photography, DJ`
   - **Popular** — Toggle to mark as "Most Popular"
   - **Display Order** — Lower number = shown first
3. Click **Save**

### Managing Enquiry Inbox (`/admin/inbox`)

- View ALL enquiries from all vendors
- Search by customer name, phone, email, or venue
- Filter: All / Unread / Read
- Click to expand: full customer details, event date, budget
- Add admin notes for internal tracking
- Quick actions: Call, WhatsApp

---

## 7. How the Enquiry System Works

When a customer submits an enquiry (via venue page or enquiry page):

1. **Email to Vendor** — Automated email via Resend
2. **Email to Super Admin** — Same enquiry email sent to admin
3. **Saved to Database** — Stored in `enquiry_inbox` table
4. **WhatsApp Links** — Logged in console (production: auto-redirect)
5. **Vendor sees** only their own enquiries in Partner Portal
6. **Admin sees** ALL enquiries in Admin Panel

---

## 8. SEO Configuration

The platform is optimized for local SEO targeting:
- **Primary:** Bhabua, Sasaram
- **Secondary:** Mohania, Chainpur, Dehri, Bikramganj, Kochas, Rohtas
- **District:** Kaimur, Rohtas

### Key SEO Files
- Root metadata: `src/app/layout.tsx`
- Footer schema: `src/components/layout/footer.tsx` (Schema.org JSON-LD)
- Package page: `src/app/(public)/packages/page.tsx`
- Stories page: `src/app/(public)/stories/page.tsx`

### To Update SEO
1. Edit metadata in respective `page.tsx` files
2. Update `footerLinks` in `footer.tsx` for city links
3. Update `CITIES` in `src/lib/constants.ts` to add new cities

---

## 9. Adding Content

### Add a Testimonial
Insert into `testimonials` table in Supabase:
```sql
INSERT INTO testimonials (couple_name, location, venue_name, rating, text, is_featured)
VALUES ('Name & Name', 'City', 'Venue Name', 5, 'Their testimonial text...', true);
```

### Add a Success Story
Insert into `success_stories` table:
```sql
INSERT INTO success_stories (couple_name, slug, location, venue_name, story, excerpt, is_published)
VALUES ('Name & Name', 'name-and-name-city', 'City', 'Venue Name',
  '<p>Their full story in HTML...</p>',
  'Short excerpt for listing page',
  true);
```

### Add a Blog Post
Use Admin Panel → Blog & Ads → Create Post

---

## 10. Deployment (Netlify)

The project is configured for Netlify deployment:

1. Push to `main` branch → Auto-deploy triggers
2. Build command: `npm run build`
3. Publish directory: `.next`
4. Environment variables: Set in Netlify Dashboard → Site Settings → Environment

### After Deployment Checklist
- [ ] Run migration 004 in Supabase SQL Editor
- [ ] Verify all pages load correctly
- [ ] Test enquiry form submission
- [ ] Check admin inbox receives enquiries
- [ ] Verify partner inbox shows only their enquiries

---

## 11. Tech Stack

| Technology | Purpose |
|-----------|---------|
| Next.js 15 | React framework (App Router) |
| Supabase | Database + Auth + Storage |
| Tailwind CSS v4 | Styling |
| Framer Motion | Animations |
| Resend | Transactional emails |
| Lucide React | Icons |
| AI SDK | AI chatbot |

---

## 12. Folder Structure

```
src/
  app/
    (admin)/admin/     → Admin panel pages
    (partner)/partner/ → Vendor portal pages
    (public)/          → Public website pages
    api/               → API routes
  components/
    layout/            → Navbar, Footer
    ui/                → Reusable UI components
    venue/             → Venue-specific components
  lib/
    actions.ts         → Server actions (all DB operations)
    types.ts           → TypeScript interfaces
    constants.ts       → Cities, venue types, etc.
    supabase/          → Supabase client configs
supabase/
  migrations/          → SQL migration files
```

---

## Support

For technical issues, check:
1. Supabase Dashboard → Logs for database errors
2. Netlify Dashboard → Deploy logs for build errors
3. Browser console for client-side errors
