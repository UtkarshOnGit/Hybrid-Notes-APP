# NoteFlow — Hybrid Web & Android Notes Application

A modern, responsive hybrid note-taking application built with web technologies (HTML5, CSS3, JavaScript) and packaged into a native Android app using **Capacitor**.

---

## 📱 Features

- **Full CRUD Capabilities**:
  - **Create**: Add new notes with titles, categorized tags, color schemes, and body text.
  - **Read**: View notes in a responsive mobile grid with live counters.
  - **Update**: Edit existing notes seamlessly via an in-app modal editor.
  - **Delete**: Remove notes with a confirmation safety prompt.
- **Pin to Top**: Keep important or urgent notes pinned at the top of your list.
- **Search & Filters**: Instant, real-time search across titles and note contents, plus quick category filter pills (*Personal, Work, Ideas, Study*).
- **Custom Color Accents**: Select from curated color palettes (*Indigo, Emerald, Amber, Rose, Cyan*).
- **Persistent Storage**: Uses browser/WebView `localStorage`—no backend server needed, zero latency, and 100% offline-ready.
- **Dark & Light Mode**: Built-in sleek dark mode toggle with system preference detection.
- **Mobile-First Design**: Optimized touch targets, smooth micro-animations, notch safe-area support (`env(safe-area-inset)`), and a floating action button (FAB).

---

## 🏗️ Architecture & Hybrid Development Method

```
+-------------------------------------------------------------+
|                      NoteFlow UI / UX                       |
|           (HTML5 + Modern CSS + Vanilla JavaScript)         |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
|                Capacitor Hybrid Container                   |
|        (Bridges Web Assets into Native Android Assets)      |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
|                     Android Platform                        |
|       (Android WebView + Gradle Build Tooling + Native App) |
+-------------------------------------------------------------+
```

1. **Web Core (`www/`)**: The entire UI and application logic are built using standard web technologies without external framework bloat.
2. **Capacitor Bridge**: Capacitor packages the `www/` directory into the Android asset directory (`android/app/src/main/assets/public`).
3. **Android Runtime**: Android runs the app inside a hardware-accelerated WebView instance with native capabilities, generating a standalone `.apk`.

---

## 📂 Project Structure

```
.
├── apk/
│   └── noteflow-hybrid-app.apk    <-- Built standalone Android APK
├── www/
│   ├── index.html                 <-- Application markup & modals
│   ├── css/
│   │   └── style.css              <-- Styling, variables, animations & dark mode
│   └── js/
│       └── app.js                 <-- CRUD logic, localStorage & search
├── android/                       <-- Capacitor Android native Gradle project
├── capacitor.config.json          <-- Capacitor configuration
├── package.json                   <-- NPM dependencies and build scripts
└── README.md
```

---

## 🚀 Getting Started

### 1. Running the Web Application
You can run the web app directly in any modern browser:

- **Method A (Direct)**: Open `www/index.html` in your web browser.
- **Method B (Local Server)**:
  ```bash
  npm install
  npm start
  ```

---

### 2. Installing the Android APK on a Device

The compiled debug APK is located in the `apk/` directory:
- **Path**: `apk/noteflow-hybrid-app.apk`

#### Option 1: Via ADB (Command Line)
Connect your Android phone or start an emulator with USB debugging enabled:
```bash
adb install apk/noteflow-hybrid-app.apk
```

#### Option 2: Direct Transfer
1. Transfer `apk/noteflow-hybrid-app.apk` to your phone via Google Drive, WhatsApp, or USB cable.
2. Tap the file in your phone's file manager and select **Install** (allow installation from unknown sources if prompted).

---

### 3. Rebuilding the APK from Source

If you make modifications to the web files in `www/`:

1. **Sync web changes to the Android platform**:
   ```bash
   npm run cap:sync
   ```
2. **Compile the APK with Gradle**:
   ```bash
   cd android
   ./gradlew assembleDebug
   ```
   The newly built APK will be generated at:
   `android/app/build/outputs/apk/debug/app-debug.apk`

3. **Copy to the `apk/` folder**:
   ```bash
   cp android/app/build/outputs/apk/debug/app-debug.apk ../apk/noteflow-hybrid-app.apk
   ```

---

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3 (Vanilla), JavaScript (ES6+)
- **Hybrid Bridge**: [@capacitor/core](https://capacitorjs.com/) v7.x, [@capacitor/cli](https://capacitorjs.com/), [@capacitor/android](https://capacitorjs.com/)
- **Native Android**: Gradle 8.11, Android SDK Platform 36, Android Build Tools 35
- **Storage**: Browser LocalStorage API
