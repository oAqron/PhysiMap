# Dev Setup (Android Emulator ↔ Local API)

This project is built and demoed primarily on the **Android Emulator** (Android Studio AVD).
During development, the FastAPI backend runs locally and the emulator calls it over HTTP.

## Local API base URL (Android Emulator)
Android Emulator cannot use `http://localhost:<PORT>` to reach your host machine’s server.
Use the emulator’s special alias:

- Host machine `localhost` → Emulator: `http://10.0.2.2:<PORT>`

Example (FastAPI on port 8000):
- `http://10.0.2.2:8000`

## Configuring the mobile app API base URL
The Expo app must read the API base URL from configuration (dev vs prod).

Recommended (Expo public env var):
- `EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:8000`

Notes:
- Commit a `.env.example` file.
- Do NOT commit real `.env` files.

## Configuring the backend
Backend runs locally (stateless FastAPI). Keep secrets in `.env` (ignored by git).

Typical dev:
- Host: `0.0.0.0`
- Port: `8000`

## Quick troubleshooting
- If the emulator can’t reach the API:
  - Confirm the backend is running.
  - Confirm you used `10.0.2.2` (not `localhost`).
  - Confirm the port matches the backend (e.g., 8000).
