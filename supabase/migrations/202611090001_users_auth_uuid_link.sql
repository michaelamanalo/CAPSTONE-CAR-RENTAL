
-- ============================================================
-- G-FLEET | PHASE 1.5
-- SUPABASE AUTH UUID IDENTITY LINKAGE
-- ============================================================
--
-- Purpose:
--   Establish a permanent relationship between G-FLEET
--   user profiles and Supabase Authentication accounts.
--
-- Target:
--   public."USERS"
--
-- Changes:
--   1. Verify existing database structures.
--   2. Add a nullable auth_user_id UUID column.
--   3. Prevent duplicate Auth UUID assignments.
--   4. Establish a foreign key to auth.users(id).
--   5. Preserve all existing records and relationships.
--
-- Safety:
--   - No tables are dropped.
--   - No existing user IDs are modified.
--   - No booking relationships are changed.
--   - No accounts are automatically linked.
--   - No RLS policies are modified.
--   - All changes execute within one transaction.
--
-- Deployment:
--   Review and execute manually in Supabase SQL Editor.
-- ============================================================

BEGIN;

-- ============================================================
-- STEP 1: DATABASE PREFLIGHT VALIDATION
-- ============================================================

DO $$
DECLARE
    v_users_oid oid;
BEGIN

    -- Verify that the USERS table exists.
    v_users_oid := to_regclass('public."USERS"');

    IF v_users_oid IS NULL THEN
        RAISE EXCEPTION
            'G-FLEET: public."USERS" table does not exist.';
    END IF;

    -- Verify that user_id is the UUID primary key.
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint AS c
        JOIN pg_attribute AS a
            ON a.attrelid = c.conrelid
           AND a.attnum = c.conkey[1]
        WHERE c.conrelid = v_users_oid
          AND c.contype = 'p'
          AND cardinality(c.conkey) = 1
          AND a.attname = 'user_id'
          AND a.atttypid = 'uuid'::regtype
          AND NOT a.attisdropped
    ) THEN
        RAISE EXCEPTION
            'G-FLEET: USERS.user_id must be a UUID primary key.';
    END IF;

    -- Verify Supabase Authentication.
    IF to_regclass('auth.users') IS NULL THEN
        RAISE EXCEPTION
            'G-FLEET: Supabase auth.users table is missing.';
    END IF;

    -- Verify that auth.users.id uses UUID.
    IF NOT EXISTS (
        SELECT 1
        FROM pg_attribute
        WHERE attrelid = 'auth.users'::regclass
          AND attname = 'id'
          AND atttypid = 'uuid'::regtype
          AND NOT attisdropped
    ) THEN
        RAISE EXCEPTION
            'G-FLEET: auth.users.id must use UUID.';
    END IF;

    -- Reject an incompatible existing column.
    IF EXISTS (
        SELECT 1
        FROM pg_attribute
        WHERE attrelid = v_users_oid
          AND attname = 'auth_user_id'
          AND NOT attisdropped
          AND atttypid <> 'uuid'::regtype
    ) THEN
        RAISE EXCEPTION
            'G-FLEET: Existing auth_user_id has an incompatible type.';
    END IF;

    -- Existing identity linkage must remain nullable.
    IF EXISTS (
        SELECT 1
        FROM pg_attribute
        WHERE attrelid = v_users_oid
          AND attname = 'auth_user_id'
          AND NOT attisdropped
          AND attnotnull
    ) THEN
        RAISE EXCEPTION
            'G-FLEET: Existing auth_user_id must be nullable.';
    END IF;

    RAISE NOTICE
        'G-FLEET: Database preflight validation passed.';

END;
$$;


-- ============================================================
-- STEP 2: ADD SUPABASE AUTH IDENTITY COLUMN
-- ============================================================

ALTER TABLE public."USERS"
    ADD COLUMN IF NOT EXISTS auth_user_id uuid;

COMMENT ON COLUMN public."USERS".auth_user_id IS
    'Immutable reference to the corresponding Supabase Auth user. '
    'Assigned only after authorized identity verification.';


-- ============================================================
-- STEP 3: VERIFY EXISTING IDENTITY ASSIGNMENTS
-- ============================================================

DO $$
DECLARE
    v_duplicate_exists boolean;
    v_users_oid oid;
    v_index_oid oid;
BEGIN

    v_users_oid := 'public."USERS"'::regclass;

    -- Check for duplicate non-null Auth UUIDs.
    SELECT EXISTS (
        SELECT 1
        FROM public."USERS"
        WHERE auth_user_id IS NOT NULL
        GROUP BY auth_user_id
        HAVING COUNT(*) > 1
    )
    INTO v_duplicate_exists;

    IF v_duplicate_exists THEN
        RAISE EXCEPTION
            'G-FLEET: Duplicate auth_user_id values detected.';
    END IF;

    -- Check whether the intended index name is in use.
    v_index_oid :=
        to_regclass('public.users_auth_user_id_unique');

    IF v_index_oid IS NOT NULL THEN

        -- Verify the existing index is a valid,
        -- unique, single-column partial index.
        IF NOT EXISTS (
            SELECT 1
            FROM pg_index AS i
            JOIN pg_attribute AS a
                ON a.attrelid = i.indrelid
               AND a.attnum = i.indkey[0]
            WHERE i.indexrelid = v_index_oid
              AND i.indrelid = v_users_oid
              AND i.indisunique
              AND i.indisvalid
              AND i.indisready
              AND i.indnkeyatts = 1
              AND i.indnatts = 1
              AND a.attname = 'auth_user_id'
              AND regexp_replace(
                    lower(
                        pg_get_expr(
                            i.indpred,
                            i.indrelid
                        )
                    ),
                    '[[:space:]()"]',
                    '',
                    'g'
                  ) = 'auth_user_idisnotnull'
        ) THEN
            RAISE EXCEPTION
                'G-FLEET: Existing Auth UUID index is incompatible.';
        END IF;

    END IF;

    RAISE NOTICE
        'G-FLEET: Identity uniqueness validation passed.';

END;
$$;


-- ============================================================
-- STEP 4: ENFORCE UNIQUE AUTH UUID ASSIGNMENTS
-- ============================================================

CREATE UNIQUE INDEX IF NOT EXISTS
    users_auth_user_id_unique
ON public."USERS" (auth_user_id)
WHERE auth_user_id IS NOT NULL;


-- ============================================================
-- STEP 5: CREATE OR VERIFY AUTH FOREIGN KEY
-- ============================================================

DO $$
DECLARE
    v_existing_fk oid;
BEGIN

    -- Locate an existing constraint with the target name.
    SELECT c.oid
    INTO v_existing_fk
    FROM pg_constraint AS c
    WHERE c.conrelid = 'public."USERS"'::regclass
      AND c.conname = 'users_auth_user_id_fkey';

    IF v_existing_fk IS NULL THEN

        -- Create the relationship without rewriting
        -- existing primary keys or booking references.
        ALTER TABLE public."USERS"
            ADD CONSTRAINT users_auth_user_id_fkey
            FOREIGN KEY (auth_user_id)
            REFERENCES auth.users(id)
            NOT VALID;

        RAISE NOTICE
            'G-FLEET: Auth UUID foreign key created.';

    ELSE

        -- Validate the structure of the existing FK.
        IF NOT EXISTS (
            SELECT 1
            FROM pg_constraint AS c
            JOIN pg_attribute AS local_col
                ON local_col.attrelid = c.conrelid
               AND local_col.attnum = c.conkey[1]
            JOIN pg_attribute AS auth_col
                ON auth_col.attrelid = c.confrelid
               AND auth_col.attnum = c.confkey[1]
            WHERE c.oid = v_existing_fk
              AND c.contype = 'f'
              AND c.confrelid = 'auth.users'::regclass
              AND cardinality(c.conkey) = 1
              AND cardinality(c.confkey) = 1
              AND local_col.attname = 'auth_user_id'
              AND auth_col.attname = 'id'
        ) THEN
            RAISE EXCEPTION
                'G-FLEET: Existing Auth UUID foreign key is incompatible.';
        END IF;

        RAISE NOTICE
            'G-FLEET: Existing Auth UUID foreign key verified.';

    END IF;

END;
$$;


-- ============================================================
-- STEP 6: COMMIT MIGRATION
-- ============================================================

COMMIT;

-- ============================================================
-- END OF G-FLEET AUTH UUID IDENTITY MIGRATION
-- ============================================================
