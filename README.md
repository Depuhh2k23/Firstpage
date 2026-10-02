# GATE CSE 2027 AI Study Mentor

Firebase-enabled study and performance tracker for GATE CSE 2027.

## Features

- Google authentication
- Firestore-backed cross-device progress
- Automatic first-login migration from localStorage
- Daily study blocks and completion tracking
- Practice accuracy and subject analytics
- Error log with error categories
- Mock-test tracker
- 19-week GATE roadmap
- Local AI-style mentor recommendations
- Responsive GitHub Pages UI

## Firebase setup

1. In Firebase Console, enable **Authentication → Google**.
2. Create/enable a **Cloud Firestore** database.
3. Add the GitHub Pages domain under Authentication → Settings → Authorized domains if Firebase requires it.
4. Publish the rules in `firestore.rules`.
5. The Web App config is embedded in `app.js`. Firebase web config identifiers are intended for client-side use; Firestore Security Rules provide the data-access protection.

The app stores each user's state at `users/{uid}/state/main`.

Only the authenticated owner can read or write that path under the supplied rules.

## Hosting

The repository remains static and GitHub Pages-compatible. No Node build step is required.
