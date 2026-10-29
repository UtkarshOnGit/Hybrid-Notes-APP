# Notes — Hybrid Web & Android Application

A clean, responsive note-taking application built with standard web technologies (HTML5, CSS3, JavaScript) and packaged into a native Android application using Capacitor.

---

## Features

- Full CRUD capabilities:
  - Create: Add new notes with titles, tags, and content.
  - Read: View notes in a clean list layout with note counters.
  - Update: Edit existing notes using an in-app note dialog.
  - Delete: Remove notes with a confirmation prompt.
- Pin notes: Keep important notes pinned at the top.
- Search and filters: Search across titles and note contents, with quick category filters (Personal, Work, Ideas, Study).
- Local persistence: Stored in device local storage without requiring any backend. Completely offline-functional.
- Theme support: Clean light and dark mode toggle.
- Mobile-first layout: Touch-friendly buttons, floating action button, and safe-area padding for mobile notches.

---

## Architecture

```
+-------------------------------------------------------------+
|                         Notes UI                            |
|             (HTML5 + Vanilla CSS + JavaScript)              |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
|                 Capacitor Hybrid Container                  |
|        (Bridges web assets into native Android assets)      |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
|                      Android Platform                       |
|         (Android WebView + Gradle + Native Container)       |
+-------------------------------------------------------------+
```

1. **Web Core (`www/`)**: Built using clean semantic HTML5, modern CSS, and modular ES6 JavaScript.
2. **Capacitor Bridge**: Synchronizes web assets to `android/app/src/main/assets/public`.
3. **Android Platform**: Runs inside an Android WebView container and compiles to a standalone `.apk`.

---

## Project Structure

```
.
├── apk/
│   └── noteflow-hybrid-app.apk    <-- Built standalone Android APK
├── www/
│   ├── index.html                 <-- Application markup and dialogs
│   ├── css/
│   │   └── style.css              <-- Styles and light/dark theme
│   └── js/
│       └── app.js                 <-- CRUD logic and local storage
├── android/                       <-- Capacitor Android Gradle project
├── capacitor.config.json          <-- Capacitor configuration
├── package.json                   <-- NPM dependencies and scripts
└── README.md
```

---

## Getting Started

### 1. Running the Web Application
Open `www/index.html` directly in any web browser, or run a local server:
```bash
npm install
npm start
```

---

### 2. Installing the Android APK

The compiled debug APK is located in the `apk/` directory:
- Path: `apk/noteflow-hybrid-app.apk`

#### Option 1: Via ADB
Connect your Android phone or emulator:
```bash
adb install apk/noteflow-hybrid-app.apk
```

#### Option 2: Direct Transfer
1. Transfer `apk/noteflow-hybrid-app.apk` to your phone via USB cable or file sharing.
2. Open the file on your device and tap **Install**.

---

### 3. Rebuilding the APK from Source

1. Synchronize web changes to the Android project:
   ```bash
   npm run cap:sync
   ```
2. Build the APK with Gradle:
   ```bash
   cd android
   ./gradlew assembleDebug
   ```
3. Copy the output APK:
   ```bash
   cp android/app/build/outputs/apk/debug/app-debug.apk ../apk/noteflow-hybrid-app.apk
   ```

---

## Tech Stack

- Frontend: HTML5, CSS3, JavaScript (ES6)
- Hybrid Bridge: @capacitor/core, @capacitor/cli, @capacitor/android
- Native Android: Gradle 8.11, Android SDK Platform 36, Android Build Tools 35
- Storage: Browser LocalStorage API
