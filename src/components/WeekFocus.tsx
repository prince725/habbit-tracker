import { useEffect, useState } from "react";
import { saveWeekFocus, useWeekFocus, type OnError } from "../data";

export default function WeekFocus({ uid, monday, onError }: { uid: string; monday: string; onError: OnError }) {
  const saved = useWeekFocus(uid, monday, onError);
  const [draft, setDraft] = useState(saved);
  useEffect(() => setDraft(saved), [saved]);

  return (
    <label className="focus card">
      <span className="label">Focus of the week</span>
      <input
        value={draft}
        placeholder="e.g. Get fit 💪"
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => draft !== saved && saveWeekFocus(uid, monday, draft.trim())}
        onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
      />
    </label>
  );
}
