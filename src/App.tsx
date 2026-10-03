import { useEffect, useState } from "react";
import { onAuthStateChanged, signInWithPopup, type User } from "firebase/auth";
import { auth, googleProvider } from "./firebase";
import Dashboard from "./components/Dashboard";

export default function App() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [error, setError] = useState("");

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  if (user === undefined) return <div className="center muted">Loading…</div>;
  if (user) return <Dashboard user={user} />;

  const login = async () => {
    setError("");
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <div className="center">
      <div className="login card">
        <h1 className="script">Weekly planner</h1>
        <p className="muted">Daily habits, work tasks and your weekly score — all in one place.</p>
        <button className="btn primary" onClick={login}>
          Continue with Google
        </button>
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
}
