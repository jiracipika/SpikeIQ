# SpikeIQ Mobile

Expo (SDK 52) native client for SpikeIQ. Uses **expo-dev-client**, not Expo Go,
so all native modules and the custom dev client must be installed before the app
will run on a device.

## Prereqs

- Node 20.x
- Java 17 (for Android builds)
- Android Studio (SDK + emulator) for local Android development
- Xcode 15+ for local iOS development (macOS only)
- An Expo account + `EXPO_TOKEN` (used by Codemagic; not needed locally if you
  log in via `eas login`)

## Local development

```bash
cd mobile
npm install
npm run prebuild      # generates android/ + ios/ projects (one-time / on plugin change)
npm run android       # builds the dev client and installs on an emulator/device
# or
npm run ios           # macOS only
```

The dev client connects to a Metro bundler started by `npm run start`.

## API endpoint

The app talks to the Next.js API. By default it points at the production
deployment; override locally with:

```bash
EXPO_PUBLIC_API_URL=http://192.168.1.42:3000 npm run start
```

(Use your machine's LAN IP, not `localhost`, so the device can reach it.)

## Codemagic builds

`codemagic.yaml` at the repo root runs an EAS **local** Android build on
every push to `main` and uploads `build.apk` as an artifact. Required env
vars (set in the Codemagic UI under the `expo_credential` group):

- `EXPO_TOKEN` — personal access token from <https://expo.dev/accounts/[you]/settings/access-tokens>

## Why no Expo Go?

`expo-dev-client` is in the dependency list, so the app expects a custom
native runtime. Trying to open it in Expo Go will fail at startup. This is
required if/when we add native-only modules (push, in-app purchases, etc.).
