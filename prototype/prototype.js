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
    logVehicleId: 'all',
    zoom: 1,
    showAlertHistory: false,
  });

  let state = makeInitialState();
  let toastTimer;
  let editingBookingId = null;
  let renderedLogEntries = [];

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
      const resolved = alert.acknowledged ? '<span class="alert-history-status">Acknowledged</span>' : '';
      return `<button class="alert-row alert-row--clickable" type="button" data-alert-id="${html(alert.id)}" aria-label="View details for ${html(alert.title)} on ${html(vehicle?.model || alert.vehicleId)}">
        <span class="alert-symbol${tone}" aria-hidden="true">${symbol}</span>
        <span class="alert-copy"><span class="alert-title">${html(alert.title)}</span><span class="alert-description">${html(alert.message)}</span><span class="alert-meta"><b>${html(alert.vehicleId)}</b><span>·</span>${html(vehicle?.model || 'Unknown vehicle')}<span>·</span>${html(alertAge(alert.minutesAgo))}${resolved}</span></span>
        <span class="alert-open-label" aria-hidden="true">View details <span>›</span></span>
      </button>`;
    }).join('') : '<div class="detail-empty"><strong>All clear</strong><span>No active fleet alerts right now.</span></div>';
    byId('alertFooterText').textContent = state.showAlertHistory ? 'Alert history' : `${openAlerts.length} open ${openAlerts.length === 1 ? 'alert' : 'alerts'}`;
    byId('toggleAlertHistory').textContent = state.showAlertHistory ? 'Active only' : 'View history';
    byId('toggleAlertHistory').setAttribute('aria-pressed', String(state.showAlertHistory));
    byId('acknowledgeAll').hidden = openAlerts.length === 0 || state.showAlertHistory;
  }

  function renderAlertDetails(alert) {
    const vehicle = vehicleFor(alert.vehicleId);
    const renter = state.bookings
      .filter((booking) => booking.vehicleId === alert.vehicleId && ['active', 'pending'].includes(booking.status))
      .sort((a, b) => (a.status === b.status ? new Date(a.start) - new Date(b.start) : a.status === 'active' ? -1 : 1))[0];
    const location = vehicle?.location || alert.location || 'Location unavailable';
    const recordedLocation = alert.location && alert.location !== location
      ? `<div><dt>Alert location</dt><dd>${html(alert.location)}</dd></div>`
      : '';
    const phone = renter?.phone?.trim();
    const email = renter?.email?.trim();
    const renterDetails = renter
      ? `<article class="record-card">
          <div class="record-card-heading"><span class="record-card-icon">02</span><div><h3>Renter details</h3><p>${bookingStatusLabel(renter.status)} rental${renter.id ? ` · ${html(renter.id)}` : ''}</p></div></div>
          <dl class="record-fields"><div><dt>Full name</dt><dd>${html(renter.customer)}</dd></div><div><dt>Phone number</dt><dd>${phone ? `<a href="tel:${html(phone.replace(/[^\d+]/g, ''))}">${html(phone)}</a>` : 'Not provided'}</dd></div><div><dt>Email address</dt><dd>${email ? `<a href="mailto:${html(email)}">${html(email)}</a>` : 'Not provided'}</dd></div></dl>
          <div class="alert-contact-actions">${phone ? `<a class="button button--secondary" href="tel:${html(phone.replace(/[^\d+]/g, ''))}">Call renter</a>` : ''}${email ? `<a class="button button--secondary" href="mailto:${html(email)}">Email renter</a>` : ''}</div>
        </article>`
      : `<article class="record-card"><div class="record-card-heading"><span class="record-card-icon">02</span><div><h3>Renter details</h3><p>No active or upcoming booking</p></div></div><p class="alert-no-renter">There is no renter linked to this vehicle right now. Check the assigned driver and last known location below.</p></article>`;

    byId('alertDetailTitle').textContent = alert.title;
    byId('alertDetailSubtitle').textContent = `${alert.id} · ${formatBookingDate(alert.time, { weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' })}`;
    byId('alertDetailContent').innerHTML = `
      <section class="booking-record-overview alert-record-overview">
        <div><p class="section-kicker">${html(alert.vehicleId)} · ${html(vehicle?.model || 'Unknown vehicle')}</p><h3>${html(alert.message)}</h3><p>${html(vehicle?.plate || 'Vehicle details unavailable')}</p></div>
        <span class="booking-record-status booking-record-status--${alert.acknowledged ? 'completed' : 'pending'}">${alert.acknowledged ? 'Acknowledged' : 'Needs attention'}</span>
      </section>
      <div class="alert-record-grid">
        <article class="record-card">
          <div class="record-card-heading"><span class="record-card-icon">01</span><div><h3>Vehicle location</h3><p>Latest tracking information</p></div></div>
          <div class="alert-location-highlight"><span>LAST KNOWN LOCATION</span><strong>${html(location)}</strong><small>GPS update: ${html(vehicle?.updated || alertAge(alert.minutesAgo))}</small></div>
          <dl class="record-fields"><div><dt>Vehicle status</dt><dd>${html(vehicle ? statusLabel(vehicle.status) : 'Unavailable')}</dd></div><div><dt>Assigned driver</dt><dd>${html(vehicle?.driver || 'Not assigned')}</dd></div>${recordedLocation}</dl>
          <button class="text-button alert-map-link" type="button" data-view-alert-vehicle="${html(alert.vehicleId)}">Locate vehicle on fleet map</button>
        </article>
        ${renterDetails}
      </div>`;
    byId('alertDetailActions').innerHTML = alert.acknowledged
      ? '<span class="alert-detail-status">This alert has already been acknowledged.</span>'
      : `<button class="button button--primary" type="button" data-ack-alert="${html(alert.id)}">Acknowledge alert</button>`;
    if (!byId('alertDetailDialog').open) byId('alertDetailDialog').showModal();
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
      vehicleId: booking.vehicleId,
      time: booking.start,
      text: `Booking ${booking.id} (${booking.customer}) — ${booking.status}`,
    }));
    const alertEntries = state.alerts.map((alert) => ({
      id: `alert-${alert.id}`,
      vehicleId: alert.vehicleId,
      time: alert.time,
      text: `${alert.title}: ${alert.message} - ${alert.acknowledged ? 'Acknowledged' : 'Open'}`,
    }));
    const entries = [...bookingEntries, ...alertEntries].sort((a, b) => new Date(b.time) - new Date(a.time));
    renderedLogEntries = entries;
    if (state.logVehicleId !== 'all' && !vehicleFor(state.logVehicleId)) state.logVehicleId = 'all';
    byId('logVehicleFilter').innerHTML = '<option value="all">All car units</option>' + state.vehicles.map((vehicle) =>
      `<option value="${html(vehicle.id)}">${html(vehicle.id)} - ${html(vehicle.model)}</option>`).join('');
    byId('logVehicleFilter').value = state.logVehicleId;
    const visibleEntries = state.logVehicleId === 'all'
      ? entries
      : entries.filter((entry) => entry.vehicleId === state.logVehicleId);
    const vehicle = vehicleFor(state.logVehicleId);
    const reportTitle = vehicle ? `${vehicle.model} (${vehicle.id})` : 'All car units';
    byId('logSummary').textContent = state.logVehicleId === 'all'
      ? `${visibleEntries.length} records across ${state.vehicles.length} car units`
      : `${visibleEntries.length} records for ${reportTitle}`;
    byId('logPrintTitle').textContent = vehicle ? `Vehicle log - ${reportTitle}` : 'Vehicle logs - All car units';
    byId('logPrintSubtitle').textContent = vehicle
      ? `Unit ${vehicle.id} | ${vehicle.plate} | Printed ${formatBookingDate(new Date().toISOString(), { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}`
      : `All ${state.vehicles.length} car units | Printed ${formatBookingDate(new Date().toISOString(), { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}`;
    byId('logPrintHeader').hidden = false;
    byId('logList').innerHTML = visibleEntries.length ? visibleEntries.map((entry) => {
      const entryVehicle = vehicleFor(entry.vehicleId);
      const timestamp = formatBookingDate(entry.time, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
      return `<li class="logs-row" data-vehicle-id="${html(entry.vehicleId)}">
        <time class="mono logs-time" datetime="${html(entry.time)}">${html(timestamp)}</time>
        <span class="logs-unit"><strong>${html(entry.vehicleId)}</strong><span>${html(entryVehicle?.model || 'Vehicle unavailable')}</span></span>
        <span class="logs-text">${html(entry.text)}</span>
      </li>`;
    }).join('') : '<li class="empty-state"><strong>No logs for this car unit yet.</strong></li>';
    byId('downloadLogs').disabled = visibleEntries.length === 0;
    byId('printLogs').disabled = visibleEntries.length === 0;
  }

  function downloadLogs() {
    const vehicle = vehicleFor(state.logVehicleId);
    const entries = state.logVehicleId === 'all'
      ? renderedLogEntries
      : renderedLogEntries.filter((entry) => entry.vehicleId === state.logVehicleId);
    const reportTitle = vehicle ? `Vehicle log - ${vehicle.model} (${vehicle.id})` : 'Vehicle logs - All car units';
    const printedAt = formatBookingDate(new Date().toISOString(), { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
    const rows = entries.map((entry) => {
      const entryVehicle = vehicleFor(entry.vehicleId);
      return [
        formatBookingDate(entry.time, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }),
        `${entry.vehicleId} - ${entryVehicle?.model || 'Vehicle unavailable'}`,
        entry.text,
      ];
    });
    const tableRows = rows.length
      ? rows.map((row) => `<tr><td>${html(row[0])}</td><td>${html(row[1])}</td><td>${html(row[2])}</td></tr>`).join('')
      : '<tr><td colspan="3">No log records for this car unit.</td></tr>';
    const documentHtml = `<!doctype html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" lang="en">
<head><meta charset="utf-8"><title>${html(reportTitle)}</title>
<style>
  body { font-family: Arial, sans-serif; color: #24343b; }
  h1 { margin-bottom: 6px; font-size: 22px; }
  .meta { margin: 0 0 20px; color: #53656b; font-size: 12px; }
  table { width: 100%; border-collapse: collapse; }
  th, td { border: 1px solid #cbd4d4; padding: 9px 10px; text-align: left; vertical-align: top; }
  th { color: #24343b; background: #eef3f1; font-size: 11px; text-transform: uppercase; }
  td { font-size: 12px; line-height: 1.4; }
  tr { page-break-inside: avoid; }
</style></head>
<body>
  <h1>${html(reportTitle)}</h1>
  <p class="meta">${vehicle ? `Unit ${html(vehicle.id)} | ${html(vehicle.plate)}` : `All ${state.vehicles.length} car units`} | Printed ${html(printedAt)}</p>
  <table><thead><tr><th>Date &amp; time</th><th>Car unit</th><th>Activity</th></tr></thead><tbody>${tableRows}</tbody></table>
</body></html>`;
    const unitName = (vehicle?.id || 'all-units').toLowerCase().replace(/[^a-z0-9-]+/g, '-');
    const date = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Manila', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
    const url = URL.createObjectURL(new Blob(['\uFEFF', documentHtml], { type: 'application/msword;charset=utf-8' }));
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = `sgt-car-logs-${unitName}-${date}.doc`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    byId('logExportMenu').open = false;
    toast(`${entries.length} log records downloaded as a Word document.`);
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
  byId('logVehicleFilter').addEventListener('change', (event) => {
    state.logVehicleId = event.target.value;
    renderLogs();
  });
  byId('downloadLogs').addEventListener('click', downloadLogs);
  byId('printLogs').addEventListener('click', () => {
    byId('logExportMenu').open = false;
    window.print();
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
    const row = event.target.closest('[data-alert-id]');
    if (!row) return;
    const alert = state.alerts.find((item) => item.id === row.dataset.alertId);
    if (alert) renderAlertDetails(alert);
  });
  byId('alertDetailDialog').addEventListener('click', (event) => {
    const acknowledgeButton = event.target.closest('[data-ack-alert]');
    if (acknowledgeButton) {
      const alert = state.alerts.find((item) => item.id === acknowledgeButton.dataset.ackAlert);
      if (!alert) return;
      alert.acknowledged = true;
      byId('alertDetailDialog').close();
      renderAll();
      toast(`${alert.id} acknowledged.`);
      return;
    }

    const mapButton = event.target.closest('[data-view-alert-vehicle]');
    if (mapButton) {
      const vehicleId = mapButton.dataset.viewAlertVehicle;
      state.query = '';
      state.status = 'all';
      byId('vehicleSearch').value = '';
      byId('statusFilter').value = 'all';
      byId('alertDetailDialog').close();
      showPage('overview');
      setSelected(vehicleId);
    }
  });
  byId('closeAlertDetail').addEventListener('click', () => byId('alertDetailDialog').close());
  byId('alertDetailDialog').addEventListener('click', (event) => {
    if (event.target === byId('alertDetailDialog')) byId('alertDetailDialog').close();
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
  const appShell = document.querySelector('.app-shell');
  const sidebarToggle = byId('toggleSidebar');
  const mobileNavigation = window.matchMedia('(max-width: 650px)');
  const updateSidebarToggle = () => {
    if (mobileNavigation.matches) {
      sidebarToggle.setAttribute('aria-label', 'Go to overview');
      sidebarToggle.title = 'Go to overview';
      sidebarToggle.removeAttribute('aria-expanded');
      sidebarToggle.removeAttribute('aria-controls');
      return;
    }

    const expanded = appShell.classList.contains('app-shell--sidebar-expanded');
    const label = expanded ? 'Collapse' : 'Expand';
    sidebarToggle.setAttribute('aria-expanded', String(expanded));
    sidebarToggle.setAttribute('aria-controls', 'primaryNav');
    sidebarToggle.setAttribute('aria-label', label + ' navigation');
    sidebarToggle.title = label + ' navigation';
  };
  sidebarToggle.addEventListener('click', () => {
    if (mobileNavigation.matches) {
      if (window.location.hash === '#page=overview') showPage('overview');
      else window.location.hash = '#page=overview';
      return;
    }

    appShell.classList.toggle('app-shell--sidebar-expanded');
    updateSidebarToggle();
  });
  mobileNavigation.addEventListener('change', updateSidebarToggle);
  updateSidebarToggle();

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
      subtitle: 'Open an alert to view renter contact details and the vehicle’s last known location.',
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
      subtitle: 'Select a car unit to review or print its booking and alert history.',
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
