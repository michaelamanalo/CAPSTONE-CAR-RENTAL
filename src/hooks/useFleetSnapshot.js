import { useEffect, useState } from 'react';
import { getDatabaseTables } from '../services/api';
import {
  normalizeAlert,
  normalizeBooking,
  normalizeTelemetry,
  normalizeVehicle,
} from '../services/normalize';
import { TABLES } from '../services/tableNames';

function findTable(tables, name) {
  return tables.find((table) => table.name.toLowerCase() === name.toLowerCase());
}

function latestTelemetryByTracker(rows) {
  return rows.map(normalizeTelemetry).reduce((latest, point) => {
    if (point.trackerDeviceId === null || point.trackerDeviceId === undefined) return latest;

    const key = String(point.trackerDeviceId);
    const previous = latest.get(key);
    const timestamp = Date.parse(point.recordedAt || '');
    const previousTimestamp = Date.parse(previous?.recordedAt || '');

    if (!previous || !Number.isFinite(previousTimestamp) || (Number.isFinite(timestamp) && timestamp >= previousTimestamp)) {
      latest.set(key, point);
    }
    return latest;
  }, new Map());
}

function optionalRows(tables, tableName, normalize) {
  const table = findTable(tables, tableName);
  return table && !table.error && Array.isArray(table.rows)
    ? table.rows.map(normalize)
    : null;
}

function loadFleetSnapshot(result) {
  if (result.status === 'error') {
    return { status: 'error', vehicles: [], bookings: null, alerts: null, error: result.message };
  }

  const tables = result.tables || [];
  const vehicleTable = findTable(tables, TABLES.vehicles);
  if (!vehicleTable || vehicleTable.error) {
    return {
      status: 'error',
      vehicles: [],
      bookings: null,
      alerts: null,
      error: vehicleTable?.error || `Table "${TABLES.vehicles}" wasn't found in Supabase.`,
    };
  }

  const telemetryTable = findTable(tables, TABLES.telemetry);
  const telemetryRows = telemetryTable && !telemetryTable.error && Array.isArray(telemetryTable.rows)
    ? telemetryTable.rows
    : [];
  const latestByTracker = latestTelemetryByTracker(telemetryRows);
  const vehicles = (vehicleTable.rows || []).map((row) => {
    const vehicle = normalizeVehicle(row);
    const position = vehicle.trackerDeviceId == null
      ? null
      : latestByTracker.get(String(vehicle.trackerDeviceId));

    return position ? { ...vehicle, ...position, trackerDeviceId: vehicle.trackerDeviceId } : vehicle;
  });

  return {
    status: 'loaded',
    vehicles,
    bookings: optionalRows(tables, TABLES.bookings, normalizeBooking),
    alerts: optionalRows(tables, TABLES.alerts, normalizeAlert),
    error: null,
  };
}

export function useFleetSnapshot() {
  const [snapshot, setSnapshot] = useState({
    status: 'loading',
    vehicles: [],
    bookings: null,
    alerts: null,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    getDatabaseTables().then((result) => {
      if (!cancelled) setSnapshot(loadFleetSnapshot(result));
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return snapshot;
}
