import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  deleteField,
  doc,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase";

/**
 * Firestore layout (everything lives under users/{uid}):
 *   habits/{id}      – daily personal habit; active from startDate until endDate (exclusive)
 *   habitLogs/{date} – { date, done: { [habitId]: true } }
 *   tasks/{id}       – one-off work task; stays visible until done, then only on the day it was done
 *   weeks/{monday}   – { focus } "focus of the week"
 */

export interface Habit {
  id: string;
  name: string;
  startDate: string;
  endDate: string | null;
  createdAt: number;
}

export interface Task {
  id: string;
  title: string;
  createdDate: string;
  done: boolean;
  doneDate: string | null;
  important: boolean;
  createdAt: number;
}

/** date key -> set of completed habit ids */
export type HabitLogs = Record<string, Record<string, true>>;

/** Called when a live query fails (e.g. permission denied), so the UI can show it instead of hanging. */
export type OnError = (e: Error) => void;

const userCol = (uid: string, name: string) => collection(db, "users", uid, name);
const userDoc = (uid: string, name: string, id: string) => doc(db, "users", uid, name, id);

export const isHabitActive = (h: Habit, day: string) =>
  h.startDate <= day && (h.endDate === null || day < h.endDate);

// ---------- habits ----------

export function useHabits(uid: string, onError: OnError) {
  const [habits, setHabits] = useState<Habit[] | null>(null);
  useEffect(
    () =>
      onSnapshot(userCol(uid, "habits"), (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Habit);
        list.sort((a, b) => a.createdAt - b.createdAt);
        setHabits(list);
      }, onError),
    [uid, onError],
  );
  return habits;
}

export const addHabit = (uid: string, name: string, today: string) =>
  addDoc(userCol(uid, "habits"), {
    name,
    startDate: today,
    endDate: null,
    createdAt: Date.now(),
  });

/** Removing a habit ends it from today on, so past weeks' history and scores stay intact. */
export const removeHabit = (uid: string, habit: Habit, today: string) =>
  habit.startDate >= today
    ? deleteDoc(userDoc(uid, "habits", habit.id))
    : updateDoc(userDoc(uid, "habits", habit.id), { endDate: today });

export const renameHabit = (uid: string, id: string, name: string) =>
  updateDoc(userDoc(uid, "habits", id), { name });

// ---------- habit logs ----------

export function useHabitLogs(uid: string, fromDate: string, onError: OnError) {
  const [logs, setLogs] = useState<HabitLogs>({});
  useEffect(
    () =>
      onSnapshot(query(userCol(uid, "habitLogs"), where("date", ">=", fromDate)), (snap) => {
        const next: HabitLogs = {};
        snap.docs.forEach((d) => (next[d.id] = d.data().done ?? {}));
        setLogs(next);
      }, onError),
    [uid, fromDate, onError],
  );
  return logs;
}

export const setHabitDone = (uid: string, habitId: string, date: string, done: boolean) =>
  setDoc(
    userDoc(uid, "habitLogs", date),
    { date, done: { [habitId]: done ? true : deleteField() } },
    { merge: true },
  );

// ---------- work tasks ----------

/**
 * Open tasks plus anything completed on/after `doneSince` (for today's list and the week count).
 * Two single-field queries merged client-side, so no composite index is needed.
 */
export function useTasks(uid: string, doneSince: string, onError: OnError) {
  const [open, setOpen] = useState<Task[] | null>(null);
  const [done, setDone] = useState<Task[] | null>(null);
  useEffect(() => {
    const toTasks = (docs: { id: string; data: () => object }[]) =>
      docs.map((d) => ({ id: d.id, ...d.data() }) as Task);
    const unsubOpen = onSnapshot(
      query(userCol(uid, "tasks"), where("done", "==", false)),
      (snap) => setOpen(toTasks(snap.docs)),
      onError,
    );
    const unsubDone = onSnapshot(
      query(userCol(uid, "tasks"), where("doneDate", ">=", doneSince)),
      (snap) => setDone(toTasks(snap.docs)),
      onError,
    );
    return () => {
      unsubOpen();
      unsubDone();
    };
  }, [uid, doneSince, onError]);
  // Dedupe by id in case a task is mid-toggle and briefly matches both queries.
  return open && done ? [...new Map([...done, ...open].map((t) => [t.id, t])).values()] : null;
}

export const addTask = (uid: string, title: string, today: string) =>
  addDoc(userCol(uid, "tasks"), {
    title,
    createdDate: today,
    done: false,
    doneDate: null,
    important: false,
    createdAt: Date.now(),
  });

export const setTaskDone = (uid: string, id: string, done: boolean, today: string) =>
  updateDoc(userDoc(uid, "tasks", id), { done, doneDate: done ? today : null });

export const setTaskImportant = (uid: string, id: string, important: boolean) =>
  updateDoc(userDoc(uid, "tasks", id), { important });

export const deleteTask = (uid: string, id: string) => deleteDoc(userDoc(uid, "tasks", id));

// ---------- weekly focus ----------

export function useWeekFocus(uid: string, monday: string, onError: OnError) {
  const [focus, setFocus] = useState("");
  useEffect(
    () => onSnapshot(userDoc(uid, "weeks", monday), (snap) => setFocus(snap.data()?.focus ?? ""), onError),
    [uid, monday, onError],
  );
  return focus;
}

export const saveWeekFocus = (uid: string, monday: string, focus: string) =>
  setDoc(userDoc(uid, "weeks", monday), { focus }, { merge: true });
