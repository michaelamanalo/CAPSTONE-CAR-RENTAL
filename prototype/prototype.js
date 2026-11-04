(() => {
  'use strict';

  const seedVehicles = [
    { id: 'GF-01', model: 'Toyota Avanza', plate: 'ABC 1234', status: 'on-trip', driver: 'J. Ramos', speed: 42, location: 'Fortich Street', updated: 'Just now', x: 338, y: 184 },
    { id: 'GF-02', model: 'Mitsubishi Xpander', plate: 'DEF 5678', status: 'on-trip', driver: 'M. Cruz', speed: 18, location: 'Sayre Highway', updated: '2 min ago', x: 584, y: 303 },
    { id: 'GF-03', model: 'Toyota Innova', plate: 'GHI 9012', status: 'available', driver: 'Fleet garage', speed: 0, location: 'SGT Fleet Garage', updated: '5 min ago', x: 427, y: 360 },
    { id: 'GF-04', model: 'Ford Ranger', plate: 'JKL 3456', status: 'on-trip', driver: 'R. Santos', speed: 61, location: 'Sayre Highway · Kalasungay', updated: 'Just now', x: 650, y: 255 },
    { id: 'GF-05', model: 'Toyota Vios', plate: 'MNO 7890', status: 'offline', driver: 'Signal lost', speed: 0, location: 'Brgy. Kalasungay', updated: '14 min ago', x: 180, y: 386 },
    { id: 'GF-06', model: 'Honda BR-V', plate: 'PQR 2345', status: 'available', driver: 'Fleet garage', speed: 0, location: 'SGT Fleet Garage', updated: '3 min ago', x: 470, y: 391 },
    { id: 'GF-07', model: 'Suzuki Ertiga', plate: 'STU 6789', status: 'on-trip', driver: 'S. Dela Cruz', speed: 28, location: 'Capitol Road', updated: '1 min ago', x: 765, y: 145 },
    { id: 'GF-08', model: 'Hyundai Stargazer', plate: 'VWX 0123', status: 'maintenance', driver: 'Service bay', speed: 0, location: 'SGT Service Center', updated: '32 min ago', x: 352, y: 120 },
  ];

  const dateAt = (dayOffset, hour) => {
    const date = new Date();
    date.setDate(date.getDate() + dayOffset);
    date.setHours(Math.floor(hour), hour % 1 ? 30 : 0, 0, 0);
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
  };

  const seedBookings = () => [
    { id: 'BK-1187', customer: 'Ana Reyes', phone: '0917 555 0101', email: 'ana.reyes@example.test', license: 'DL-XXXX-1187', vehicleId: 'GF-01', start: dateAt(0, 8), end: dateAt(1, 8), pickupLocation: 'SGT Main Office, Malaybalay City', returnLocation: 'SGT Main Office, Malaybalay City', dailyRate: 2600, deposit: 3000, amountPaid: 5600, paymentMethod: 'GCash', paymentStatus: 'Paid', notes: 'Customer requested a child seat.', createdAt: dateAt(-3, 14), status: 'active' },
    { id: 'BK-1188', customer: 'Marco Dizon', phone: '0917 555 0102', email: 'marco.dizon@example.test', license: 'DL-XXXX-1188', vehicleId: 'GF-02', start: dateAt(0, 9.5), end: dateAt(2, 9.5), pickupLocation: 'Malaybalay Bus Terminal', returnLocation: 'SGT Main Office, Malaybalay City', dailyRate: 3200, deposit: 4000, amountPaid: 4000, paymentMethod: 'Cash', paymentStatus: 'Deposit paid', notes: 'Return with a full fuel tank.', createdAt: dateAt(-2, 11), status: 'active' },
    { id: 'BK-1189', customer: 'Liza Fernandez', phone: '0917 555 0103', email: 'liza.fernandez@example.test', license: 'DL-XXXX-1189', vehicleId: 'GF-03', start: dateAt(1, 7), end: dateAt(1, 19), pickupLocation: 'SGT Main Office, Malaybalay City', returnLocation: 'SGT Main Office, Malaybalay City', dailyRate: 2800, deposit: 3000, amountPaid: 0, paymentMethod: 'Cash', paymentStatus: 'Unpaid', notes: 'Please call before pickup.', createdAt: dateAt(-1, 16), status: 'pending' },
    { id: 'BK-1190', customer: 'Dennis Ong', phone: '0917 555 0104', email: 'dennis.ong@example.test', license: 'DL-XXXX-1190', vehicleId: 'GF-06', start: dateAt(2, 10), end: dateAt(4, 10), pickupLocation: 'Malaybalay City Public Market', returnLocation: 'Malaybalay City Public Market', dailyRate: 2500, deposit: 3500, amountPaid: 0, paymentMethod: 'Bank transfer', paymentStatus: 'Unpaid', notes: 'No special requests.', createdAt: dateAt(-1, 10), status: 'pending' },
    { id: 'BK-1191', customer: 'Bruno Villanueva', phone: '0917 555 0105', email: 'bruno.villanueva@example.test', license: 'DL-XXXX-1191', bookingType: 'advance', vehicleId: 'GF-04', start: dateAt(0, 7), end: dateAt(0, 19), pickupLocation: 'SGT Main Office, Malaybalay City', returnLocation: 'SGT Main Office, Malaybalay City', dailyRate: 3500, deposit: 4000, amountPaid: 4000, paymentMethod: 'Cash', paymentStatus: 'Deposit paid', notes: 'Contact renter if vehicle is delayed.', createdAt: dateAt(-1, 14), status: 'active' },
    { id: 'BK-1192', customer: 'Sofia Dela Cruz', phone: '0917 555 0106', email: 'sofia.delacruz@example.test', license: 'DL-XXXX-1192', bookingType: 'advance', vehicleId: 'GF-07', start: dateAt(0, 8), end: dateAt(2, 8), pickupLocation: 'Malaybalay Bus Terminal', returnLocation: 'SGT Main Office, Malaybalay City', dailyRate: 2900, deposit: 3500, amountPaid: 3500, paymentMethod: 'GCash', paymentStatus: 'Deposit paid', notes: 'Include return fuel check.', createdAt: dateAt(-2, 13), status: 'active' },
  ];

  const seedAlerts = () => [
    { id: 'AL-2041', vehicleId: 'GF-04', type: 'emergency', title: 'Emergency alert', message: 'SOS button pressed by customer', location: 'Sayre Hwy · Kalasungay', minutesAgo: 4, acknowledged: false },
    { id: 'AL-2040', vehicleId: 'GF-04', type: 'speed', title: 'Speed limit exceeded', message: '61 km/h recorded in a 40 km/h zone', location: 'Sayre Highway', minutesAgo: 5, acknowledged: false },
    { id: 'AL-2039', vehicleId: 'GF-05', type: 'signal', title: 'Tracker connection lost', message: 'Last position is being buffered', location: 'Brgy. Kalasungay', minutesAgo: 17, acknowledged: false },
    { id: 'AL-2038', vehicleId: 'GF-02', type: 'geofence', title: 'Geofence notification', message: 'Vehicle exited the approved service area', location: 'Malaybalay City limits', minutesAgo: 91, acknowledged: true },
  ].map((alert) => ({
    ...alert,
    time: new Date(Date.now() - alert.minutesAgo * 60000).toISOString(),
  }));

  const seedDrivers = () => [
    { name: 'Juan Ramos', email: 'juan.ramos@example.test', phone: '0917 555 0201' },
    { name: 'Maria Cruz', email: 'maria.cruz@example.test', phone: '0917 555 0202' },
    { name: 'Rafael Santos', email: 'rafael.santos@example.test', phone: '0917 555 0203' },
    { name: 'Sofia Dela Cruz', email: 'sofia.delacruz@example.test', phone: '0917 555 0204' },
  ];

  const seedStaff = () => [
    { name: 'Michaela Manalo', email: 'michaela.manalo@example.test', role: 'admin' },
    { name: 'Carla Reyes', email: 'carla.reyes@example.test', role: 'staff' },
  ];

  const makeInitialState = () => ({
    vehicles: seedVehicles.map((vehicle) => ({ ...vehicle })),
    bookings: seedBookings(),
    alerts: seedAlerts(),
    drivers: seedDrivers(),
    staff: seedStaff(),
    selectedVehicleId: 'GF-04',
    query: '',
    status: 'all',
    zoom: 1,
    showAlertHistory: false,
  });

  let state = makeInitialState();
  let toastTimer;
  let editingBookingId = null;

  const byId = (id) => document.getElementById(id);
  const html = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]);
  const vehicleFor = (vehicleId) => state.vehicles.find((vehicle) => vehicle.id === vehicleId);
  const statusLabel = (status) => ({
    'on-trip': 'On trip', available: 'Available', maintenance: 'Maintenance', offline: 'Offline',
  })[status] || 'Unknown';
  const statusClass = (status) => ({
    'on-trip': 'trip', available: 'available', maintenance: 'maintenance', offline: 'offline',
  })[status] || 'offline';
  const carIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 14 2-6a2 2 0 0 1 1.9-1.4h10.2A2 2 0 0 1 19 8l2 6v5h-2v-2H5v2H3z"/><path d="M5 13h14M6.5 16h.01M17.5 16h.01"/></svg>';
  const pinIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>';

  function philippineDate(date, options) {
    return new Intl.DateTimeFormat('en-PH', { timeZone: 'Asia/Manila', ...options }).format(date);
  }

  function refreshClock() {
    const now = new Date();
    byId('todayLabel').textContent = philippineDate(now, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    byId('currentDate').textContent = philippineDate(now, { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function filteredVehicles() {
    const query = state.query.trim().toLowerCase();
    return state.vehicles.filter((vehicle) => {
      const matchesQuery = !query || [vehicle.id, vehicle.model, vehicle.plate, vehicle.driver, vehicle.location]
        .some((value) => value.toLowerCase().includes(query));
      const matchesStatus = state.status === 'all' || vehicle.status === state.status;
      return matchesQuery && matchesStatus;
    });
  }

  function renderSummary() {
    const openAlerts = state.alerts.filter((alert) => !alert.acknowledged).length;
    byId('statTotal').textContent = state.vehicles.length;
    byId('statOnTrip').textContent = state.vehicles.filter((vehicle) => vehicle.status === 'on-trip').length;
    byId('statAvailable').textContent = state.vehicles.filter((vehicle) => vehicle.status === 'available').length;
    byId('statAttention').textContent = openAlerts;
    byId('statBookings').textContent = state.bookings.filter((booking) => ['active', 'pending'].includes(booking.status)).length;
    byId('navFleetCount').textContent = state.vehicles.length;
    byId('navAlertCount').textContent = openAlerts;
    byId('activeAlertBadge').textContent = openAlerts;
    byId('bookingCount').textContent = state.bookings.filter((booking) => booking.status !== 'cancelled').length;
  }

  function renderMarkers(vehicles) {
    byId('mapMarkers').innerHTML = vehicles.map((vehicle) => {
      const hasAlert = state.alerts.some((alert) => alert.vehicleId === vehicle.id && !alert.acknowledged);
      const tone = hasAlert ? 'maintenance' : statusClass(vehicle.status);
      const selected = vehicle.id === state.selectedVehicleId;
      return `<button class="map-pin map-pin--${tone}${selected ? ' map-pin--selected' : ''}" type="button" data-vehicle-id="${html(vehicle.id)}" style="left:${vehicle.x / 10}%;top:${vehicle.y / 5}%" aria-label="Select ${html(vehicle.model)}, ${html(statusLabel(vehicle.status))}${selected ? ', selected' : ''}" aria-pressed="${selected}"><span>${html(vehicle.id.slice(-2))}</span></button>`;
    }).join('');
    byId('mapVehicleCount').textContent = `${vehicles.length} ${vehicles.length === 1 ? 'unit' : 'units'}`;
  }

  function renderFleet(vehicles) {
    byId('fleetVisibleCount').textContent = vehicles.length;
    byId('fleetFooterText').textContent = vehicles.length === state.vehicles.length
      ? `Showing all ${vehicles.length} vehicles`
      : `Showing ${vehicles.length} of ${state.vehicles.length} vehicles`;
    byId('fleetEmpty').hidden = vehicles.length !== 0;
    byId('fleetRows').hidden = vehicles.length === 0;
    byId('fleetRows').innerHTML = vehicles.map((vehicle) => {
      const selected = vehicle.id === state.selectedVehicleId;
      return `<tr class="${selected ? 'row--selected' : ''}" data-vehicle-id="${html(vehicle.id)}" aria-selected="${selected}" tabindex="0" aria-label="Select ${html(vehicle.model)}, ${html(statusLabel(vehicle.status))}">
        <td><div class="table-vehicle"><span class="table-car-icon">${carIcon}</span><span class="table-vehicle-copy"><strong>${html(vehicle.model)}</strong><span>${html(vehicle.id)} · ${html(vehicle.plate)}</span></span></div></td>
        <td><span class="status-pill status-pill--${statusClass(vehicle.status)}">${html(statusLabel(vehicle.status))}</span></td>
        <td><span class="location-cell">${pinIcon}${html(vehicle.location)}</span></td>
        <td>${html(vehicle.updated)}</td>
        <td class="row-arrow" aria-hidden="true">›</td>
      </tr>`;
    }).join('');
  }

  function renderDetails() {
    const vehicle = vehicleFor(state.selectedVehicleId);
    if (!vehicle) {
      ['vehicleDetails', 'fleetVehicleDetails'].forEach((id) => {
        byId(id).innerHTML = '<div class="detail-empty"><strong>No vehicle selected</strong><span>Choose a marker or vehicle row to see details.</span></div>';
      });
      return;
    }

    const renter = state.bookings
      .filter((booking) => booking.vehicleId === vehicle.id && ['active', 'pending'].includes(booking.status))
      .sort((a, b) => (a.status === b.status ? new Date(a.start) - new Date(b.start) : a.status === 'active' ? -1 : 1))[0];
    const renterRecord = renter
      ? `<section class="detail-renter">
          <div class="detail-renter-heading"><h3>${renter.status === 'active' ? 'Current renter' : 'Next renter'}</h3><span class="booking-status booking-status--${bookingStatusClass(renter.status)}">${bookingStatusLabel(renter.status)}</span></div>
          <strong class="detail-renter-name">${html(renter.customer)}</strong>
          <dl class="detail-renter-fields">
            <div><dt>Phone</dt><dd>${html(renter.phone || 'Not provided')}</dd></div>
            <div><dt>Email</dt><dd>${html(renter.email || 'Not provided')}</dd></div>
            <div><dt>Driver license</dt><dd>${html(renter.license || 'Not recorded')}</dd></div>
          </dl>
          <div class="detail-renter-schedule"><span>Pickup</span><strong>${html(formatBookingDate(renter.start, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }))}</strong><span>Return</span><strong>${html(formatBookingDate(renter.end, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }))}</strong></div>
          <button class="button button--secondary renter-record-link" type="button" data-view-renter="${html(renter.id)}">Open renter booking</button>
        </section>`
      : `<section class="detail-renter detail-renter--empty"><h3>Rental assignment</h3><strong class="detail-renter-name">No renter assigned</strong><p>This vehicle has no active or upcoming booking.</p></section>`;

    const details = `<div class="detail-top">
        <span class="vehicle-thumb">${carIcon}</span>
        <div class="detail-name"><h3 class="vehicle-record-title">${html(vehicle.model)}</h3><span>${html(vehicle.id)} | ${html(vehicle.plate)}</span></div>
        <span class="status-pill status-pill--${statusClass(vehicle.status)}">${html(statusLabel(vehicle.status))}</span>
      </div>
      <h3 class="detail-section-title">Vehicle and tracking</h3>
      <div class="detail-facts">
        <div class="detail-fact"><span>Assigned driver</span><strong>${html(vehicle.driver)}</strong></div>
        <div class="detail-fact"><span>Current speed</span><strong>${vehicle.speed} km/h</strong></div>
        <div class="detail-fact"><span>Last known location</span><strong>${html(vehicle.location)}</strong></div>
        <div class="detail-fact"><span>Last GPS update</span><strong>${html(vehicle.updated)}</strong></div>
      </div>${renterRecord}`;
    ['vehicleDetails', 'fleetVehicleDetails'].forEach((id) => { byId(id).innerHTML = details; });
  }

  function alertAge(minutes) {
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours} hr${hours === 1 ? '' : 's'} ago`;
  }

  function renderAlerts() {
    const openAlerts = state.alerts.filter((alert) => !alert.acknowledged);
    const visible = state.showAlertHistory ? state.alerts : openAlerts;
    byId('alertList').innerHTML = visible.length ? visible.map((alert) => {
      const vehicle = vehicleFor(alert.vehicleId);
      const symbol = alert.type === 'emergency' ? '!' : alert.type === 'speed' ? '↗' : alert.type === 'signal' ? '⌁' : '⌖';
      const tone = alert.type === 'speed' ? ' alert-symbol--speed' : alert.type === 'signal' ? ' alert-symbol--signal' : '';
      const action = alert.acknowledged
        ? '<span class="alert-resolved">Acknowledged</span>'
        : `<button class="alert-action" type="button" data-ack-alert="${html(alert.id)}" aria-label="Acknowledge ${html(alert.title)}">Acknowledge</button>`;
      return `<div class="alert-row"><span class="alert-symbol${tone}" aria-hidden="true">${symbol}</span><div class="alert-copy"><strong class="alert-title">${html(alert.title)}</strong><span class="alert-description">${html(alert.message)}</span><span class="alert-meta"><b>${html(alert.vehicleId)}</b><span>·</span>${html(vehicle?.model || 'Unknown vehicle')}<span>·</span>${html(alertAge(alert.minutesAgo))}</span></div>${action}</div>`;
    }).join('') : '<div class="detail-empty"><strong>All clear</strong><span>No active fleet alerts right now.</span></div>';
    byId('alertFooterText').textContent = state.showAlertHistory ? 'Alert history' : `${openAlerts} open ${openAlerts === 1 ? 'alert' : 'alerts'}`;
    byId('toggleAlertHistory').textContent = state.showAlertHistory ? 'Active only' : 'View history';
    byId('toggleAlertHistory').setAttribute('aria-pressed', String(state.showAlertHistory));
    byId('acknowledgeAll').hidden = openAlerts === 0 || state.showAlertHistory;
  }

  function formatBookingDate(value, options) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'Date unavailable' : philippineDate(date, options);
  }

  function bookingStatusClass(status) {
    return ['active', 'pending', 'cancelled', 'completed'].includes(status) ? status : 'pending';
  }

  function bookingStatusLabel(status) {
    return ({ active: 'Active', pending: 'Pending', cancelled: 'Cancelled', completed: 'Completed' })[status] || 'Pending';
  }

  function renderBookings() {
    const bookings = [...state.bookings].sort((a, b) => {
      if (a.status === 'cancelled' && b.status !== 'cancelled') return 1;
      if (b.status === 'cancelled' && a.status !== 'cancelled') return -1;
      return new Date(a.start) - new Date(b.start);
    });
    byId('bookingEmpty').hidden = bookings.length !== 0;
    byId('bookingList').innerHTML = bookings.map((booking) => {
      const vehicle = vehicleFor(booking.vehicleId);
      const start = new Date(booking.start);
      const month = Number.isNaN(start.getTime()) ? '?' : philippineDate(start, { month: 'short' });
      const day = Number.isNaN(start.getTime()) ? '?' : philippineDate(start, { day: 'numeric' });
      const time = Number.isNaN(start.getTime()) ? '' : philippineDate(start, { hour: 'numeric', minute: '2-digit' });
      const statusClassName = bookingStatusClass(booking.status);
      const cancelButton = booking.status === 'pending'
        ? `<button class="booking-cancel" type="button" data-cancel-booking="${html(booking.id)}" aria-label="Cancel booking ${html(booking.id)}">Cancel booking</button>`
        : '';
      return `<div class="booking-row booking-row--clickable" data-booking-id="${html(booking.id)}" role="link" tabindex="0" aria-label="View booking ${html(booking.id)} for ${html(booking.customer)}"><span class="booking-date"><strong>${html(day)}</strong><span>${html(month)}</span></span><span class="booking-main"><strong>${html(booking.customer)}</strong><span>${html(vehicle?.model || booking.vehicleId)} | ${booking.bookingType === 'walk-in' ? 'Walk-in' : 'Advance'} | ${html(booking.id)}</span></span><span class="booking-side"><span class="booking-time">${html(time)}</span><span class="booking-status booking-status--${statusClassName}">${bookingStatusLabel(booking.status)}</span>${cancelButton}</span></div>`;
    }).join('');
  }

  function initials(name) {
    return name.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase();
  }

  function renderDrivers() {
    const drivers = state.drivers;
    byId('driverList').innerHTML = drivers.length ? drivers.map((driver) => `
      <article class="drivers-row">
        <div class="drivers-avatar" aria-hidden="true">${html(initials(driver.name))}</div>
        <div class="drivers-info"><h2>${html(driver.name)}</h2><p>${html(driver.email)}</p><p>${html(driver.phone || 'Not provided')}</p></div>
        <span class="drivers-role">Driver</span>
      </article>`).join('') : '<div class="empty-state"><strong>No driver accounts were found in the USERS table.</strong></div>';
  }

  function renderStaff() {
    const staff = state.staff;
    byId('staffList').innerHTML = staff.length ? staff.map((member) => `
      <div class="staff-row">
        <div class="staff-avatar" aria-hidden="true">${html(initials(member.name))}</div>
        <div class="staff-info"><div class="staff-name">${html(member.name)}</div><div class="staff-email">${html(member.email)}</div></div>
        <span class="pill ${member.role === 'admin' ? 'pill--alert' : 'pill--active'}">${html(member.role)}</span>
      </div>`).join('') : '<div class="empty-state"><strong>No admin/staff accounts in the USERS table yet.</strong></div>';
  }

  function renderLogs() {
    const bookingEntries = state.bookings.map((booking) => ({
      id: `booking-${booking.id}`,
      time: booking.start,
      text: `Booking ${booking.id} (${booking.customer}) — ${booking.status}`,
    }));
    const alertEntries = state.alerts.map((alert) => ({
      id: `alert-${alert.id}`,
      time: alert.time,
      text: `${alert.vehicleId}: ${alert.message}`,
    }));
    const entries = [...bookingEntries, ...alertEntries].sort((a, b) => new Date(b.time) - new Date(a.time));
    byId('logList').innerHTML = entries.length ? entries.map((entry) => `
      <li class="logs-row"><span class="mono logs-time">${html(entry.time)}</span><span class="logs-text">${html(entry.text)}</span></li>`).join('')
      : '<li class="empty-state"><strong>No bookings or alerts recorded yet.</strong></li>';
  }

  function renderBookingDetails(booking) {
    const vehicle = vehicleFor(booking.vehicleId);
    const duration = new Date(booking.end) - new Date(booking.start);
    const rentalDays = Number.isFinite(duration) ? Math.max(1, Math.ceil(duration / 86400000)) : 0;
    const dailyRate = Number(booking.dailyRate) || 0;
    const subtotal = dailyRate * rentalDays;
    const deposit = Number(booking.deposit) || 0;
    const paid = Number(booking.amountPaid) || 0;
    const balance = Math.max(0, subtotal + deposit - paid);
    const money = (value) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(value);
    const longDate = (value) => formatBookingDate(value, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    const time = (value) => formatBookingDate(value, { hour: 'numeric', minute: '2-digit' });
    const statusClassName = bookingStatusClass(booking.status);
    const currentStatus = bookingStatusLabel(booking.status);

    byId('bookingDetailTitle').textContent = booking.id;
    byId('bookingDetailSubtitle').textContent = `${booking.customer} | ${vehicle?.model || booking.vehicleId}`;
    byId('bookingDetailActions').innerHTML = [
      booking.status === 'pending' ? `<button class="button button--secondary" type="button" data-edit-booking="${html(booking.id)}">Edit booking</button>` : '',
      booking.status === 'pending' ? `<button class="button button--danger" type="button" data-detail-cancel-booking="${html(booking.id)}">Cancel booking</button>` : '',
      booking.status === 'active' ? `<button class="button button--primary" type="button" data-complete-booking="${html(booking.id)}">Mark returned</button>` : '',
    ].join('');

    const latestActivity = booking.status === 'active'
      ? `<li><span class="timeline-dot timeline-dot--active"></span><div><strong>Rental in progress</strong><span>Started ${html(longDate(booking.start))} at ${html(time(booking.start))}</span></div></li>`
      : booking.status === 'pending'
        ? `<li><span class="timeline-dot"></span><div><strong>Awaiting pickup</strong><span>Scheduled for ${html(longDate(booking.start))} at ${html(time(booking.start))}</span></div></li>`
        : booking.status === 'completed'
          ? `<li><span class="timeline-dot timeline-dot--complete"></span><div><strong>Rental completed</strong><span>Returned ${html(longDate(booking.end))} at ${html(time(booking.end))}</span></div></li>`
          : `<li><span class="timeline-dot timeline-dot--cancelled"></span><div><strong>Booking cancelled</strong><span>This booking is no longer scheduled.</span></div></li>`;

    byId('bookingDetailContent').innerHTML = `
      <section class="booking-record-overview">
        <div><p class="section-kicker">BOOKING SUMMARY</p><h3>${html(booking.customer)}</h3><p>${html(vehicle?.model || booking.vehicleId)} <span>|</span> ${html(vehicle?.plate || 'Vehicle unavailable')}</p></div>
        <span class="booking-record-status booking-record-status--${statusClassName}">${currentStatus}</span>
        <div class="booking-record-metrics"><div><span>Booking reference</span><strong>${html(booking.id)}</strong></div><div><span>Rental length</span><strong>${rentalDays} ${rentalDays === 1 ? 'day' : 'days'}</strong></div><div><span>Created</span><strong>${html(formatBookingDate(booking.createdAt || booking.start, { month: 'short', day: 'numeric', year: 'numeric' }))}</strong></div></div>
      </section>
      <div class="booking-record-grid">
        <article class="record-card record-card--wide"><div class="record-card-heading"><span class="record-card-icon">01</span><div><h3>Trip itinerary</h3><p>Pickup and return schedule</p></div></div><div class="itinerary-grid"><div class="itinerary-stop"><span class="itinerary-label"><i class="itinerary-dot itinerary-dot--pickup"></i> PICKUP</span><strong>${html(longDate(booking.start))}</strong><span>${html(time(booking.start))}</span><p>${html(booking.pickupLocation || 'Location not provided')}</p></div><div class="itinerary-stop"><span class="itinerary-label"><i class="itinerary-dot itinerary-dot--return"></i> RETURN</span><strong>${html(longDate(booking.end))}</strong><span>${html(time(booking.end))}</span><p>${html(booking.returnLocation || 'Location not provided')}</p></div></div></article>
        <article class="record-card"><div class="record-card-heading"><span class="record-card-icon">02</span><div><h3>Renter details</h3><p>Contact and identification</p></div></div><dl class="record-fields"><div><dt>Full name</dt><dd>${html(booking.customer)}</dd></div><div><dt>Phone number</dt><dd>${html(booking.phone || 'Not provided')}</dd></div><div><dt>Email address</dt><dd>${html(booking.email || 'Not provided')}</dd></div><div><dt>Driver license</dt><dd>${html(booking.license || 'Not provided')}</dd></div></dl></article>
        <article class="record-card"><div class="record-card-heading"><span class="record-card-icon">03</span><div><h3>Assigned vehicle</h3><p>Vehicle for this rental</p></div></div><div class="record-vehicle"><span class="table-car-icon">${carIcon}</span><div><strong>${html(vehicle?.model || booking.vehicleId)}</strong><span>${html(vehicle?.id || booking.vehicleId)} | ${html(vehicle?.plate || 'Plate unavailable')}</span></div></div><dl class="record-fields"><div><dt>Vehicle status</dt><dd>${html(vehicle ? statusLabel(vehicle.status) : 'Unavailable')}</dd></div><div><dt>Assigned driver</dt><dd>${html(vehicle?.driver || 'Not assigned')}</dd></div><div><dt>Last known location</dt><dd>${html(vehicle?.location || 'Not available')}</dd></div></dl><button class="text-button record-link" type="button" data-view-vehicle="${html(booking.vehicleId)}">View in fleet</button></article>
        <article class="record-card"><div class="record-card-heading"><span class="record-card-icon">04</span><div><h3>Payment summary</h3><p><span class="payment-status payment-status--${booking.paymentStatus === 'Unpaid' ? 'pending' : 'paid'}">${html(booking.paymentStatus || 'Unpaid')}</span></p></div></div><dl class="record-fields record-payment"><div><dt>Daily rate x ${rentalDays} ${rentalDays === 1 ? 'day' : 'days'}</dt><dd>${money(subtotal)}</dd></div><div><dt>Refundable deposit</dt><dd>${money(deposit)}</dd></div><div><dt>Amount paid</dt><dd>${money(paid)}</dd></div><div class="record-total"><dt>Balance due</dt><dd>${money(balance)}</dd></div><div><dt>Payment method</dt><dd>${html(booking.paymentMethod || 'Not selected')}</dd></div></dl></article>
        <article class="record-card"><div class="record-card-heading"><span class="record-card-icon">05</span><div><h3>Booking activity</h3><p>Record history</p></div></div><ol class="booking-timeline"><li><span class="timeline-dot timeline-dot--created"></span><div><strong>Booking created</strong><span>${html(longDate(booking.createdAt || booking.start))}</span></div></li>${latestActivity}</ol><div class="record-notes"><span>RENTER NOTES</span><p>${html(booking.notes || 'No notes added.')}</p></div></article>
      </div>`;
    if (!byId('bookingDetailDialog').open) byId('bookingDetailDialog').showModal();
  }

  function renderAll() {
    const vehicles = filteredVehicles();
    if (state.selectedVehicleId && !vehicles.some((vehicle) => vehicle.id === state.selectedVehicleId)) {
      state.selectedVehicleId = vehicles[0]?.id || null;
    }
    renderSummary();
    renderMarkers(vehicles);
    renderFleet(vehicles);
    renderDetails();
    renderAlerts();
    renderBookings();
    renderDrivers();
    renderStaff();
    renderLogs();
  }

  function setSelected(vehicleId) {
    state.selectedVehicleId = vehicleId;
    const vehicles = filteredVehicles();
    renderMarkers(vehicles);
    renderFleet(vehicles);
    renderDetails();
  }

  function toast(message) {
    const node = byId('toast');
    node.textContent = message;
    node.classList.add('toast--visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => node.classList.remove('toast--visible'), 2600);
  }

  function updateZoom(zoom) {
    state.zoom = Math.max(.8, Math.min(1.4, Math.round(zoom * 10) / 10));
    byId('mapCanvas').style.transform = `scale(${state.zoom})`;
    byId('zoomValue').textContent = `${Math.round(state.zoom * 100)}%`;
    byId('zoomIn').disabled = state.zoom >= 1.4;
    byId('zoomOut').disabled = state.zoom <= .8;
  }

  function dateInputValue(dayOffset, hour) {
    const date = new Date();
    date.setDate(date.getDate() + dayOffset);
    date.setHours(Math.floor(hour), Number.isInteger(hour) ? 0 : 30, 0, 0);
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return localDate.toISOString().slice(0, 16);
  }

  function walkInDates() {
    const pickup = new Date();
    pickup.setSeconds(0, 0);
    const returned = new Date(pickup.getTime() + 24 * 60 * 60 * 1000);
    return [pickup, returned].map((date) => {
      const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
      return localDate.toISOString().slice(0, 16);
    });
  }

  function hasBookingConflict(vehicleId, pickup, returned, excludedId) {
    const start = new Date(pickup).getTime();
    const end = new Date(returned).getTime();
    return state.bookings.some((booking) => {
      if (booking.id === excludedId || booking.vehicleId !== vehicleId || !['active', 'pending'].includes(booking.status)) return false;
      return start < new Date(booking.end).getTime() && end > new Date(booking.start).getTime();
    });
  }

  function updateBookingVehicleOptions() {
    const select = byId('bookingVehicle');
    const selected = select.value;
    const pickup = byId('bookingForm').elements.pickup.value;
    const returned = byId('bookingForm').elements.return.value;
    const editingBooking = state.bookings.find((booking) => booking.id === editingBookingId);
    const candidates = state.vehicles.filter((vehicle) => vehicle.status === 'available' || vehicle.id === editingBooking?.vehicleId);
    select.replaceChildren();
    if (!candidates.length) {
      select.add(new Option('No available vehicles', ''));
      select.disabled = true;
      return;
    }
    select.disabled = false;
    candidates.forEach((vehicle) => {
      const conflict = pickup && returned && hasBookingConflict(vehicle.id, pickup, returned, editingBookingId);
      const option = new Option(`${vehicle.id} · ${vehicle.model}${conflict ? ' — booking conflict' : ''}`, vehicle.id);
      option.disabled = Boolean(conflict);
      select.add(option);
    });
    const current = [...select.options].find((option) => option.value === selected && !option.disabled);
    const firstAvailable = [...select.options].find((option) => !option.disabled);
    if (current) select.value = current.value;
    else if (firstAvailable) select.value = firstAvailable.value;
    else select.selectedIndex = 0;
  }

  function openBookingDialog(bookingId = null) {
    const form = byId('bookingForm');
    const booking = state.bookings.find((item) => item.id === bookingId && item.status === 'pending');
    editingBookingId = booking?.id || null;
    form.reset();
    if (booking) {
      form.elements.customer.value = booking.customer;
      form.elements.phone.value = booking.phone || '';
      form.elements.email.value = booking.email || '';
      form.elements.license.value = booking.license || '';
      form.elements.bookingType.value = booking.bookingType || 'advance';
      form.elements.dailyRate.value = booking.dailyRate || 2500;
      form.elements.deposit.value = booking.deposit || 0;
      form.elements.amountPaid.value = booking.amountPaid || 0;
      form.elements.paymentMethod.value = booking.paymentMethod || 'Cash';
      form.elements.pickup.value = booking.start;
      form.elements.return.value = booking.end;
    } else {
      form.elements.pickup.value = dateInputValue(4, 10);
      form.elements.return.value = dateInputValue(5, 10);
    }
    byId('bookingModeNote').textContent = form.elements.bookingType.value === 'walk-in'
      ? 'Walk-in pickup starts now, runs for 24 hours by default, and sets the vehicle to On trip.'
      : 'Advance bookings are scheduled for a future pickup.';
    byId('bookingDialogTitle').textContent = booking ? `Edit ${booking.id}` : 'Create a booking';
    byId('bookingSubmit').textContent = booking ? 'Save changes' : 'Save demo booking';
    byId('bookingError').hidden = true;
    updateBookingVehicleOptions();
    if (booking) byId('bookingVehicle').value = booking.vehicleId;
    byId('bookingDialog').showModal();
    form.elements.customer.focus();
  }

  function closeBookingDialog() {
    if (byId('bookingDialog').open) byId('bookingDialog').close();
    editingBookingId = null;
  }

  function createBooking(event) {
    event.preventDefault();
    const form = byId('bookingForm');
    const customer = form.elements.customer.value.trim();
    const vehicle = vehicleFor(form.elements.vehicleId.value);
    const pickup = form.elements.pickup.value;
    const returned = form.elements.return.value;
    const email = form.elements.email.value.trim();
    const license = form.elements.license.value.trim();
    const bookingType = form.elements.bookingType.value;
    const dailyRate = Number(form.elements.dailyRate.value) || 0;
    const deposit = Number(form.elements.deposit.value) || 0;
    const amountPaid = Number(form.elements.amountPaid.value) || 0;
    const paymentMethod = form.elements.paymentMethod.value;
    const error = byId('bookingError');
    const editingBooking = state.bookings.find((booking) => booking.id === editingBookingId);
    let message = '';

    if (!customer) message = 'Add the customer name to continue.';
    else if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) message = 'Enter a valid email address or leave it blank.';
    else if (bookingType === 'walk-in' && !form.elements.phone.value.trim() && !license) message = 'For walk-in pickup, add a contact number or driver license.';
    else if (!vehicle || vehicle.status !== 'available') message = 'Choose an available vehicle.';
    else if (dailyRate < 0 || deposit < 0 || amountPaid < 0) message = 'Payment amounts cannot be negative.';
    else if (!pickup || !returned || new Date(returned) <= new Date(pickup)) message = 'Return time must be after pickup time.';
    else if (hasBookingConflict(vehicle.id, pickup, returned, editingBooking?.id)) message = 'That vehicle already has a booking during this time. Choose another vehicle or date.';

    if (message) {
      error.textContent = message;
      error.hidden = false;
      return;
    }

    const wasEditing = Boolean(editingBooking);
    if (editingBooking) {
      Object.assign(editingBooking, {
        customer,
        phone: form.elements.phone.value.trim(),
        email,
        license,
        bookingType,
        vehicleId: vehicle.id,
        start: pickup,
        end: returned,
        dailyRate,
        deposit,
        amountPaid,
        paymentMethod,
        paymentStatus: amountPaid >= dailyRate * Math.max(1, Math.ceil((new Date(returned) - new Date(pickup)) / 86400000)) + deposit ? 'Paid' : amountPaid ? 'Deposit paid' : 'Unpaid',
        status: bookingType === 'walk-in' ? 'active' : 'pending',
      });
      if (bookingType === 'walk-in') Object.assign(vehicle, { status: 'on-trip', driver: 'Self-drive renter', location: 'SGT Main Office, Malaybalay City', updated: 'Just now' });
    } else {
      const nextNumber = Math.max(1190, ...state.bookings.map((booking) => Number(booking.id.replace(/\D/g, '')) || 0)) + 1;
      state.bookings.push({
        id: `BK-${nextNumber}`,
        customer,
        phone: form.elements.phone.value.trim(),
        email,
        license,
        bookingType,
        vehicleId: vehicle.id,
        start: pickup,
        end: returned,
        pickupLocation: 'SGT Main Office, Malaybalay City',
        returnLocation: 'SGT Main Office, Malaybalay City',
        dailyRate,
        deposit,
        amountPaid,
        paymentMethod,
        paymentStatus: amountPaid >= dailyRate * Math.max(1, Math.ceil((new Date(returned) - new Date(pickup)) / 86400000)) + deposit ? 'Paid' : amountPaid ? 'Deposit paid' : 'Unpaid',
        notes: 'No special requests.',
        createdAt: new Date().toISOString(),
        status: bookingType === 'walk-in' ? 'active' : 'pending',
      });
      if (bookingType === 'walk-in') Object.assign(vehicle, { status: 'on-trip', driver: 'Self-drive renter', location: 'SGT Main Office, Malaybalay City', updated: 'Just now' });
    }
    closeBookingDialog();
    renderAll();
    if (wasEditing) {
      renderBookingDetails(editingBooking);
    } else {
      const created = state.bookings[state.bookings.length - 1];
      if (created.bookingType === 'walk-in') renderBookingDetails(created);
      toast(`${created.id} added to the demo.`);
    }
  }

  byId('vehicleSearch').addEventListener('input', (event) => {
    state.query = event.target.value;
    renderAll();
  });
  byId('statusFilter').addEventListener('change', (event) => {
    state.status = event.target.value;
    renderAll();
  });
  byId('clearVehicleFilters').addEventListener('click', () => {
    state.query = '';
    state.status = 'all';
    byId('vehicleSearch').value = '';
    byId('statusFilter').value = 'all';
    renderAll();
  });
  byId('clearSelection').addEventListener('click', () => setSelected(null));
  byId('fleetRows').addEventListener('click', (event) => {
    const row = event.target.closest('[data-vehicle-id]');
    if (row) setSelected(row.dataset.vehicleId);
  });
  byId('fleetRows').addEventListener('keydown', (event) => {
    if (!['Enter', ' '].includes(event.key)) return;
    const row = event.target.closest('[data-vehicle-id]');
    if (!row) return;
    event.preventDefault();
    setSelected(row.dataset.vehicleId);
    byId('fleetRows').querySelector(`[data-vehicle-id="${row.dataset.vehicleId}"]`)?.focus();
  });
  byId('mapMarkers').addEventListener('click', (event) => {
    const pin = event.target.closest('[data-vehicle-id]');
    if (pin) setSelected(pin.dataset.vehicleId);
  });

  byId('alertList').addEventListener('click', (event) => {
    const button = event.target.closest('[data-ack-alert]');
    if (!button) return;
    const alert = state.alerts.find((item) => item.id === button.dataset.ackAlert);
    if (alert) {
      alert.acknowledged = true;
      renderAll();
      toast(`${alert.id} acknowledged.`);
    }
  });
  byId('acknowledgeAll').addEventListener('click', () => {
    state.alerts.forEach((alert) => { alert.acknowledged = true; });
    renderAll();
    toast('All active alerts acknowledged.');
  });
  byId('toggleAlertHistory').addEventListener('click', () => {
    state.showAlertHistory = !state.showAlertHistory;
    renderAlerts();
  });

  byId('bookingList').addEventListener('click', (event) => {
    const button = event.target.closest('[data-cancel-booking]');
    if (button) {
      const booking = state.bookings.find((item) => item.id === button.dataset.cancelBooking);
      if (booking?.status === 'pending') {
        booking.status = 'cancelled';
        renderAll();
        toast(`${booking.id} cancelled in the demo.`);
      }
      return;
    }
    const row = event.target.closest('[data-booking-id]');
    if (!row || event.target.closest('button')) return;
    const booking = state.bookings.find((item) => item.id === row.dataset.bookingId);
    if (booking) renderBookingDetails(booking);
  });
  byId('bookingList').addEventListener('keydown', (event) => {
    if (!['Enter', ' '].includes(event.key) || event.target.closest('button')) return;
    const row = event.target.closest('[data-booking-id]');
    if (!row) return;
    event.preventDefault();
    const booking = state.bookings.find((item) => item.id === row.dataset.bookingId);
    if (booking) renderBookingDetails(booking);
  });
  byId('closeBookingDetail').addEventListener('click', () => byId('bookingDetailDialog').close());
  byId('bookingDetailDialog').addEventListener('click', (event) => {
    if (event.target === byId('bookingDetailDialog')) byId('bookingDetailDialog').close();
  });
  byId('bookingDetailActions').addEventListener('click', (event) => {
    const editButton = event.target.closest('[data-edit-booking]');
    if (editButton) {
      byId('bookingDetailDialog').close();
      openBookingDialog(editButton.dataset.editBooking);
      return;
    }
    const cancelButton = event.target.closest('[data-detail-cancel-booking]');
    if (cancelButton) {
      const booking = state.bookings.find((item) => item.id === cancelButton.dataset.detailCancelBooking);
      if (booking?.status === 'pending') {
        booking.status = 'cancelled';
        byId('bookingDetailDialog').close();
        renderAll();
        toast(`${booking.id} cancelled in the demo.`);
      }
      return;
    }
    const completeButton = event.target.closest('[data-complete-booking]');
    if (completeButton) {
      const booking = state.bookings.find((item) => item.id === completeButton.dataset.completeBooking);
      if (booking?.status === 'active') {
        booking.status = 'completed';
        const vehicle = vehicleFor(booking.vehicleId);
        if (vehicle) Object.assign(vehicle, { status: 'available', driver: 'Fleet garage', speed: 0, location: 'SGT Fleet Garage', updated: 'Just now' });
        byId('bookingDetailDialog').close();
        renderAll();
        toast(`${booking.id} marked as returned.`);
      }
      return;
    }
  });
  byId('bookingDetailContent').addEventListener('click', (event) => {
    const button = event.target.closest('[data-view-vehicle]');
    if (!button) return;
    setSelected(button.dataset.viewVehicle);
    byId('bookingDetailDialog').close();
    window.location.hash = '#page=fleet';
  });
  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-view-renter]');
    if (!button) return;
    const booking = state.bookings.find((item) => item.id === button.dataset.viewRenter);
    if (booking) renderBookingDetails(booking);
  });

  byId('zoomIn').addEventListener('click', () => updateZoom(state.zoom + .1));
  byId('zoomOut').addEventListener('click', () => updateZoom(state.zoom - .1));
  byId('focusMap').addEventListener('click', () => {
    updateZoom(1);
    byId('mapFrame').scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  byId('openBooking').addEventListener('click', () => openBookingDialog());
  byId('openBookingSecondary').addEventListener('click', () => openBookingDialog());
  byId('closeBooking').addEventListener('click', closeBookingDialog);
  byId('cancelBooking').addEventListener('click', closeBookingDialog);
  byId('bookingForm').addEventListener('submit', createBooking);
  byId('bookingForm').elements.pickup.addEventListener('change', updateBookingVehicleOptions);
  byId('bookingForm').elements.return.addEventListener('change', updateBookingVehicleOptions);
  byId('bookingForm').elements.bookingType.addEventListener('change', (event) => {
    const walkIn = event.target.value === 'walk-in';
    const dates = walkIn ? walkInDates() : [dateInputValue(4, 10), dateInputValue(5, 10)];
    byId('bookingForm').elements.pickup.value = dates[0];
    byId('bookingForm').elements.return.value = dates[1];
    byId('bookingModeNote').textContent = walkIn
      ? 'Walk-in pickup starts now, runs for 24 hours by default, and sets the vehicle to On trip.'
      : 'Advance bookings are scheduled for a future pickup.';
    updateBookingVehicleOptions();
  });

  byId('refreshDemo').addEventListener('click', () => {
    byId('lastRefresh').textContent = `Updated ${philippineDate(new Date(), { hour: 'numeric', minute: '2-digit' })}`;
    toast('Sample dashboard refreshed.');
  });
  byId('resetDemo').addEventListener('click', () => {
    state = makeInitialState();
    byId('vehicleSearch').value = '';
    byId('statusFilter').value = 'all';
    closeBookingDialog();
    if (byId('bookingDetailDialog').open) byId('bookingDetailDialog').close();
    updateZoom(1);
    renderAll();
    toast('Demo data reset to the original sample.');
  });

  const pageDetails = {
    overview: {
      label: 'Overview',
      title: 'Fleet overview',
      subtitle: 'Here’s what’s happening across your fleet today.',
      showLiveStatus: true,
    },
    fleet: {
      label: 'Fleet',
      title: 'Fleet',
      subtitle: 'Search vehicles, check their status, and select one to see its details.',
      showLiveStatus: true,
    },
    bookings: {
      label: 'Bookings',
      title: 'Bookings',
      subtitle: 'Review upcoming rentals and manage pending bookings.',
      showLiveStatus: false,
    },
    alerts: {
      label: 'Alerts',
      title: 'Alerts',
      subtitle: 'Review active notifications and acknowledge alerts as they are handled.',
      showLiveStatus: false,
    },
    drivers: {
      label: 'Drivers',
      title: 'Drivers',
      subtitle: 'Driver accounts from the USERS table.',
      showLiveStatus: false,
    },
    staff: {
      label: 'Staff',
      title: 'Manage Staff',
      subtitle: 'Admin and staff accounts for the rental team.',
      showLiveStatus: false,
    },
    logs: {
      label: 'Logs',
      title: 'Logs',
      subtitle: 'Recent activity from bookings and fleet alerts.',
      showLiveStatus: false,
    },
  };

  function showPage(page) {
    const details = pageDetails[page] || pageDetails.overview;
    document.querySelectorAll('[data-page-view]').forEach((view) => {
      view.hidden = view.dataset.pageView !== (pageDetails[page] ? page : 'overview');
    });
    document.querySelectorAll('.sidebar nav [data-page-link]').forEach((link) => {
      const active = link.dataset.pageLink === (pageDetails[page] ? page : 'overview');
      link.classList.toggle('nav-link--active', active);
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    byId('currentPageLabel').textContent = details.label;
    byId('viewTitle').textContent = details.title;
    byId('viewSubtitle').textContent = details.subtitle;
    byId('pageLiveStatus').hidden = !details.showLiveStatus;
    document.title = `${details.label} · SGT Car Rentals`;
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  function showPageFromHash() {
    const match = window.location.hash.match(/^#page=(overview|fleet|bookings|alerts|drivers|staff|logs)$/);
    showPage(match ? match[1] : 'overview');
  }

  document.querySelectorAll('[data-page-link]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      if (link.dataset.fleetStatus) {
        state.status = link.dataset.fleetStatus;
        state.query = '';
        byId('statusFilter').value = state.status;
        byId('vehicleSearch').value = '';
        renderAll();
      }
      const target = `#page=${link.dataset.pageLink}`;
      if (window.location.hash === target) showPage(link.dataset.pageLink);
      else window.location.hash = target;
    });
  });
  window.addEventListener('hashchange', showPageFromHash);

  refreshClock();
  renderAll();
  showPageFromHash();
  updateZoom(1);
})();
