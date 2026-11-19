import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTable } from '../hooks/useTable';
import { normalizeAlert, normalizeBooking, normalizeVehicle } from '../services/normalize';
import { TABLES } from '../services/tableNames';
import DataState from '../components/DataState';
import PageHeader from '../components/PageHeader';
import './ActivityLogs.css';

function formatDate(value, options) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return 'Date unavailable';
  return new Intl.DateTimeFormat('en-PH', { timeZone: 'Asia/Manila', ...options }).format(date);
}

function dateKey(value) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return '';
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Manila', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return values.year + '-' + values.month + '-' + values.day;
}

function formatDateRange(from, through) {
  const labelFor = (value) => formatDate(value + 'T12:00:00+08:00', { month: 'short', day: 'numeric', year: 'numeric' });
  if (from && through) return labelFor(from) + ' to ' + labelFor(through);
  if (from) return 'From ' + labelFor(from);
  if (through) return 'Through ' + labelFor(through);
  return 'All dates';
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]);
}

function createWordDocument(entries, vehicle, vehicleCount, dateRange) {
  const reportTitle = vehicle ? 'Vehicle log - ' + vehicle.model + ' (' + vehicle.id + ')' : 'Vehicle logs - All car units';
  const printedAt = formatDate(new Date().toISOString(), {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
  const rows = entries.length
    ? entries.map((entry) => (
      '<tr><td>' + escapeHtml(formatDate(entry.time, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }))
        + '</td><td>' + escapeHtml(entry.vehicleId + ' - ' + entry.vehicleName)
        + '</td><td>' + escapeHtml(entry.renter || 'Not linked')
        + '</td><td>' + escapeHtml(entry.text) + '</td></tr>'
    )).join('')
    : '<tr><td colspan="4">No log records for this selection.</td></tr>';
  const scope = vehicle
    ? 'Unit ' + escapeHtml(vehicle.id) + ' | ' + escapeHtml(vehicle.plate)
    : 'All ' + vehicleCount + ' car units';
  const documentHtml = '<!doctype html><html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" lang="en">'
    + '<head><meta charset="utf-8"><title>' + escapeHtml(reportTitle) + '</title><style>'
    + 'body{font-family:Arial,sans-serif;color:#24343b}h1{margin:0 0 6px;font-size:22px}'
    + '.meta{margin:0 0 20px;color:#53656b;font-size:12px}table{width:100%;border-collapse:collapse}'
    + 'th,td{border:1px solid #cbd4d4;padding:9px 10px;text-align:left;vertical-align:top}'
    + 'th{color:#24343b;background:#eef3f1;font-size:11px;text-transform:uppercase}'
    + 'td{font-size:12px;line-height:1.4}tr{page-break-inside:avoid}'
    + '</style></head><body><h1>' + escapeHtml(reportTitle) + '</h1><p class="meta">'
    + scope + ' | Dates: ' + escapeHtml(dateRange) + ' | Printed ' + escapeHtml(printedAt) + '</p><table><thead><tr>'
    + '<th>Date &amp; time</th><th>Car unit</th><th>Renter</th><th>Activity</th></tr></thead><tbody>'
    + rows + '</tbody></table></body></html>';
  const unitName = (vehicle?.id || 'all-units').toLowerCase().replace(/[^a-z0-9-]+/g, '-');
  const date = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
  const url = URL.createObjectURL(new Blob(['\uFEFF', documentHtml], { type: 'application/msword;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'sgt-car-logs-' + unitName + '-' + date + '.doc';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function ActivityLogs() {
  const bookingsQuery = useTable(TABLES.bookings, normalizeBooking);
  const alertsQuery = useTable(TABLES.alerts, normalizeAlert);
  const vehiclesQuery = useTable(TABLES.vehicles, normalizeVehicle);
  const [vehicleId, setVehicleId] = useState('all');
  const [notice, setNotice] = useState('');
  const [exportAction, setExportAction] = useState('');
  const [exportScope, setExportScope] = useState('all');
  const [exportFrom, setExportFrom] = useState('');
  const [exportThrough, setExportThrough] = useState('');
  const [printData, setPrintData] = useState(null);
  const menuRef = useRef(null);
  const exportDialogRef = useRef(null);
  const loading = bookingsQuery.status === 'loading' || alertsQuery.status === 'loading' || vehiclesQuery.status === 'loading';
  const firstError = bookingsQuery.status === 'error' ? bookingsQuery.error
    : alertsQuery.status === 'error' ? alertsQuery.error
      : vehiclesQuery.status === 'error' ? vehiclesQuery.error : null;
  const vehicles = useMemo(
    () => vehiclesQuery.status === 'loaded' ? vehiclesQuery.rows : [],
    [vehiclesQuery.status, vehiclesQuery.rows],
  );

  const entries = useMemo(() => {
    const bookingsById = new Map(
      (bookingsQuery.status === 'loaded' ? bookingsQuery.rows : []).map((booking) => [String(booking.id), booking]),
    );
    const bookingEntries = bookingsQuery.status === 'loaded'
      ? bookingsQuery.rows.map((booking) => ({
        id: 'booking-' + booking.id,
        sourceId: booking.id,
        sourceTable: 'BOOKINGS',
        vehicleId: booking.vehicleId,
        time: booking.start,
        renter: booking.customer,
        text: 'Booking ' + booking.id + ' (' + booking.customer + ') - ' + booking.status,
      }))
      : [];
    const alertEntries = alertsQuery.status === 'loaded'
      ? alertsQuery.rows.map((alert) => ({
        id: 'alert-' + alert.id,
        sourceId: alert.id,
        sourceTable: 'EMERGENCY_ALERTS',
        vehicleId: alert.vehicleId,
        time: alert.time,
        renter: bookingsById.get(String(alert.bookingId))?.customer || 'Not linked',
        text: 'Alert: ' + alert.message + ' - ' + (alert.acknowledged ? 'Acknowledged' : 'Open'),
      }))
      : [];
    return [...bookingEntries, ...alertEntries].map((entry) => {
      const vehicle = vehicles.find((item) => String(item.id) === String(entry.vehicleId));
      return { ...entry, vehicleName: vehicle?.model || 'Vehicle unavailable' };
    }).sort((a, b) => new Date(b.time) - new Date(a.time));
  }, [bookingsQuery.status, bookingsQuery.rows, alertsQuery.status, alertsQuery.rows, vehicles]);

  useEffect(() => {
    if (vehicleId !== 'all' && !vehicles.some((vehicle) => String(vehicle.id) === String(vehicleId))) {
      setVehicleId('all');
    }
  }, [vehicleId, vehicles]);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(''), 2600);
    return () => clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    const dialog = exportDialogRef.current;
    if (exportAction && dialog && !dialog.open) dialog.showModal();
    if (!exportAction && dialog?.open) dialog.close();
  }, [exportAction]);

  useEffect(() => {
    const clearPrintData = () => setPrintData(null);
    window.addEventListener('afterprint', clearPrintData);
    return () => window.removeEventListener('afterprint', clearPrintData);
  }, []);

  if (loading) {
    return (
      <>
        <PageHeader title="Vehicle logs" description="Booking and alert history by car unit." />
        <DataState status="loading" />
      </>
    );
  }

  const visibleEntries = vehicleId === 'all'
    ? entries
    : entries.filter((entry) => String(entry.vehicleId) === String(vehicleId));
  const selectedVehicle = vehicles.find((vehicle) => String(vehicle.id) === String(vehicleId)) || null;
  const displayedEntries = printData?.entries || visibleEntries;
  const printVehicle = printData ? printData.vehicle : selectedVehicle;
  const dateRangeLabel = printData?.dateRange || 'All dates';
  const invalidExportRange = Boolean(exportFrom && exportThrough && exportFrom > exportThrough);

  function beginExport(action) {
    if (menuRef.current) menuRef.current.open = false;
    setExportScope(vehicleId);
    setExportFrom('');
    setExportThrough('');
    setExportAction(action);
  }

  function finishExport() {
    const action = exportAction;
    if (!action) return;
    const vehicle = exportScope === 'all'
      ? null
      : vehicles.find((item) => String(item.id) === String(exportScope)) || null;
    if (invalidExportRange) return;
    const records = entries.filter((entry) => {
      if (vehicle && String(entry.vehicleId) !== String(vehicle.id)) return false;
      const key = dateKey(entry.time);
      if (exportFrom && (!key || key < exportFrom)) return false;
      if (exportThrough && (!key || key > exportThrough)) return false;
      return true;
    });
    const dateRange = formatDateRange(exportFrom, exportThrough);
    setExportAction('');

    if (action === 'download') {
      createWordDocument(records, vehicle, vehicles.length, dateRange);
      setNotice('Downloaded ' + records.length + ' log records.');
      return;
    }

    setPrintData({ vehicle, entries: records, dateRange });
    window.setTimeout(() => window.print(), 100);
  }

  return (
    <>
      <PageHeader title="Vehicle logs" description="Booking and alert history by car unit." />
      <header className="logs-print-header">
        <p>SGT CAR RENTALS · FLEET OPERATIONS</p>
        <h1>{printVehicle ? 'Vehicle log - ' + printVehicle.model + ' (' + printVehicle.id + ')' : 'Vehicle logs - All car units'}</h1>
        <div>
          {printVehicle
            ? 'Unit ' + printVehicle.id + ' | ' + printVehicle.plate
            : 'All ' + vehicles.length + ' car units'}
          {' | Dates: '}
          {dateRangeLabel}
          {' | Printed '}
          {formatDate(new Date().toISOString(), { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
        </div>
      </header>
      <section className="logs-card" aria-label="Vehicle logs">
        <header className="logs-card-heading">
          <div className="logs-toolbar">
            <label>
              <span className="sr-only">Filter logs by car unit</span>
              <select aria-label="Filter logs by car unit" value={vehicleId} onChange={(event) => setVehicleId(event.target.value)}>
                <option value="all">All car units</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>{vehicle.id} - {vehicle.model}</option>
                ))}
              </select>
            </label>
            <details className="logs-export-menu" ref={menuRef}>
              <summary className="logs-export-trigger">Print</summary>
              <div className="logs-export-options">
                <button type="button" onClick={() => beginExport('print')}>Print</button>
                <button type="button" onClick={() => beginExport('download')}>Download file</button>
              </div>
            </details>
          </div>
        </header>

        {firstError && <p className="logs-source-warning" role="status">Some activity data could not be loaded: {firstError}</p>}
        <div className="logs-summary" role="status">
          {vehicleId === 'all'
            ? visibleEntries.length + ' records across ' + vehicles.length + ' car units'
            : visibleEntries.length + ' records for ' + (selectedVehicle?.model || vehicleId) + ' (' + vehicleId + ')'}
        </div>
        <div className="logs-columns" aria-hidden="true">
          <span>DATE &amp; TIME</span><span>CAR UNIT</span><span className="logs-print-only">RENTER</span><span>ACTIVITY</span>
        </div>
        <ul className="logs-list">
          {displayedEntries.length ? displayedEntries.map((entry) => (
            <li className="logs-row" key={entry.id}>
              <time className="logs-time" dateTime={entry.time}>
                {formatDate(entry.time, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
              </time>
              <span className="logs-unit"><strong>{entry.vehicleId}</strong><span>{entry.vehicleName}</span></span>
              <span className="logs-person logs-print-only">{entry.renter || 'Not linked'}</span>
              <span className="logs-text">{entry.text}</span>
            </li>
          )) : (
            <li className="logs-empty">{firstError ? 'Activity data is unavailable.' : 'No logs for this car unit yet.'}</li>
          )}
        </ul>
      </section>
      <dialog
        className="logs-export-dialog"
        ref={exportDialogRef}
        aria-labelledby="logs-export-title"
        onClose={() => setExportAction('')}
      >
        <div className="logs-export-dialog-content">
          <p className="logs-export-eyebrow">VEHICLE LOGS</p>
          <h2 id="logs-export-title">Choose log records</h2>
          <label htmlFor="logs-export-scope">Car unit</label>
          <select id="logs-export-scope" value={exportScope} onChange={(event) => setExportScope(event.target.value)}>
            <option value="all">All car units</option>
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>{vehicle.id} - {vehicle.model}</option>
            ))}
          </select>
          <div className="logs-date-fields">
            <label htmlFor="logs-export-from">From date<input id="logs-export-from" type="date" value={exportFrom} onChange={(event) => setExportFrom(event.target.value)} /></label>
            <label htmlFor="logs-export-through">Through date<input id="logs-export-through" type="date" value={exportThrough} onChange={(event) => setExportThrough(event.target.value)} /></label>
          </div>
          {invalidExportRange && <p className="logs-date-error" role="alert">Through date must be the same as or later than from date.</p>}
          <footer>
            <button type="button" className="logs-export-cancel" onClick={() => exportDialogRef.current?.close()}>Cancel</button>
            <button type="button" className="logs-export-confirm" onClick={finishExport} disabled={invalidExportRange}>
              {exportAction === 'download' ? 'Download' : 'Print'}
            </button>
          </footer>
        </div>
      </dialog>
      {notice && <div className="logs-toast" role="status" aria-live="polite">{notice}</div>}
    </>
  );
}
