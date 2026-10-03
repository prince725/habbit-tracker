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

## Data model

Everything is stored under `users/{uid}/` in Firestore:

| Collection | Doc | Purpose |
|---|---|---|
| `habits` | auto id | `name`, `startDate`, `endDate` (null while active) |
| `habitLogs` | `YYYY-MM-DD` | `done: { habitId: true }` for that day |
| `tasks` | auto id | `title`, `createdDate`, `done`, `doneDate`, `important` |
| `weeks` | Monday's date | `focus` |

Dates are the user's local calendar day; weeks run Monday → Sunday.
