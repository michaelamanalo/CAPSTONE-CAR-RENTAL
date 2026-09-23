import 'package:http/http.dart' as http;

import 'supabase_settings.dart';

class SupabaseConnectionProbe {
  SupabaseConnectionProbe(this._client);

  final http.Client _client;

  Future<bool> check(SupabaseSettings settings) async {
    final response = await _client.get(
      Uri.parse('${settings.url}/rest/v1/'),
      headers: {
        'apikey': settings.anonKey,
        'Authorization': 'Bearer ${settings.anonKey}',
      },
    );

    return response.statusCode >= 200 && response.statusCode < 300;
  }
}
