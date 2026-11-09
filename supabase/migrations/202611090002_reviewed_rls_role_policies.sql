-- G-FLEET Phase 1.5 — RLS policy proposal. REVIEW AND APPLY MANUALLY ONLY.
-- Run only after the schema/policy inventory in docs/PHASE_1_5_SECURITY_MODEL.md.
-- Existing permissive policies abort this migration: PostgreSQL permissive policies OR
-- together, so adding these policies beside an unknown broad policy would not be safe.
-- This migration grants read access only for current API operations. It does not add
-- booking, alert, messaging or notification mutations.

BEGIN;

DO $$
DECLARE
  expected_tables text[] := ARRAY[
    'USERS', 'VEHICLE', 'BOOKINGS', 'TELEMETRY_LOGS', 'GEOFENCE',
    'EMERGENCY_ALERTS', 'FLEET_ALERTS', 'NOTIFICATIONS', 'MESSAGES',
    'BOOKING_STATUS_HISTORY', 'VEHICLE_ACTIVITY_LOGS', 'GEOFENCE_EVENTS',
    'GEOFENCE_VEHICLES', 'AUDIT_LOGS'
  ];
  missing_tables text[];
BEGIN
  SELECT array_agg(t.table_name)
  INTO missing_tables
  FROM unnest(expected_tables) AS t(table_name)
  WHERE to_regclass(format('public.%I', t.table_name)) IS NULL;
  IF missing_tables IS NOT NULL THEN
    RAISE EXCEPTION 'Preflight failed: missing public tables: %', missing_tables;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_attribute
    WHERE attrelid = 'public."USERS"'::regclass
      AND attname = 'auth_user_id' AND atttypid = 'uuid'::regtype AND NOT attisdropped
  ) THEN
    RAISE EXCEPTION 'Preflight failed: apply and verify the USERS auth_user_id migration first';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public."USERS"'::regclass
      AND conname = 'users_auth_user_id_fkey'
      AND contype = 'f'
      AND confrelid = 'auth.users'::regclass
      AND pg_get_constraintdef(oid) ILIKE 'FOREIGN KEY (auth_user_id) REFERENCES auth.users(id)%'
  ) OR NOT EXISTS (
    SELECT 1
    FROM pg_index i
    JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
    WHERE i.indexrelid = to_regclass('public.users_auth_user_id_unique')
      AND i.indrelid = 'public."USERS"'::regclass
      AND i.indisunique
      AND i.indnkeyatts = 1
      AND i.indnatts = 1
      AND a.attname = 'auth_user_id'
      AND pg_get_expr(i.indpred, i.indrelid) ILIKE '%auth_user_id IS NOT NULL%'
  ) THEN
    RAISE EXCEPTION 'Preflight failed: verified unique index and Auth FK are required';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_class c
    JOIN pg_roles r ON r.rolname = current_user
    WHERE c.oid = 'public."USERS"'::regclass
      AND ((c.relowner = r.oid AND NOT c.relforcerowsecurity) OR r.rolsuper OR r.rolbypassrls)
  ) THEN
    RAISE EXCEPTION 'Preflight failed: migration role must own USERS or bypass RLS for the restricted identity helpers';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM (VALUES
      ('USERS', 'user_id'),
      ('BOOKINGS', 'customer_id'),
      ('EMERGENCY_ALERTS', 'acknowledged_by')
    ) AS required(table_name, column_name)
    WHERE NOT EXISTS (
      SELECT 1
      FROM pg_attribute a
      WHERE a.attrelid = to_regclass(format('public.%I', required.table_name))
        AND a.attname = required.column_name
        AND a.atttypid = 'uuid'::regtype
        AND NOT a.attisdropped
    )
  ) THEN
    RAISE EXCEPTION 'Preflight failed: USERS.user_id, BOOKINGS.customer_id and EMERGENCY_ALERTS.acknowledged_by must be uuid';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = ANY(expected_tables)
      AND permissive = 'PERMISSIVE'
  ) THEN
    RAISE EXCEPTION 'Preflight failed: inspect/reconcile existing permissive policies before adding policies';
  END IF;

  IF to_regprocedure('public.gfleet_current_user_profile_id()') IS NOT NULL
    OR to_regprocedure('public.gfleet_current_app_role()') IS NOT NULL THEN
    RAISE EXCEPTION 'Preflight failed: G-FLEET security helper already exists and must be reviewed';
  END IF;
END;
$$;

CREATE FUNCTION public.gfleet_current_user_profile_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
SET row_security = off
AS $$
  SELECT u.user_id
  FROM public."USERS" AS u
  WHERE u.auth_user_id = auth.uid()
    AND u.is_active IS TRUE
  LIMIT 1
$$;

CREATE FUNCTION public.gfleet_current_app_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
SET row_security = off
AS $$
  SELECT lower(u.role::text)
  FROM public."USERS" AS u
  WHERE u.auth_user_id = auth.uid()
    AND u.is_active IS TRUE
  LIMIT 1
$$;

REVOKE ALL ON FUNCTION public.gfleet_current_user_profile_id() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.gfleet_current_app_role() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.gfleet_current_user_profile_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.gfleet_current_app_role() TO authenticated;

-- Fail closed for every listed table. Supporting tables remain inaccessible until their
-- columns, ownership relationships and policies have been independently verified.
ALTER TABLE public."USERS" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."VEHICLE" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."BOOKINGS" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."TELEMETRY_LOGS" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."GEOFENCE" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."EMERGENCY_ALERTS" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."FLEET_ALERTS" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."NOTIFICATIONS" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."MESSAGES" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."BOOKING_STATUS_HISTORY" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."VEHICLE_ACTIVITY_LOGS" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."GEOFENCE_EVENTS" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."GEOFENCE_VEHICLES" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."AUDIT_LOGS" ENABLE ROW LEVEL SECURITY;

-- Remove prior direct table grants before adding the narrow SELECT grants below.
REVOKE ALL PRIVILEGES ON TABLE
  public."USERS", public."VEHICLE", public."BOOKINGS", public."TELEMETRY_LOGS",
  public."GEOFENCE", public."EMERGENCY_ALERTS", public."FLEET_ALERTS",
  public."NOTIFICATIONS", public."MESSAGES", public."BOOKING_STATUS_HISTORY",
  public."VEHICLE_ACTIVITY_LOGS", public."GEOFENCE_EVENTS", public."GEOFENCE_VEHICLES",
  public."AUDIT_LOGS"
FROM PUBLIC, anon, authenticated;

GRANT SELECT (user_id, auth_user_id, email, role, is_active, name, phone_number, created_at, updated_at)
  ON public."USERS" TO authenticated;
GRANT UPDATE (email, role, is_active, name, phone_number, updated_at)
  ON public."USERS" TO authenticated;
GRANT SELECT (vehicle_id, plate_number, model_name, brand, vehicle_type, rental_rate_per_day, status, tracker_device_id, model_year, description, image_url, is_active, updated_at)
  ON public."VEHICLE" TO authenticated;
GRANT UPDATE (plate_number, model_name, brand, vehicle_type, rental_rate_per_day, status, tracker_device_id, model_year, description, image_url, is_active, updated_at)
  ON public."VEHICLE" TO authenticated;
GRANT SELECT (booking_id, customer_id, vehicle_id, start_date, end_date, total_amount, booking_status, created_at)
  ON public."BOOKINGS" TO authenticated;
GRANT SELECT (vehicle_id, latitude, longitude, speed, timestamp)
  ON public."TELEMETRY_LOGS" TO authenticated;
GRANT SELECT (alert_id, booking_id, vehicle_id, alert_type, latitude, longitude, severity_g_force, status, timestamp, reported_by, acknowledged_by, acknowledged_at, resolved_at, description, resolution_notes, updated_at)
  ON public."EMERGENCY_ALERTS" TO authenticated;
GRANT UPDATE (status, acknowledged_by, acknowledged_at, resolved_at, resolution_notes, updated_at)
  ON public."EMERGENCY_ALERTS" TO authenticated;

CREATE POLICY gfleet_users_select_self_or_staff
  ON public."USERS" FOR SELECT TO authenticated
  USING (
    (
      auth_user_id = auth.uid()
      AND (SELECT public.gfleet_current_app_role()) IS NOT NULL
    )
    OR (SELECT public.gfleet_current_app_role()) = 'admin'
    OR (
      (SELECT public.gfleet_current_app_role()) = 'staff'
      AND lower(role::text) IN ('admin', 'staff')
    )
  );

CREATE POLICY gfleet_users_admin_update
  ON public."USERS" FOR UPDATE TO authenticated
  USING ((SELECT public.gfleet_current_app_role()) = 'admin')
  WITH CHECK ((SELECT public.gfleet_current_app_role()) = 'admin');

CREATE POLICY gfleet_vehicles_select_staff
  ON public."VEHICLE" FOR SELECT TO authenticated
  USING ((SELECT public.gfleet_current_app_role()) IN ('admin', 'staff'));

CREATE POLICY gfleet_vehicles_admin_update
  ON public."VEHICLE" FOR UPDATE TO authenticated
  USING ((SELECT public.gfleet_current_app_role()) = 'admin')
  WITH CHECK ((SELECT public.gfleet_current_app_role()) = 'admin');

CREATE POLICY gfleet_bookings_select_owner_or_staff
  ON public."BOOKINGS" FOR SELECT TO authenticated
  USING (
    (SELECT public.gfleet_current_app_role()) IN ('admin', 'staff')
    OR (
      (SELECT public.gfleet_current_app_role()) = 'customer'
      AND customer_id = (SELECT public.gfleet_current_user_profile_id())
    )
  );

CREATE POLICY gfleet_telemetry_select_staff
  ON public."TELEMETRY_LOGS" FOR SELECT TO authenticated
  USING ((SELECT public.gfleet_current_app_role()) IN ('admin', 'staff'));

CREATE POLICY gfleet_emergency_alerts_select_authorized
  ON public."EMERGENCY_ALERTS" FOR SELECT TO authenticated
  USING (
    (SELECT public.gfleet_current_app_role()) = 'admin'
    OR (
      (SELECT public.gfleet_current_app_role()) = 'staff'
      AND (
        acknowledged_by IS NULL
        OR acknowledged_by = (SELECT public.gfleet_current_user_profile_id())
      )
    )
  );

CREATE POLICY gfleet_emergency_alerts_update_authorized
  ON public."EMERGENCY_ALERTS" FOR UPDATE TO authenticated
  USING (
    (SELECT public.gfleet_current_app_role()) = 'admin'
    OR (
      (SELECT public.gfleet_current_app_role()) = 'staff'
      AND (
        acknowledged_by IS NULL
        OR acknowledged_by = (SELECT public.gfleet_current_user_profile_id())
      )
    )
  )
  WITH CHECK (
    (SELECT public.gfleet_current_app_role()) = 'admin'
    OR (
      (SELECT public.gfleet_current_app_role()) = 'staff'
      AND acknowledged_by = (SELECT public.gfleet_current_user_profile_id())
    )
  );

COMMIT;

-- This policy migration is not applied by the application. Before applying, save current
-- grants/policies and review their effect on all clients. No down migration is supplied:
-- restore prior grants/RLS state only from an authorized preflight snapshot and approved plan.
