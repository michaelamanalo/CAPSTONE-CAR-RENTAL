import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:g_fleet_mobile/supabase_connection_probe.dart';
import 'package:g_fleet_mobile/supabase_settings.dart';

void main() {
  test('accepts a valid Supabase URL and anonymous key', () {
    final settings = SupabaseSettings.fromValues(
      url: 'https://jvpqereqibagkqpcjnav.supabase.co',
      anonKey: 'public-anon-key',
    );

    expect(settings.url, 'https://jvpqereqibagkqpcjnav.supabase.co');
    expect(settings.anonKey, 'public-anon-key');
  });

  test('rejects incomplete Supabase configuration', () {
    expect(
      () => SupabaseSettings.fromValues(
        url: '',
        anonKey: 'public-anon-key',
      ),
      throwsArgumentError,
    );
  });

  test('reads the Supabase REST root with the anonymous key', () async {
    final client = MockClient((request) async {
      expect(request.method, 'GET');
      expect(
        request.url,
        Uri.parse('https://jvpqereqibagkqpcjnav.supabase.co/rest/v1/'),
      );
      expect(request.headers['apikey'], 'public-anon-key');
      expect(request.headers['authorization'], 'Bearer public-anon-key');
      return http.Response('{}', 200);
    });
    final settings = SupabaseSettings.fromValues(
      url: 'https://jvpqereqibagkqpcjnav.supabase.co',
      anonKey: 'public-anon-key',
    );

    final isConnected = await SupabaseConnectionProbe(client).check(settings);

    expect(isConnected, isTrue);
  });
}
