import 'package:flutter_test/flutter_test.dart';
import 'package:g_fleet_mobile/features/bookings/data/booking_store.dart';
import 'package:g_fleet_mobile/features/bookings/domain/booking_draft.dart';
import 'package:g_fleet_mobile/features/home/data/sample_vehicles.dart';

BookingDraft exampleDraft({
  DateTime? pickup,
  DateTime? returnAt,
  String pickupLocation = 'Sample branch A',
}) => BookingDraft(
  vehicle: sampleVehicles.first,
  pickup: pickup ?? DateTime(2040, 1, 2, 9, 30),
  returnAt: returnAt ?? DateTime(2040, 1, 3, 15, 45),
  pickupLocation: pickupLocation,
  returnLocation: 'Sample branch B',
);

void main() {
  late BookingStore store;
  final now = DateTime(2039);
  setUp(() {
    store = BookingStore();
    store.startVisit();
  });
  tearDown(() => store.dispose());

  test(
    'Confirm creates an immutable local record retrievable by stable MOCK ID',
    () {
      final draft = exampleDraft();
      final booking = store.confirm(draft, visitId: store.visitId, now: now);
      expect(booking.id, 'MOCK-000001');
      expect(identical(booking.draft, draft), isTrue);
      expect(booking.quote.totalPesos, 3600);
      expect(booking.quote.billedDays, 2);
      expect(booking.status, 'Local mock');
      expect(identical(store.findById('MOCK-000001'), booking), isTrue);
      expect(store.findById('unknown'), isNull);
      expect(() => store.bookings.clear(), throwsUnsupportedError);
    },
  );
  test('Repeated confirmation returns same record and notifies only once', () {
    var changes = 0;
    store.addListener(() => changes++);
    final draft = exampleDraft();
    final first = store.confirm(draft, visitId: store.visitId, now: now);
    final repeated = store.confirm(draft, visitId: store.visitId, now: now);
    expect(identical(first, repeated), isTrue);
    expect(store.bookings.length, 1);
    expect(changes, 1);
    final second = store.confirm(
      exampleDraft(),
      visitId: store.visitId,
      now: now,
    );
    expect(second.id, 'MOCK-000002');
    expect(first.id, 'MOCK-000001');
  });
  test(
    'Ending a visit clears records, notifies and rejects further confirmations',
    () {
      store.confirm(exampleDraft(), visitId: store.visitId, now: now);
      final oldVisit = store.visitId;
      var changes = 0;
      store.addListener(() => changes++);
      store.endVisit();
      expect(store.bookings, isEmpty);
      expect(store.findById('MOCK-000001'), isNull);
      expect(changes, 1);
      expect(
        () => store.confirm(exampleDraft(), visitId: oldVisit, now: now),
        throwsStateError,
      );
    },
  );
  test(
    'New Home visit rejects stale review and never reuses an ID within the app',
    () {
      final oldVisit = store.visitId;
      store.confirm(exampleDraft(), visitId: oldVisit, now: now);
      store.endVisit();
      store.startVisit();
      expect(store.bookings, isEmpty);
      expect(
        () => store.confirm(exampleDraft(), visitId: oldVisit, now: now),
        throwsStateError,
      );
      expect(
        store.confirm(exampleDraft(), visitId: store.visitId, now: now).id,
        'MOCK-000002',
      );
    },
  );
  test('Confirmation revalidates future pickup, return order and temporary locations', () {
    for (final draft in [
      exampleDraft(pickup: now),
      exampleDraft(returnAt: DateTime(2039)),
      exampleDraft(pickupLocation: ''),
    ]) {
      expect(
        () => store.confirm(draft, visitId: store.visitId, now: now),
        throwsArgumentError,
      );
    }
    expect(store.bookings, isEmpty);
    expect(
      store.confirm(exampleDraft(), visitId: store.visitId, now: now).id,
      'MOCK-000001',
    );
  });
}
