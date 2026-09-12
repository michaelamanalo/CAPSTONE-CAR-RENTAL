# Android Emulator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Run the G-FLEET Flutter application on a representative mainstream Android phone emulator.

**Architecture:** Add the missing Flutter Android platform scaffold without replacing application source, provision a Google APIs x86-64 Pixel-class AVD, and launch the app through Flutter. Keep machine-specific SDK and AVD data outside version-controlled project configuration.

**Tech Stack:** Flutter 3.47.2, Dart 3.13.2, Android SDK, Android Emulator, Gradle

**Spec:** User request in the 2026-09-12 conversation.

## Global Constraints

- Preserve the existing `lib/main.dart` and application screens.
- Use a Pixel 7-class device with 4 GB RAM and a Google APIs x86-64 Android system image.
- Do not commit machine-specific SDK paths or emulator data.
- Verify with Flutter analysis/tests, an Android build, successful emulator boot, and successful app launch.

---

### Task 1: Make the Flutter project Android-compatible

**Files:**
- Modify: `mobile/g_fleet_mobile/pubspec.yaml`
- Create/modify: `mobile/g_fleet_mobile/android/` via Flutter's platform generator
- Test: `mobile/g_fleet_mobile/test/` when present

**Interfaces:**
- Consumes: existing `lib/main.dart` and Flutter SDK at `D:\Codestuuf\flutter`
- Produces: an Android Gradle application runnable by `flutter run`

- [ ] **Step 1: Reproduce the current Android build failure**

Run `flutter build apk --debug` and record the missing-platform or SDK-constraint error.

- [ ] **Step 2: Update the Dart SDK constraint if required**

Set the supported Dart range in `pubspec.yaml` to `">=3.0.0 <4.0.0"`, matching the installed Dart 3 toolchain while retaining null safety.

- [ ] **Step 3: Generate only the missing Android platform**

Run `flutter create --platforms=android .` from `mobile/g_fleet_mobile`, then review the diff to ensure application source was preserved.

- [ ] **Step 4: Restore packages and run static checks**

Run `flutter pub get`, `flutter analyze`, and `flutter test` when a test directory exists.

- [ ] **Step 5: Build a debug APK**

Run `flutter build apk --debug` and require a successful APK artifact.

### Task 2: Provision a representative Android emulator

**Files:**
- Create outside repository: Android SDK system-image package
- Create outside repository: user AVD named `G_Fleet_Pixel_7_API_35`

**Interfaces:**
- Consumes: installed Android SDK and Android Studio JDK
- Produces: booted Android emulator visible to `adb` and `flutter devices`

- [ ] **Step 1: Check SDK licenses and virtualization acceleration**

Run `flutter doctor -v` and `emulator -accel-check`; request user acknowledgement or Windows administration only if required.

- [ ] **Step 2: Install the emulator dependencies**

Install `system-images;android-35;google_apis;x86_64` and the Android Emulator Hypervisor Driver package when supported.

- [ ] **Step 3: Create the AVD**

Create `G_Fleet_Pixel_7_API_35` using the Pixel 7 hardware profile, then configure 4096 MB RAM and retain the profile's phone display characteristics.

- [ ] **Step 4: Start and await the emulator**

Launch the AVD, wait for `sys.boot_completed=1`, unlock it, and confirm it appears in both `adb devices` and `flutter devices`.

### Task 3: Install and launch G-FLEET

**Files:**
- Verify artifact: `mobile/g_fleet_mobile/build/app/outputs/flutter-apk/app-debug.apk`

**Interfaces:**
- Consumes: Android debug build and booted `G_Fleet_Pixel_7_API_35`
- Produces: G-FLEET foreground activity running on the emulator

- [ ] **Step 1: Launch through Flutter**

Run `flutter run --debug --no-resident -d <emulator-id>`.

- [ ] **Step 2: Verify the installed package and foreground activity**

Use `adb shell pm list packages` and `adb shell dumpsys activity activities` to confirm the generated G-FLEET package is installed and resumed.

- [ ] **Step 3: Re-run final project checks**

Run `flutter analyze`, applicable tests, and `git status --short`; report any unrelated pre-existing worktree changes separately.
