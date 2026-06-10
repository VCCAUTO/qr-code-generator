# QR Code Generator

A production-ready React + Vite web app for creating, customizing, and exporting QR codes.

## Features

- Real-time QR generation from any text, URL, or data string
- Presets for URL, email, phone, WiFi, and vCard QR content
- Customization controls:
  - Error correction levels (L, M, Q, H)
  - Size/scale slider
  - Foreground and background colors
  - Export format: PNG, SVG, JPEG
- Download QR images in selected format
- Copy QR image (or fallback text) to clipboard
- Notes/description field per QR code
- Recent history with one-click restore
- Responsive layout and built-in dark mode toggle

## Tech Stack

- React 19
- Vite
- Tailwind CSS
- `qrcode.react`
- Capacitor 7 (Android packaging)

## Development

```bash
npm install
npm run dev
```

## Build (web)

```bash
npm run lint
npm run build
```

## Android APK

The project is wrapped with [Capacitor](https://capacitorjs.com/) so it can be built as a native Android APK.

### Prerequisites

- [Android Studio](https://developer.android.com/studio) with Android SDK installed (API 22+)
- Java 17+

### Build a debug APK

```bash
# 1. Install dependencies
npm install

# 2. Build the web app
npm run build

# 3. Sync web assets into the Android project
npm run cap:sync

# 4. Build the debug APK
npm run android:build
```

The APK is output to:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

Transfer the file to an Android device (or use `adb install`) to sideload it.
You can also open the `android/` folder in Android Studio for a release/signed build.

### Open in Android Studio

```bash
npm run cap:open
```

## License

MIT
