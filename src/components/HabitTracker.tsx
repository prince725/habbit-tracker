import { useState, type FormEvent } from "react";
import { formatDay } from "../dates";
import { addHabit, isHabitActive, removeHabit, renameHabit, setHabitDone, type Habit } from "../data";

interface Props {
  uid: string;
  habits: Habit[];
  days: string[];
  today: string;
  isDone: (habitId: string, day: string) => boolean;
}

export default function HabitTracker({ uid, habits, days, today, isDone }: Props) {
  const [name, setName] = useState("");

  // Show every habit that was active on at least one day this week (removed ones appear greyed out).
  const rows = habits.filter((h) => days.some((d) => isHabitActive(h, d)));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addHabit(uid, name.trim(), today);
    setName("");
  };

  const rename = (h: Habit) => {
    const next = prompt("Rename habit", h.name)?.trim();
    if (next && next !== h.name) renameHabit(uid, h.id, next);
  };

  const remove = (h: Habit) => {
    if (confirm(`Remove "${h.name}"? Past check-ins are kept.`)) removeHabit(uid, h, today);
  };

  return (
    <section className="card">
      <h2 className="section-title">Habit tracker</h2>
      <table className="habits">
        <colgroup>
          <col className="col-name" />
          {days.map((d) => (
            <col key={d} className="col-day" />
          ))}
          <col className="col-goal" />
        </colgroup>
        <thead>
          <tr>
            <th />
            {days.map((d) => (
              <th key={d} className={d === today ? "today" : ""} title={formatDay(d, { dateStyle: "medium" })}>
                {formatDay(d, { weekday: "narrow" })}
                <small>{formatDay(d, { day: "numeric" })}</small>
              </th>
            ))}
            <th className="goal">Week</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((h) => {
            const activeDays = days.filter((d) => d <= today && isHabitActive(h, d));
            const doneCount = activeDays.filter((d) => isDone(h.id, d)).length;
            const removed = !isHabitActive(h, today);
            return (
              <tr key={h.id} className={removed ? "removed" : ""}>
                <td className="name">
                  <button className="link" onClick={() => rename(h)} title={`${h.name} — click to rename`}>
                    {h.name}
                  </button>
                  {!removed && (
                    <button className="icon" onClick={() => remove(h)} title="Remove habit" aria-label="Remove habit">
                      ×
                    </button>
                  )}
                </td>
                {days.map((d) => {
                  if (!isHabitActive(h, d)) return <td key={d} className="na">–</td>;
                  const done = isDone(h.id, d);
                  const future = d > today;
                  return (
                    <td key={d} className={d === today ? "today" : ""}>
                      <button
                        className={`dot ${done ? "on" : ""} ${!done && !future && d < today ? "missed" : ""}`}
                        disabled={future}
                        aria-pressed={done}
                        aria-label={`${h.name} on ${d}`}
                        onClick={() => setHabitDone(uid, h.id, d, !done)}
                      />
                    </td>
                  );
                })}
                <td className="goal">
                  {doneCount}/{activeDays.length}
                </td>
              </tr>
            );
          })}
          {rows.length === 0 && (
            <tr>
              <td colSpan={9} className="muted empty">
                No habits yet — add your first one below.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <form className="add" onSubmit={submit}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="New daily habit, e.g. Gym + exercise" />
        <button className="btn primary">Add</button>
      </form>
    </section>
  );
}
