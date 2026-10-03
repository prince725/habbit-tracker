interface Props {
  habitsDone: number;
  habitsTotal: number;
  missedYesterday: string[];
  weekCompleted: number;
  weekPossible: number;
  tasksLeft: number;
  tasksDoneToday: number;
  tasksDoneThisWeek: number;
}

export default function Stats(p: Props) {
  const habitsLeft = p.habitsTotal - p.habitsDone;
  const weekPct = p.weekPossible ? Math.round((p.weekCompleted / p.weekPossible) * 100) : 0;

  return (
    <section className="stats">
      <div className="stat">
        <div className="label">Habits done today</div>
        <div className="value">
          {p.habitsDone}
          <span className="of">/{p.habitsTotal}</span>
        </div>
        <div className="sub">{habitsLeft === 0 && p.habitsTotal > 0 ? "All done 🎉" : `${habitsLeft} left`}</div>
      </div>

      <div className="stat">
        <div className="label">Missed yesterday</div>
        <div className={`value ${p.missedYesterday.length ? "bad" : "good"}`}>{p.missedYesterday.length}</div>
        <div className="sub" title={p.missedYesterday.join(", ")}>
          {p.missedYesterday.length ? p.missedYesterday.join(", ") : "Clean sweep"}
        </div>
      </div>

      <div className="stat">
        <div className="label">Week score</div>
        <div className="value">
          {weekPct}
          <span className="of">%</span>
        </div>
        <div className="meter">
          <div style={{ width: `${weekPct}%` }} />
        </div>
        <div className="sub">
          {p.weekCompleted} of {p.weekPossible} habit check-ins
        </div>
      </div>

      <div className="stat">
        <div className="label">Work tasks left</div>
        <div className="value">{p.tasksLeft}</div>
        <div className="sub">
          {p.tasksDoneToday} done today · {p.tasksDoneThisWeek} this week
        </div>
      </div>
    </section>
  );
}
