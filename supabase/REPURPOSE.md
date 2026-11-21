# Database repurposing (22 November 2026)

Requested action: retire legacy CHOVHA/NA​TIS application data, preserve the Supabase project infrastructure, use it for UNI RESIDENTIA.

Project ref: `cinpqzwltwmuzqjpazju`
API URL: `https://cinpqzwltwmuzqjpazju.supabase.co`

Database migration actions:
- Dropped legacy `public.natis_*` tables (seven), the `natis_private` schema, NA​TIS event trigger and functions.
- Removed legacy NA​TIS-specific Storage RLS policies.
- Created `public.applications` with applicant-scoped SELECT and INSERT policies, with RLS enabled.
- No existing Supabase Auth users or Storage objects were present when checked.
- Existing Auth service, system schemas, migrations history and two **empty** NA​TIS storage buckets remain. Remove those buckets via Supabase Storage API/Dashboard, not SQL.
- Connected the website to the existing project with its public publishable key. No privileged key was exposed.

Notes:
- The project may still display the name **CHOVHA** in the dashboard, since project renaming is not supported by the connected integration.
- Configure Auth Site URL and redirect allow-list for the deployed domain; review email confirmation and SMTP limits.
- Check real registration/login/application workflows with separate verified user accounts, including RLS ownership restrictions.
- Approve accurate listings, business/contact details, payment terms and full POPIA privacy/retention policy before public launch.
