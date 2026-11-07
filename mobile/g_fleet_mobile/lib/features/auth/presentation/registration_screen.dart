import 'package:flutter/material.dart';

import 'auth_validators.dart';
import 'widgets/auth_layout.dart';
import 'widgets/password_field.dart';

class RegistrationScreen extends StatefulWidget {
  const RegistrationScreen({super.key});

  @override
  State<RegistrationScreen> createState() => _RegistrationScreenState();
}

class _RegistrationScreenState extends State<RegistrationScreen> {
  final _formKey = GlobalKey<FormState>();
  final _password = TextEditingController();

  @override
  void dispose() {
    _password.dispose();
    super.dispose();
  }

  void _submit() {
    if (_formKey.currentState!.validate()) showBackendNotice(context);
  }

  @override
  Widget build(BuildContext context) {
    return AuthLayout(
      title: 'Create your account',
      description: 'Start your next journey with G-FLEET.',
      formKey: _formKey,
      children: [
        TextFormField(
          validator: AuthValidators.fullName,
          textCapitalization: TextCapitalization.words,
          textInputAction: TextInputAction.next,
          decoration: const InputDecoration(
            labelText: 'Full name',
            prefixIcon: Icon(Icons.person_outline),
          ),
        ),
        TextFormField(
          validator: AuthValidators.email,
          keyboardType: TextInputType.emailAddress,
          textInputAction: TextInputAction.next,
          autocorrect: false,
          decoration: const InputDecoration(
            labelText: 'Email address',
            prefixIcon: Icon(Icons.mail_outline),
          ),
        ),
        PasswordField(
          controller: _password,
          validator: AuthValidators.registrationPassword,
          helperText: 'Use at least 8 characters.',
          textInputAction: TextInputAction.next,
        ),
        PasswordField(
          label: 'Confirm password',
          validator: (value) =>
              AuthValidators.confirmPassword(value, _password.text),
          onSubmitted: _submit,
        ),
        FilledButton(onPressed: _submit, child: const Text('Create Account')),
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: const Text('Back to Login'),
        ),
      ],
    );
  }
}
