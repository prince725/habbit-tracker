# Habit Tracker — Weekly Planner

A web version of a paper weekly planner:

- **Daily habits** – the same list every day. Tick them off in a Mon–Sun grid; add, rename (click the name) or remove them. Removing a habit only stops it from today onward, so past weeks keep their history.
- **Work tasks** – one-off tasks. Unfinished tasks carry over to the next day (tagged with the day they were added). A task completed today shows under "Completed today" and is gone tomorrow. Mark priorities with `!`.
- **Stats** – habits done / left today, habits missed yesterday, this week's score (habit check-ins done ÷ possible so far), and work tasks left / done.
- **Focus of the week** – one line per week.
- **Google login** – each user only sees their own data (enforced by Firestore rules).

Stack: React + Vite + TypeScript, Firebase Auth (Google) and Cloud Firestore. All on Firebase's free **Spark** plan — no credit card needed.

## 1. Create the Firebase project (one time)

1. Go to <https://console.firebase.google.com> → **Add project** (you can turn Google Analytics off).
2. **Build → Authentication → Get started → Sign-in method → Google → Enable**, pick a support email, save.
3. **Build → Firestore Database → Create database** → choose a location near you → start in **production mode**.
4. **Project settings (gear) → General → Your apps → Web (`</>`)** → register the app (no hosting checkbox needed). Copy the `firebaseConfig` values.

## 2. Run locally

```bash
cp .env.example .env.local   # paste the firebaseConfig values in here
npm install
npm run dev                  # http://localhost:5173
```

`localhost` is already an authorized domain for Google sign-in.

## 3. Deploy for free (Firebase Hosting)

```bash
npm install -g firebase-tools
firebase login
firebase use --add            # pick your project
npm run deploy                # builds, deploys the site + firestore.rules
```

Your app will be live at `https://<project-id>.web.app`. That domain is authorized for Google sign-in automatically.

> **Important:** `npm run deploy` also publishes `firestore.rules`, which lock every user to their own data. If you deploy the site somewhere else, still run `firebase deploy --only firestore:rules` once.

### Automatic deploys (GitHub Actions)

`.github/workflows/deploy.yml` builds every push and PR. Pushes to `main` also deploy the site and `firestore.rules`.

The Firebase web config lives in `.env.production`. It's committed on purpose: these values ship in the public JS bundle anyway. The only secret is a deploy key, which you set up once:

1. Open the [Google Cloud service accounts page](https://console.cloud.google.com/iam-admin/serviceaccounts?project=habbit-tracker-55e83) and click **Create service account** (name it e.g. `github-deploy`).
2. Grant it the **Firebase Admin** role, then click **Done**.
3. Open the new account. Go to **Keys → Add key → Create new key → JSON**. A `.json` file downloads.
4. In GitHub, go to **repo → Settings → Secrets and variables → Actions → New repository secret**. Name it `FIREBASE_SERVICE_ACCOUNT` and paste the entire JSON file contents. Then delete the downloaded file.
5. Re-run the workflow from the **Actions** tab, or push to `main`.

### Alternative: Vercel / Netlify / Cloudflare Pages

Import the GitHub repo, set build command `npm run build`, output dir `dist`, and add the six `VITE_FIREBASE_*` env vars. Then add the deployed domain under **Firebase → Authentication → Settings → Authorized domains**.

## Data model

Everything is stored under `users/{uid}/` in Firestore:

| Collection | Doc | Purpose |
|---|---|---|
| `habits` | auto id | `name`, `startDate`, `endDate` (null while active) |
| `habitLogs` | `YYYY-MM-DD` | `done: { habitId: true }` for that day |
| `tasks` | auto id | `title`, `createdDate`, `done`, `doneDate`, `important` |
| `weeks` | Monday's date | `focus` |

Dates are the user's local calendar day; weeks run Monday → Sunday.
