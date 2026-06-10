# Firebase Setup

This GitHub Pages version uses Firebase Realtime Database through the REST API.

## 1. Create the database

Open:

- https://console.firebase.google.com/
- https://firebase.google.com/docs/database/rest/start

Create a project, then enable **Realtime Database**.

Your database URL will look like one of these:

- `https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com`
- `https://YOUR_PROJECT_ID.REGION.firebasedatabase.app`

## 2. Add the database URL

Open [app-config.js](/Library/WebServer/Documents/WC2026/app-config.js:1) and set:

```js
window.WC2026_CONFIG = {
  remoteStorage: {
    provider: "firebase-rest",
    firebaseDatabaseUrl: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
    firebaseAuth: "",
    firebaseStatePath: "wc2026/shared-state"
  }
};
```

## 3. Apply database rules

Use the rules from [firebase-rtdb.rules.json](/Library/WebServer/Documents/WC2026/firebase-rtdb.rules.json:1).

For this version, the app expects public read/write under `wc2026`.

## 4. Deploy again

Push the updated files to GitHub Pages.

Then open:

- `https://ahmed-zakaria77.github.io/Road-To-Glory-2026/`

If setup is correct, the top sync banner should turn green.

## Notes

- This is the fastest setup for a static GitHub Pages site.
- Public rules are simple but not highly secure.
- Later, we can harden it with Firebase Auth or move writes behind a serverless function.
