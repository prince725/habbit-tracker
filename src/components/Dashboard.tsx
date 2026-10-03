import { useCallback, useState } from "react";
import { signOut, type User } from "firebase/auth";
import { auth } from "../firebase";
import { addDays, formatDay, startOfWeek, useToday, weekDays } from "../dates";
import { isHabitActive, useHabitLogs, useHabits, useTasks } from "../data";
import Stats from "./Stats";
import WeekFocus from "./WeekFocus";
import HabitTracker from "./HabitTracker";
import TaskList from "./TaskList";

export default function Dashboard({ user }: { user: User }) {
  const uid = user.uid;
  const today = useToday();
  const yesterday = addDays(today, -1);
  const monday = startOfWeek(today);
  const days = weekDays(today);

  const [error, setError] = useState<Error | null>(null);
  const onError = useCallback((e: Error) => {
    console.error(e);
    setError(e);
  }, []);

  // On Mondays "yesterday" is last Sunday, so load logs from whichever is earlier.
  const habits = useHabits(uid, onError);
  const logs = useHabitLogs(uid, yesterday < monday ? yesterday : monday, onError);
  const tasks = useTasks(uid, monday, onError);

  if (error)
    return (
      <div className="center">
        <div className="login card">
          <h2>Couldn't load your planner</h2>
          <p className="error">{error.message}</p>
          {error.message.includes("permission") && (
            <p className="muted">Publish the Firestore security rules (Firestore → Rules) and reload.</p>
          )}
          <button className="btn ghost" onClick={() => signOut(auth)}>
            Sign out
          </button>
        </div>
      </div>
    );
  if (!habits || !tasks) return <div className="center muted">Loading your planner…</div>;

  const isDone = (habitId: string, day: string) => !!logs[day]?.[habitId];

  const todayHabits = habits.filter((h) => isHabitActive(h, today));
  const habitsDoneToday = todayHabits.filter((h) => isDone(h.id, today)).length;
  const missedYesterday = habits.filter((h) => isHabitActive(h, yesterday) && !isDone(h.id, yesterday));

  let possible = 0;
  let completed = 0;
  for (const day of days.filter((d) => d <= today)) {
    for (const h of habits) {
      if (!isHabitActive(h, day)) continue;
      possible++;
      if (isDone(h.id, day)) completed++;
    }
  }

  const openTasks = tasks.filter((t) => !t.done);
  const tasksDoneToday = tasks.filter((t) => t.done && t.doneDate === today);
  const tasksDoneThisWeek = tasks.filter((t) => t.done && t.doneDate! >= monday).length;

  return (
    <div className="page">
      <header className="topbar">
        <div>
          <h1 className="script">Weekly planner</h1>
          <div className="muted">
            Week of {formatDay(monday, { day: "numeric", month: "long", year: "numeric" })} · Today is{" "}
            {formatDay(today, { weekday: "long", day: "numeric", month: "short" })}
          </div>
        </div>
        <div className="user">
          {user.photoURL && <img src={user.photoURL} alt="" referrerPolicy="no-referrer" />}
          <button className="btn ghost" onClick={() => signOut(auth)}>
            Sign out
          </button>
        </div>
      </header>

      <Stats
        habitsDone={habitsDoneToday}
        habitsTotal={todayHabits.length}
        missedYesterday={missedYesterday.map((h) => h.name)}
        weekCompleted={completed}
        weekPossible={possible}
        tasksLeft={openTasks.length}
        tasksDoneToday={tasksDoneToday.length}
        tasksDoneThisWeek={tasksDoneThisWeek}
      />

      <WeekFocus uid={uid} monday={monday} onError={onError} />

      <div className="grid">
        <HabitTracker uid={uid} habits={habits} days={days} today={today} isDone={isDone} />
        <TaskList uid={uid} today={today} open={openTasks} doneToday={tasksDoneToday} />
      </div>
    </div>
  );
}
