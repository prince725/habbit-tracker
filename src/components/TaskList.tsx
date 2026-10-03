import { useState, type FormEvent } from "react";
import { formatDay } from "../dates";
import { addTask, deleteTask, setTaskDone, setTaskImportant, type Task } from "../data";

interface Props {
  uid: string;
  today: string;
  open: Task[];
  doneToday: Task[];
}

const byPriority = (a: Task, b: Task) => Number(b.important) - Number(a.important) || a.createdAt - b.createdAt;

export default function TaskList({ uid, today, open, doneToday }: Props) {
  const [title, setTitle] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addTask(uid, title.trim(), today);
    setTitle("");
  };

  const row = (t: Task) => (
    <li key={t.id} className={t.done ? "done" : ""}>
      <input
        type="checkbox"
        checked={t.done}
        onChange={() => setTaskDone(uid, t.id, !t.done, today)}
        aria-label={`Mark "${t.title}" ${t.done ? "not done" : "done"}`}
      />
      <span className="title">{t.title}</span>
      {!t.done && t.createdDate < today && (
        <span className="tag" title="Carried over from an earlier day">
          since {formatDay(t.createdDate, { weekday: "short", day: "numeric" })}
        </span>
      )}
      {!t.done && (
        <button
          className={`icon flag ${t.important ? "on" : ""}`}
          onClick={() => setTaskImportant(uid, t.id, !t.important)}
          title={t.important ? "Unmark priority" : "Mark as priority"}
          aria-label="Toggle priority"
        >
          !
        </button>
      )}
      <button className="icon" onClick={() => deleteTask(uid, t.id)} title="Delete task" aria-label="Delete task">
        ×
      </button>
    </li>
  );

  return (
    <section className="card">
      <h2 className="section-title">
        Work tasks · {formatDay(today, { weekday: "long" })}
      </h2>
      <p className="muted hint">Unfinished tasks carry over to tomorrow. Completed ones disappear after today.</p>
      <ul className="tasks">
        {[...open].sort(byPriority).map(row)}
        {open.length === 0 && <li className="muted empty">Nothing pending. Add a task below.</li>}
      </ul>
      <form className="add" onSubmit={submit}>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Add a work task…" />
        <button className="btn primary">Add</button>
      </form>
      {doneToday.length > 0 && (
        <>
          <h3 className="label done-title">Completed today ({doneToday.length})</h3>
          <ul className="tasks">{[...doneToday].sort(byPriority).map(row)}</ul>
        </>
      )}
    </section>
  );
}
