/// Temporary frontend rules, independent of any future authentication service.
abstract final class AuthValidators {
  static String? email(String? value) {
    final email = value?.trim() ?? '';
    if (email.isEmpty) return 'Enter your email address.';
    if (!RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$').hasMatch(email)) {
      return 'Enter a valid email address.';
    }
    return null;
  }

  static String? fullName(String? value) =>
      value == null || value.trim().isEmpty ? 'Enter your full name.' : null;

  static String? password(String? value) =>
      value == null || value.trim().isEmpty ? 'Enter your password.' : null;

  // Temporary registration policy until an approved backend policy exists.
  static String? registrationPassword(String? value) {
    final requiredError = password(value);
    if (requiredError != null) return requiredError;
    if (value!.runes.length < 8) return 'Use at least 8 characters.';
    return null;
  }

  static String? confirmPassword(String? value, String password) {
    if (value == null || value.trim().isEmpty) return 'Confirm your password.';
    if (value != password) return 'Passwords do not match.';
    return null;
  }
}
