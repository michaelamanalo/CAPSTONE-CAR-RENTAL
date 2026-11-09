
-- ======================================================
-- G-FLEET | PHASE 1.5
-- INITIAL READ-ONLY ROW-LEVEL SECURITY
-- ======================================================
-- Run manually after reviewing the current database.
-- Requires verified Auth UUID linkage and active admin.
-- Existing user IDs and booking records are preserved.
-- ======================================================

BEGIN;

-- ======================================================
-- 1. PREFLIGHT CHECKS
-- ======================================================

DO $$
DECLARE
    v_missing text[];
BEGIN
    -- Verify required tables.
    SELECT array_agg(name)
    INTO v_missing
    FROM unnest(ARRAY[
        'USERS',
        'VEHICLE',
        'BOOKINGS',
        'TELEMETRY_LOGS',
        'EMERGENCY_ALERTS'
    ]) AS name
    WHERE to_regclass(format('public.%I', name))
          IS NULL;

    IF v_missing IS NOT NULL THEN
        RAISE EXCEPTION
            'Missing tables: %', v_missing;
    END IF;

    -- Verify identity linkage column.
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'USERS'
          AND column_name = 'auth_user_id'
          AND udt_name = 'uuid'
    ) THEN
        RAISE EXCEPTION
            'Apply Auth UUID migration first';
    END IF;

    -- At least one linked active admin required.
    IF NOT EXISTS (
        SELECT 1
        FROM public."USERS" p
        JOIN auth.users a
          ON a.id = p.auth_user_id
        WHERE p.role::text = 'admin'
          AND p.is_active IS TRUE
    ) THEN
        RAISE EXCEPTION
            'No active linked administrator found';
    END IF;

    -- Preserve existing policies rather than
    -- accidentally combining permissive rules.
    IF EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename IN (
              'USERS',
              'VEHICLE',
              'BOOKINGS',
              'TELEMETRY_LOGS',
              'EMERGENCY_ALERTS'
          )
    ) THEN
        RAISE EXCEPTION
            'Existing policies require review';
    END IF;

    -- Avoid replacing unknown security helpers.
    IF to_regprocedure(
        'public.gfleet_current_app_role()'
    ) IS NOT NULL
    OR to_regprocedure(
        'public.gfleet_current_user_profile_id()'
    ) IS NOT NULL THEN
        RAISE EXCEPTION
            'Existing security helpers require review';
    END IF;

    -- The function owner must be able to read USERS
    -- without recursively invoking USERS RLS.
    IF NOT (
        EXISTS (
            SELECT 1
            FROM pg_roles
            WHERE rolname = current_user
              AND (rolsuper OR rolbypassrls)
        )
        OR (
            EXISTS (
                SELECT 1
                FROM pg_class c
                JOIN pg_roles r
                  ON r.oid = c.relowner
                WHERE c.oid =
                    'public."USERS"'::regclass
                  AND r.rolname = current_user
                  AND NOT c.relforcerowsecurity
            )
        )
    ) THEN
        RAISE EXCEPTION
            'Migration role cannot safely own RLS helpers';
    END IF;

END;
$$;

-- ======================================================
-- 2. IDENTITY LOOKUP FUNCTION
-- ======================================================

CREATE FUNCTION public.gfleet_current_user_profile_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
SET row_security = off
AS $$
    SELECT u.user_id
    FROM public."USERS" u
    WHERE u.auth_user_id = auth.uid()
      AND u.is_active IS TRUE
    LIMIT 1;
$$;

-- ======================================================
-- 3. ROLE LOOKUP FUNCTION
-- ======================================================

CREATE FUNCTION public.gfleet_current_app_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
SET row_security = off
AS $$
    SELECT lower(u.role::text)
    FROM public."USERS" u
    WHERE u.auth_user_id = auth.uid()
      AND u.is_active IS TRUE
    LIMIT 1;
$$;

-- Only authenticated users may execute helpers.
REVOKE ALL ON FUNCTION
    public.gfleet_current_user_profile_id()
FROM PUBLIC, anon, authenticated;

REVOKE ALL ON FUNCTION
    public.gfleet_current_app_role()
FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION
    public.gfleet_current_user_profile_id()
TO authenticated;

GRANT EXECUTE ON FUNCTION
    public.gfleet_current_app_role()
TO authenticated;

-- ======================================================
-- 4. REMOVE UNNECESSARY PRIVILEGES
-- ======================================================

-- These operations are not required by ordinary
-- client-facing G-FLEET database sessions.

REVOKE DELETE, TRUNCATE, TRIGGER, REFERENCES
ON TABLE
    public."USERS",
    public."VEHICLE",
    public."BOOKINGS",
    public."TELEMETRY_LOGS",
    public."GEOFENCE",
    public."EMERGENCY_ALERTS",
    public."FLEET_ALERTS",
    public."NOTIFICATIONS",
    public."MESSAGES",
    public."BOOKING_STATUS_HISTORY",
    public."VEHICLE_ACTIVITY_LOGS",
    public."GEOFENCE_EVENTS",
    public."GEOFENCE_VEHICLES",
    public."AUDIT_LOGS"
FROM PUBLIC, anon, authenticated;

-- Reset client-facing privileges on five core tables.
REVOKE ALL PRIVILEGES ON TABLE
    public."USERS",
    public."VEHICLE",
    public."BOOKINGS",
    public."TELEMETRY_LOGS",
    public."EMERGENCY_ALERTS"
FROM PUBLIC, anon, authenticated;

-- ======================================================
-- 5. GRANT ONLY REQUIRED READ COLUMNS
-- ======================================================

GRANT SELECT (
    user_id,
    auth_user_id,
    name,
    email,
    phone_number,
    role,
    is_active,
    created_at,
    updated_at
)
ON public."USERS"
TO authenticated;

GRANT SELECT (
    vehicle_id,
    plate_number,
    model_name,
    brand,
    vehicle_type,
    rental_rate_per_day,
    status,
    tracker_device_id,
    model_year,
    description,
    image_url,
    is_active,
    updated_at
)
ON public."VEHICLE"
TO authenticated;

GRANT SELECT (
    booking_id,
    customer_id,
    vehicle_id,
    start_date,
    end_date,
    total_amount,
    booking_status,
    created_at
)
ON public."BOOKINGS"
TO authenticated;

GRANT SELECT (
    vehicle_id,
    latitude,
    longitude,
    speed,
    "timestamp"
)
ON public."TELEMETRY_LOGS"
TO authenticated;

GRANT SELECT (
    alert_id,
    booking_id,
    vehicle_id,
    alert_type,
    latitude,
    longitude,
    severity_g_force,
    status,
    "timestamp",
    reported_by,
    acknowledged_by,
    acknowledged_at,
    resolved_at,
    description,
    resolution_notes,
    updated_at
)
ON public."EMERGENCY_ALERTS"
TO authenticated;

-- ======================================================
-- 6. ENSURE RLS IS ENABLED
-- ======================================================

ALTER TABLE public."USERS"
ENABLE ROW LEVEL SECURITY;

ALTER TABLE public."VEHICLE"
ENABLE ROW LEVEL SECURITY;

ALTER TABLE public."BOOKINGS"
ENABLE ROW LEVEL SECURITY;

ALTER TABLE public."TELEMETRY_LOGS"
ENABLE ROW LEVEL SECURITY;

ALTER TABLE public."EMERGENCY_ALERTS"
ENABLE ROW LEVEL SECURITY;

-- ======================================================
-- 7. USERS POLICIES
-- ======================================================

-- Admin: all profiles
-- Staff: admin/staff profiles
-- Customer: own profile

CREATE POLICY gfleet_users_read
ON public."USERS"
FOR SELECT TO authenticated
USING (
    (
        auth_user_id = auth.uid()
        AND (
            SELECT public.gfleet_current_app_role()
        ) IS NOT NULL
    )
    OR (
        SELECT public.gfleet_current_app_role()
    ) = 'admin'
    OR (
        (
            SELECT public.gfleet_current_app_role()
        ) = 'staff'
        AND role::text IN ('admin', 'staff')
    )
);

-- ======================================================
-- 8. VEHICLE POLICY
-- ======================================================

CREATE POLICY gfleet_vehicles_read
ON public."VEHICLE"
FOR SELECT TO authenticated
USING (
    (
        SELECT public.gfleet_current_app_role()
    ) IN ('admin', 'staff')
);

-- ======================================================
-- 9. BOOKING POLICY
-- ======================================================

CREATE POLICY gfleet_bookings_read
ON public."BOOKINGS"
FOR SELECT TO authenticated
USING (
    (
        SELECT public.gfleet_current_app_role()
    ) IN ('admin', 'staff')

    OR (
        (
            SELECT public.gfleet_current_app_role()
        ) = 'customer'
        AND customer_id = (
            SELECT public.gfleet_current_user_profile_id()
        )
    )
);

-- ======================================================
-- 10. TELEMETRY POLICY
-- ======================================================

CREATE POLICY gfleet_telemetry_read
ON public."TELEMETRY_LOGS"
FOR SELECT TO authenticated
USING (
    (
        SELECT public.gfleet_current_app_role()
    ) IN ('admin', 'staff')
);

-- ======================================================
-- 11. EMERGENCY ALERT POLICY
-- ======================================================

CREATE POLICY gfleet_emergency_alerts_read
ON public."EMERGENCY_ALERTS"
FOR SELECT TO authenticated
USING (
    (
        SELECT public.gfleet_current_app_role()
    ) IN ('admin', 'staff')
);

-- ======================================================
-- 12. COMPLETE MIGRATION
-- ======================================================

COMMIT;
