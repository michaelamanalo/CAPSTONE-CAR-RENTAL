class SupabaseSettings {
  const SupabaseSettings._({required this.url, required this.anonKey});

  factory SupabaseSettings.fromValues({
    required String url,
    required String anonKey,
  }) {
    final normalizedUrl = url.trim();
    final normalizedAnonKey = anonKey.trim();

    if (normalizedUrl.isEmpty || normalizedAnonKey.isEmpty) {
      throw ArgumentError(
        'SUPABASE_URL and SUPABASE_ANON_KEY must both be provided.',
      );
    }

    return SupabaseSettings._(url: normalizedUrl, anonKey: normalizedAnonKey);
  }

  static SupabaseSettings? fromEnvironment() {
    const url = String.fromEnvironment('SUPABASE_URL');
    const anonKey = String.fromEnvironment('SUPABASE_ANON_KEY');

    if (url.isEmpty || anonKey.isEmpty) {
      return null;
    }

    return SupabaseSettings.fromValues(url: url, anonKey: anonKey);
  }

  final String url;
  final String anonKey;
}
