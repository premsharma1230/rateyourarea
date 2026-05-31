# RateYourArea — Supabase Backend

All Supabase client code, API helpers, and SQL schema live in this folder. The Next.js frontend imports from `@/backend/...`.

## Setup order

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and sign in (free tier).
2. **New project** → name it `rateyourarea` (or similar) → choose a region and database password.

### 2. Run the SQL schema

1. In the Supabase dashboard, open **SQL Editor**.
2. Copy the full contents of `backend/supabase/schema.sql`.
3. Run it. This creates:
   - `areas`, `reviews`, `profiles` tables
   - `area_stats` view
   - Row Level Security policies
   - 10 seed Gurugram areas

**Already have a project?** Run the migration for signup profile fields:

1. Open **SQL Editor**.
2. Copy and run `backend/supabase/migrations/add_profile_signup_fields.sql`.
3. This adds `area_name`, `duration_lived`, `is_current_resident`, `bill_file_name`, and `onboarding_status` to `profiles` (safe to re-run).

### 3. Environment variables

In the project root, create `.env.local` (never commit this file):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

Get both values from **Settings → API** in the Supabase dashboard.

`.env.example` in the repo shows the same keys with placeholders.

### 4. Google OAuth (optional)

1. **Authentication → Providers → Google** → enable.
2. Add redirect URLs:
   - `http://localhost:3000/auth/callback` (local dev)
   - `https://your-domain.com/auth/callback` (production)
3. Use the Google Cloud OAuth client ID/secret in Supabase.

Email/password auth works without Google.

### 5. Run the app

```bash
npm run dev
```

- Without real env keys, the app falls back to static seed data and localStorage.
- With keys configured, auth and reviews use Supabase.

## Folder layout

```
backend/
  README.md
  supabase/schema.sql    — database schema + seed
  supabase/migrations/add_profile_signup_fields.sql — profile signup columns (existing projects)
  lib/
    supabase.js          — browser Supabase client
    supabase-server.js   — server client (OAuth callback)
    config.js            — isSupabaseConfigured()
  api/
    auth.js              — signUp, signIn, signInWithGoogle, signOut, getUser, onAuthChange
    reviews.js           — submitAnonymousReview, submitUserReview, getAreaReviews, …
    index.js             — re-exports
```

## Frontend imports

The Next.js app uses path alias `@/backend/*` (see `jsconfig.json`):

```js
import { signIn, signOut } from "@/backend/api/auth";
import { submitAnonymousReview } from "@/backend/api/reviews";
import { isSupabaseConfigured } from "@/backend/lib/config";
```

OAuth callback route: `src/app/auth/callback/route.js` → `@/backend/lib/supabase-server`.
