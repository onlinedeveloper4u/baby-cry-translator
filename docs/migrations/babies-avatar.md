# Migration: Baby Avatars (Supabase Storage + DB column)

This migration adds avatar support for baby profiles using Supabase Storage and a new `avatar_url` column on the `babies` table.

## 1) Database changes (SQL)

Run these in Supabase SQL editor:

```sql
-- 1. Add avatar_url column if it doesn't exist
alter table public.babies
  add column if not exists avatar_url text;
```

## 2) Storage bucket

Create a bucket named `baby-avatars` in Supabase Storage.

### Option A: Public avatars (simple)
- Create bucket `baby-avatars` with Public enabled.
- No custom policies are needed beyond default public read.

Pros: Simpler. Avatars load via public URLs without signed requests.
Cons: Publicly accessible if someone knows the URL.

### Option B: Private avatars (more secure)
- Create bucket `baby-avatars` with Public disabled.
- Add RLS policies for authenticated users to upload; serve via signed URLs in app.

Example policies (adjust roles as needed):

```sql
-- Allow authenticated users to upload/update their own files
create policy "allow upload for authenticated"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'baby-avatars'
  );

create policy "allow update for authenticated"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'baby-avatars'
  );

-- Allow authenticated users to select (read) objects
create policy "allow read for authenticated"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'baby-avatars');
```

If using private avatars, update the app code to request signed URLs. Currently the app uses public URLs returned by `getPublicUrl`.

## 3) App configuration reminders

- iOS photo library permission text (optional, recommended): add to `app.json` or `app.config.*`:

```jsonc
{
  "ios": {
    "infoPlist": {
      "NSPhotoLibraryUsageDescription": "We use your photo library to set your baby's profile picture."
    }
  }
}
```

- After changing native modules or config: restart bundler

```
npx expo start -c
```

## 4) What the app expects

- Table `public.babies` with columns (minimum):
  - `id` (uuid/text), `user_id` (uuid/text), `name` (text), `birth_date` (date/text), `gender` (text), `notes` (text), `avatar_url` (text)
- Storage bucket `baby-avatars`
  - Public (Option A) or Private (Option B) per your choice.

## 5) Switching to private avatars (optional code note)

If you select Option B (private), replace the `getPublicUrl` usage with signed URL generation, e.g.:

```ts
const { data, error } = await supabase.storage
  .from('baby-avatars')
  .createSignedUrl(path, 60 * 60); // 1 hour
if (error) throw error;
const signedUrl = data.signedUrl;
```

You'll also need a way to re-generate signed URLs when they expire (e.g., on focus or pull-to-refresh).

## 6) Testing checklist

- Add a new baby with an avatar (authenticated) → file appears in `baby-avatars` and avatar displays on list and edit screens.
- Edit an existing baby → change avatar; ensure it updates.
- Guest user → avatar preview works locally; not persisted to Storage (by design).
- iOS/Android date picker works and saves date.
