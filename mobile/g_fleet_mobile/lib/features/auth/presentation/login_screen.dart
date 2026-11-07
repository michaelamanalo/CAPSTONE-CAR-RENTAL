import 'package:flutter/material.dart';

import '../../../app/router/app_router.dart';
import 'auth_validators.dart';
import 'widgets/auth_layout.dart';
import 'widgets/password_field.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();

  void _submit() {
    if (_formKey.currentState!.validate()) showBackendNotice(context);
  }

  @override
  Widget build(BuildContext context) {
    return AuthLayout(
      title: 'Welcome back',
      description: 'Login to your G-FLEET customer account.',
      formKey: _formKey,
      children: [
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
        PasswordField(validator: AuthValidators.password, onSubmitted: _submit),
        Align(
          alignment: Alignment.centerRight,
          child: TextButton(
            onPressed: () =>
                Navigator.of(context).pushNamed(AppRouter.forgotPassword),
            child: const Text('Forgot password?'),
          ),
        ),
        FilledButton(onPressed: _submit, child: const Text('Login')),
        TextButton(
          onPressed: () =>
              Navigator.of(context).pushNamed(AppRouter.registration),
          child: const Text('Create an account'),
        ),
      ],
    );
  }
}
