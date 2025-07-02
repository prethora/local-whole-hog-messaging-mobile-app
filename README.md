# whole-hog-messaging-mobile-app

A Capacitor-based mobile application (Android & iOS) that scans a QR code and launches the Whole Hog Messenger front-end.

## Requirements

Node.js v18.18 is required (see `engines.node` in `package.json`). To use a different version, adjust or remove that constraint—but v18.18 is recommended for consistency across development. Using nvm to manage multiple Node.js versions can be helpful, but isn’t required.

## Environment Variables

1. Copy or rename `.env-sample` to `.env` and set the following:

   * `WH_MESSENGER_FRONTEND_DIR`
     Absolute path to your locally cloned `whole-hog-messaging-frontend` repository.

   * `RUN_ANDROID_DEVICE_ID` *(optional)*
     ID of the Android emulator or device for `npm run run-android-device`.

   * `RUN_IOS_DEVICE_ID` *(optional)*
     ID of the iOS simulator or device for `npm run run-ios-device`.

   * `REACT_APP_SIMULATE_QR_CODE_QUERY` *(development only)*
     Query string to simulate QR scanning. Necessary when using a simulator device, tap under the scanner to activate.  **IMPORTANT:** **Keep empty for production builds**.

     > To obtain this value: open the Wordpress Messenger page, right-click on the iframe and View Frame Source. Copy everything after the `?` in the address bar, and set it here.

## Installation

```bash
npm install
```

## Development

### Front‑end Only

```bash
npm run dev
```

* Starts the webpack dev server for the Messenger front‑end (home & QR scanner screens).

### Syncing with Native Projects

```bash
npm run sync-android
npm run sync-ios
```

* Builds the Capacitor shell and the Messenger front‑end.
* Copies the `dist` folder from `whole-hog-messaging-frontend` into this app’s `dist`.
* Runs `cap sync` for Android or iOS.

### Running on Device/Simulator

```bash
npm run run-android
npm run run-android-device
npm run run-ios
npm run run-ios-device
```

* `run-android` / `run-ios`: prompts for device selection.
* `run-*-device`: uses `RUN_*_DEVICE_ID` to skip the prompt.

### Opening Native IDEs

```bash
npm run open-android
npm run open-ios
```

* Opens the native projects in Android Studio or Xcode for manual build, archive, and signing.

## Production Build

1. Ensure `REACT_APP_SIMULATE_QR_CODE_QUERY` is empty.
2. Run `npm run sync-android` or `npm run sync-ios`.
3. Run `npm run open-android` or `npm run open-ios`.
4. In your IDE, archive, sign, and export the APK or IPA for distribution.
