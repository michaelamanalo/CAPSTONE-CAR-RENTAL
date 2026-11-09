# Review proposal: durable Supabase Auth UUID linkage

**Status: review only. No SQL in this document or the repository migrations has been run against Supabase.** The backend now requires an exact UUID link and has no email fallback. Until the identity migration is manually reviewed/applied and approved accounts are linked, protected API access fails closed.

The guarded additive migration is [202611090001_users_auth_uuid_link.sql](../../supabase/migrations/202611090001_users_auth_uuid_link.sql). The RLS proposal, role matrix, catalog preflight, and account validation guide are in [PHASE_1_5_SECURITY_MODEL.md](../PHASE_1_5_SECURITY_MODEL.md). Do not run the illustrative statements below instead of the guarded file.

## Why this relationship is needed

Supabase Auth UUIDs and `public."USERS".user_id` may differ. The backend verifies the bearer token through Supabase Auth, then queries `USERS.auth_user_id` with the immutable Auth UUID. It reads the profile's existing `user_id` and role from the database. It never equates the two IDs or uses email as an automatic matching key. Email changes therefore do not change the linked identity.

## Proposed additive schema

After confirming the target schema and current constraints, the migration adds a nullable `auth_user_id uuid`, partial unique index, and `NOT VALID` foreign key to `auth.users(id)`. It checks the existing `USERS.user_id` primary key, UUID types, and duplicate link values. It does not modify profile IDs, booking customer IDs, profile rows, or auth identities. The migration's SQL is intentionally not run by application startup.

## Linking process after migration approval

1. Review the authorized Auth account roster and the intended `USERS.user_id` row independently. Do not infer links from email or automatically merge records.
2. Confirm the exact Auth UUID in the trusted Supabase Auth account record and the existing profile primary key.
3. Have an authorized database operator update `auth_user_id` for one reviewed profile at a time. Preserve `user_id` and all booking references.
4. Query for duplicate links and missing/orphaned links; the unique index prevents duplicate UUID assignments.
5. Validate `users_auth_user_id_fkey` only after confirming account deletion and retention behavior.
6. Verify one admin, staff, and customer account through API and direct PostgREST/RLS tests, including inactive, unlinked, and changed-email cases.

Reverting the application code does not require dropping the linkage column. Do not remove the column after it contains links without a reviewed export and explicit rollback plan.
