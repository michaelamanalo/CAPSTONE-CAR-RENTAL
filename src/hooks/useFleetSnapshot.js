import { useEffect, useState } from 'react';
import { getAlerts, getBookings, getFleetLocations, getVehicles } from '../services/api';
import { normalizeAlert, normalizeBooking, normalizeTelemetry, normalizeVehicle } from '../services/normalize';

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

    Promise.all([getVehicles(), getFleetLocations(), getBookings(), getAlerts()]).then(([
      vehicleResult,
      locationResult,
      bookingResult,
      alertResult,
    ]) => {
      if (cancelled) return;

      const locationByVehicle = new Map(
        (Array.isArray(locationResult.data) ? locationResult.data : [])
          .map((item) => [String(item.vehicle_id), item.telemetry]),
      );
      const vehicles = (Array.isArray(vehicleResult.data) ? vehicleResult.data : []).map((row) => {
        const vehicle = normalizeVehicle(row);
        const telemetry = locationByVehicle.get(String(vehicle.id));
        return telemetry ? { ...vehicle, ...normalizeTelemetry(telemetry) } : vehicle;
      });
      const errors = [vehicleResult, locationResult, bookingResult, alertResult]
        .filter((result) => !result.success)
        .map((result) => result.error?.message || 'A dashboard resource could not be loaded.');
      setSnapshot({
        status: vehicleResult.success ? 'loaded' : 'error',
        vehicles,
        bookings: bookingResult.success && Array.isArray(bookingResult.data)
          ? bookingResult.data.map(normalizeBooking)
          : null,
        alerts: alertResult.success && Array.isArray(alertResult.data)
          ? alertResult.data.map(normalizeAlert)
          : null,
        error: errors.length ? errors.join(' ') : null,
      });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return snapshot;
}
