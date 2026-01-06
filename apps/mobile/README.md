# PhysiMap Mobile (Expo)

Expo React Native client for PhysiMap.

Locked constraints:
- Android Emulator (AVD) is the primary dev environment
- App is UI only (analysis happens in the FastAPI backend)
- API base URL must be configurable (emulator vs prod)

---

## Prerequisites
- Node.js (LTS recommended)
- Android Studio + AVD (Android Emulator)

---

## Environment configuration (API base URL)
Create a local env file from the example:

```bash
cp .env.example .env
