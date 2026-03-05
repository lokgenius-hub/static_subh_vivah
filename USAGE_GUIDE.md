# VivahSthal — Admin & Usage Guide

## Overview

VivahSthal is a wedding venue marketplace platform serving Bhabua, Sasaram, Kaimur, Rohtas and surrounding areas in Bihar. It includes:

- **Public Website** — Browse venues, packages, testimonials, success stories
- **Partner Portal** — Vendors manage their venues & view enquiries
- **Admin Panel** — Super admin manages everything

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
