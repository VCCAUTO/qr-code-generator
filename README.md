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

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run lint
npm run build
```

## License

MIT
