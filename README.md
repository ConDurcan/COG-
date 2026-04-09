# Compfit

![Expo](https://img.shields.io/badge/Expo-SDK%2054-000000?logo=expo&logoColor=white)
![React Native](https://img.shields.io/badge/React%20Native-0.81-61DAFB?logo=react&logoColor=black)
![Supabase](https://img.shields.io/badge/Supabase-Auth%20+%20DB-3ECF8E?logo=supabase&logoColor=white)
![Tests](https://img.shields.io/badge/Tests-Jest-C21325?logo=jest&logoColor=white)

Compfit is a mobile fitness app built with Expo and React Native. It includes authentication, session persistence, pedometer-based step tracking, and Supabase-backed user data.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Supabase Setup](#supabase-setup)
- [Run the App](#run-the-app)
- [Scripts](#scripts)
- [App Flow](#app-flow)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Roadmap](#roadmap)

---

## Overview

Compfit provides a simple fitness-focused experience:

- User authentication with Supabase Auth
- Protected navigation for logged-in users
- Daily step tracking from device sensors
- Goal-based progress feedback
- Foundation for profile metrics and league history

---

## Features

- Sign up and log in
- Session restore on app launch
- Protected route behaviour
- Activity screen with:
  - Today's step count
  - Editable step goal
  - Steps left calculation
- Home screen with current session info
- Profile screen with weekly chart placeholder
- Integration tests for core auth/navigation behaviour

---

## Tech Stack

| Technology | Version |
|---|---|
| Expo | SDK 54 |
| React | 19 |
| React Native | 0.81 |
| Expo Router | Latest |
| Supabase JS Client | Latest |
| AsyncStorage | Latest |
| Jest + Testing Library React Native | Latest |

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root — see [Environment Variables](#environment-variables) below.

### 3. Apply Supabase migrations

See [Supabase Setup](#supabase-setup) below.

### 4. Start the app

```bash
npm run start
```

---

## Environment Variables

Create a `.env` file in the project root with the following:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> **Note:** Both variables are required. The `EXPO_PUBLIC_` prefix is necessary for Expo to expose them at runtime.

---

## Supabase Setup

Apply the SQL migration to your Supabase project using either:

- The **Supabase SQL Editor** (paste and run the migration file)
- The **Supabase CLI** migration workflow

The schema includes the following tables:

- `profiles`
- `user_metrics`
- `league_results`
- `active_leagues`

The migration also configures:

- Row Level Security (RLS) policies for user-isolated access
- A trigger to auto-create a profile on auth signup
- `updated_at` triggers for all mutable tables

---

## Run the App

```bash
# Start development server
npm run start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on web
npm run web
```

---

## Scripts

| Script | Description |
|---|---|
| `npm run start` | Start Expo dev server |
| `npm run android` | Run on Android target |
| `npm run ios` | Run on iOS target |
| `npm run web` | Run on web target |
| `npm run test` | Run Jest test suite |
| `npm run lint` | Run lint checks |
| `npm run reset-project` | Reset starter scaffold helper |

---

## App Flow

1. App starts and hydrates the auth session
2. Logged-out users are kept on the authentication screen
3. Logged-in users are routed to tab navigation
4. Logging out from the Activity tab clears the session and returns to the auth flow

---

## Testing

```bash
npm run test
```

Current test coverage includes:

- Auth context hydration
- Login screen integration
- Tab layout rendering
- Activity logout integration
- Home screen rendering

---

## Troubleshooting

### Missing Supabase environment variables

- Verify `.env` exists in the project root
- Verify both `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` are present
- Restart the Expo server after any `.env` changes

### Step data not appearing

- Grant motion and fitness permissions on your device
- Simulators may not provide reliable pedometer data
- Use a physical device for accurate step tracking

### Auth works but profile data is missing

- Confirm the migration was successfully applied in Supabase
- Confirm RLS policies and the user-profile trigger exist

---

## Roadmap

- [ ] Replace profile mock chart with real metric queries
- [ ] Persist step goals per user account
- [ ] Add league standings and history screens
- [ ] Add end-to-end auth-to-tabs journey tests
