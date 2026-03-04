# Supabase Setup Guide for EAFLEdu

Follow these steps to set up your Supabase project and get the application running with real data.

## 1. Supabase Project Setup
1. Create a new project at [supabase.com](https://supabase.com).
2. Go to **Project Settings > API** and copy the `Project URL` and `anon public` key.
3. Paste these into your `.env.local` file (I have already created this file for you):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_public_key
   ```

## 2. Database Schema
1. Go to **SQL Editor** in your Supabase dashboard.
2. Create a **New query**.
3. Copy the contents of `lib/supabase/schema.sql` and run it. This will:
   - Create all necessary tables (`profiles`, `questions`, `answers`, `notes`, etc.).
   - Set up Row Level Security (RLS) policies.
   - Create triggers to automatically create user profiles on signup.

## 3. Storage Buckets & Policies
1. Go to **Storage** and create two buckets: `notes` and `images`.
2. Set them to **Public**.
3. **IMPORTANT**: Make sure you have run the Storage Policies part of `lib/supabase/schema.sql`. This allows users to upload files to their own folders within these buckets.

## 4. Account Settings
I have added a **Settings** page at `/settings` (accessible via the profile dropdown in the top bar).
- Users can now change their **Username**, **Full Name**, and **Bio**.
- The database is configured to automatically create a profile on signup, but users can refine their identity in the settings.

## 5. Troubleshooting 403 Errors
If you get a `403 Unauthorized (new row violates RLS policy)` error:
- Ensure you have run **ALL** of `schema.sql` (including the triggers and storage policies).
- Ensure you are logged in.
- For storage, ensure the buckets are named exactly `notes` and `images`.

## 5. Test the App
1. Restart your development server: `npm run dev`.
2. Go to `/login` and sign up or sign in.
3. Try asking a question or uploading a note!

## 6. Known Convention Change
Next.js shows a warning about `middleware.ts`. I have renamed it to `proxy.ts` and updated the expert to `proxy` as per the new convention (Next.js 15+).

---
**Happy coding!**
