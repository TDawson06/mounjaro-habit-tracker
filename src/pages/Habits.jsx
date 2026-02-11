import React from "react";
import { Card, Button, Input } from "../components/ui.jsx";
import { TogglePill } from "../components/TogglePill.jsx";
import {
  todayISO,
  getWeekDates,
  startOfWeekISO,
  formatShortDay,
  formatShortDate,
  getDayOfWeekMonFirst,
} from "../lib/dates.js";
import { uid } from "../lib/storage.js";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_LABELS_SHORT = ["M", "T", "W", "T", "F", "S", "S"];

const EXAMPLE_HABIT = {
  id: "example",
  name: "Example habit",
  activeDays: [0, 1, 2, 3, 4, 5],
};

function getActiveDays(habit) {
  return habit.activeDays ?? [0, 1, 2, 3, 4, 5, 6];
}

function isHabitSkipDay(habit, dateISO) {
  const dayIndex = getDayOfWeekMonFirst(dateISO);
  return !getActiveDays(habit).includes(dayIndex);
}

export function Habits({ data, setData }) {
  const [weekOffset, setWeekOffset] = React.useState(0);
  const [newName, setNewName] = React.useState("");
  const [newActiveDays, setNewActiveDays] = React.useState([0, 1, 2, 3, 4, 5, 6]);
  const [newSkipDate, setNewSkipDate] = React.useState("");
  const [openMenuHabitId, setOpenMenuHabitId] = React.useState(null);

  React.useEffect(() => {
    if (openMenuHabitId == null) return;
    const close = () => setOpenMenuHabitId(null);
    const handle = (e) => {
      if (!e.target.closest("[data-habit-menu]")) close();
    };
    document.addEventListener("mousedown", handle);
    document.addEventListener("touchstart", handle);
    return () => {
      document.removeEventListener("mousedown", handle);
      document.removeEventListener("touchstart", handle);
    };
  }, [openMenuHabitId]);

  const today = todayISO();
  const refDate = (() => {
    const d = new Date(today + "T12:00:00");
    d.setDate(d.getDate() + weekOffset * 7);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  })();
  const weekDates = getWeekDates(refDate);
  const isThisWeek = startOfWeekISO(refDate) === startOfWeekISO(today);

  const habits = data.habits || [];
  const habitChecks = data.habitChecks || {};
  const skipDates = data.skipDates || {};
  const activeHabits = habits.filter((h) => !h.discontinued);
  const discontinuedHabits = habits.filter((h) => h.discontinued);
  const displayHabits = activeHabits.length === 0 ? [EXAMPLE_HABIT] : activeHabits;
  const isExample = activeHabits.length === 0;

  const isAdHocSkipDate = (dateISO) => !!skipDates[dateISO];

  const toggleCheck = (dateISO, habitId) => {
    if (habitId === "example") return;
    setData((prev) => {
      const next = { ...prev, habitChecks: { ...prev.habitChecks } };
      if (!next.habitChecks[dateISO]) next.habitChecks[dateISO] = {};
      const day = { ...next.habitChecks[dateISO] };
      if (day[habitId]) delete day[habitId];
      else day[habitId] = true;
      next.habitChecks[dateISO] = day;
      return next;
    });
  };

  const toggleActiveDay = (dayIndex) => {
    setNewActiveDays((prev) =>
      prev.includes(dayIndex) ? prev.filter((d) => d !== dayIndex) : [...prev, dayIndex].sort((a, b) => a - b)
    );
  };

  const addHabit = () => {
    const name = newName.trim();
    if (!name) return;
    const activeDays = newActiveDays.length === 0 ? [0, 1, 2, 3, 4, 5, 6] : newActiveDays;
    setData((prev) => ({
      ...prev,
      habits: [...prev.habits, { id: uid(), name, activeDays }],
    }));
    setNewName("");
    setNewActiveDays([0, 1, 2, 3, 4, 5, 6]);
  };

  const setDiscontinued = (habitId, discontinued) => {
    setData((prev) => ({
      ...prev,
      habits: prev.habits.map((h) => (h.id === habitId ? { ...h, discontinued } : h)),
    }));
  };

  const deleteHabit = (habitId) => {
    setData((prev) => {
      const newChecks = {};
      Object.entries(prev.habitChecks || {}).forEach(([dateISO, day]) => {
        if (!day[habitId]) {
          newChecks[dateISO] = day;
        } else {
          const dayCopy = { ...day };
          delete dayCopy[habitId];
          if (Object.keys(dayCopy).length > 0) newChecks[dateISO] = dayCopy;
        }
      });
      return {
        ...prev,
        habits: prev.habits.filter((h) => h.id !== habitId),
        habitChecks: newChecks,
      };
    });
  };

  const completionForHabit = (habit) => {
    const activeDays = getActiveDays(habit);
    let done = 0;
    let possible = 0;
    weekDates.forEach((d) => {
      const dayIndex = getDayOfWeekMonFirst(d);
      const habitActive = activeDays.includes(dayIndex);
      const notAdHocSkip = !isAdHocSkipDate(d);
      if (habitActive && notAdHocSkip) {
        possible++;
        if (habitChecks[d]?.[habit.id]) done++;
      }
    });
    return { done, target: possible };
  };

  const exampleChecked = (dateISO) => {
    const dayIndex = getDayOfWeekMonFirst(dateISO);
    if (dayIndex === 5) return false;
    return dayIndex < 5;
  };

  const addSkipDate = () => {
    const d = newSkipDate.trim();
    if (!d) return;
    setData((prev) => ({ ...prev, skipDates: { ...prev.skipDates, [d]: true } }));
    setNewSkipDate("");
  };

  const removeSkipDate = (dateISO) => {
    setData((prev) => {
      const next = { ...prev.skipDates };
      delete next[dateISO];
      return { ...prev, skipDates: next };
    });
  };

  const sortedSkipDates = Object.keys(skipDates).filter(Boolean).sort();

  const renderDayCell = (h, d) => {
    const adHocSkip = isAdHocSkipDate(d);
    const habitSkip = isHabitSkipDay(h, d);
    const skip = adHocSkip || habitSkip;
    if (skip) {
      return (
        <span
          key={d}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-dashed border-zinc-200 bg-zinc-50/80 text-zinc-400 md:h-7 md:w-7"
          title={adHocSkip ? "Skip day (special occasion)" : "Skip day"}
        >
          <span className="text-xs">—</span>
        </span>
      );
    }
    if (h.id === "example") {
      const checked = exampleChecked(d);
      return (
        <span
          key={d}
          className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs md:h-7 md:w-7 ${
            checked ? "border-emerald-400 bg-emerald-100 text-emerald-700" : "border-zinc-200 bg-white text-zinc-500"
          }`}
        >
          {checked ? "✓" : "—"}
        </span>
      );
    }
    return (
      <div key={d} className="flex shrink-0 justify-center">
        <TogglePill
          size="sm"
          checked={!!habitChecks[d]?.[h.id]}
          onClick={() => toggleCheck(d, h.id)}
        />
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <Card title="Weekly Habit Tracker">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <Button variant="secondary" onClick={() => setWeekOffset((o) => o - 1)} className="shrink-0">
            ← Prev
          </Button>
          <span className="text-center text-sm font-medium text-zinc-700">
            {formatShortDate(weekDates[0])} – {formatShortDate(weekDates[6])}
          </span>
          <Button variant="secondary" onClick={() => setWeekOffset((o) => o + 1)} className="shrink-0">
            Next →
          </Button>
        </div>
        {isThisWeek && (
          <button
            type="button"
            onClick={() => setWeekOffset(0)}
            className="mb-3 block text-sm text-emerald-600 hover:underline"
          >
            This week
          </button>
        )}

        {/* Mobile: card per habit, 7-day row */}
        <div className="space-y-3 md:hidden">
          {displayHabits.map((h) => {
            const { done, target } = completionForHabit(h);
            const menuOpen = openMenuHabitId === h.id;
            return (
              <div
                key={h.id}
                className={`relative rounded-2xl bg-white/90 p-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)] ${isExample && h.id === "example" ? "bg-zinc-50/80" : ""}`}
              >
                <div className="mb-2 flex items-center justify-between gap-2" data-habit-menu>
                  <span className="min-w-0 flex-1 font-medium text-zinc-800">{h.name}</span>
                  <span className="shrink-0 text-xs text-zinc-500">
                    {done}/{target}
                    {isExample && h.id === "example" && " (example)"}
                  </span>
                  {h.id !== "example" && (
                    <>
                      <button
                        type="button"
                        onClick={() => setOpenMenuHabitId(menuOpen ? null : h.id)}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100"
                        aria-label="Habit options"
                        aria-expanded={menuOpen}
                      >
                        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
                          <circle cx="12" cy="6" r="1.5" />
                          <circle cx="12" cy="12" r="1.5" />
                          <circle cx="12" cy="18" r="1.5" />
                        </svg>
                      </button>
                      {menuOpen && (
                        <div className="absolute right-0 top-full z-10 mt-1 min-w-[160px] rounded-xl border border-zinc-100 bg-white py-1 shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
                          <button
                            type="button"
                            onClick={() => {
                              setDiscontinued(h.id, true);
                              setOpenMenuHabitId(null);
                            }}
                            className="w-full px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-50"
                          >
                            Discontinue
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              deleteHabit(h.id);
                              setOpenMenuHabitId(null);
                            }}
                            className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
                <div className="flex justify-between gap-1">
                  {weekDates.map((d) => renderDayCell(h, d))}
                </div>
                <div className="mt-1 flex justify-between text-[10px] text-zinc-400">
                  {DAY_LABELS_SHORT.map((l) => (
                    <span key={l} className="w-8 shrink-0 text-center md:w-7">
                      {l}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop: table - expands with content, no internal scroll */}
        <div className="hidden md:block">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="border-b border-zinc-100 py-2 text-left text-xs font-medium text-zinc-600">Habit</th>
                {weekDates.map((d) => (
                  <th key={d} className="border-b border-zinc-100 py-2 text-center text-xs font-medium text-zinc-600">
                    <div>{formatShortDay(d)}</div>
                    <div className="text-xs text-zinc-400">{formatShortDate(d)}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayHabits.map((h) => {
                const { done, target } = completionForHabit(h);
                return (
                  <tr
                    key={h.id}
                    className={`border-b border-zinc-100 ${isExample && h.id === "example" ? "bg-zinc-50/50" : ""}`}
                  >
                    <td className="relative py-2" data-habit-menu>
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="font-medium text-zinc-800">{h.name}</div>
                          <div className="text-xs text-zinc-500">
                            {done}/{target}
                            {isExample && h.id === "example" && (
                              <span className="ml-1 text-zinc-400">(example – add a habit below)</span>
                            )}
                          </div>
                        </div>
                        {h.id !== "example" && (
                          <>
                            <button
                              type="button"
                              onClick={() => setOpenMenuHabitId(openMenuHabitId === h.id ? null : h.id)}
                              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100"
                              aria-label="Habit options"
                              aria-expanded={openMenuHabitId === h.id}
                            >
                              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
                                <circle cx="12" cy="6" r="1.5" />
                                <circle cx="12" cy="12" r="1.5" />
                                <circle cx="12" cy="18" r="1.5" />
                              </svg>
                            </button>
                            {openMenuHabitId === h.id && (
                              <div className="absolute right-0 top-full z-10 mt-1 min-w-[160px] rounded-xl border border-zinc-100 bg-white py-1 shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setDiscontinued(h.id, true);
                                    setOpenMenuHabitId(null);
                                  }}
                                  className="w-full px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-50"
                                >
                                  Discontinue
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    deleteHabit(h.id);
                                    setOpenMenuHabitId(null);
                                  }}
                                  className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                    {weekDates.map((d) => (
                      <td key={d} className="py-2 text-center">
                        {renderDayCell(h, d)}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {discontinuedHabits.length > 0 && (
        <Card title="Discontinued habits">
          <p className="mb-2 text-sm text-zinc-500">Stopped tracking these. Past data is kept. Tap ⋮ for options.</p>
          <ul className="space-y-2">
            {discontinuedHabits.map((h) => {
              const menuOpen = openMenuHabitId === h.id;
              return (
                <li
                  key={h.id}
                  className="relative flex items-center justify-between gap-2 rounded-xl bg-zinc-50/80 px-3 py-2"
                  data-habit-menu
                >
                  <span className="text-zinc-700">{h.name}</span>
                  <button
                    type="button"
                    onClick={() => setOpenMenuHabitId(menuOpen ? null : h.id)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-200"
                    aria-label="Habit options"
                    aria-expanded={menuOpen}
                  >
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
                      <circle cx="12" cy="6" r="1.5" />
                      <circle cx="12" cy="12" r="1.5" />
                      <circle cx="12" cy="18" r="1.5" />
                    </svg>
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 top-full z-10 mt-1 min-w-[160px] rounded-xl border border-zinc-100 bg-white py-1 shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
                      <button
                        type="button"
                        onClick={() => {
                          setDiscontinued(h.id, false);
                          setOpenMenuHabitId(null);
                        }}
                        className="w-full px-3 py-2 text-left text-sm font-medium text-emerald-600 hover:bg-emerald-50"
                      >
                        Reactivate
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          deleteHabit(h.id);
                          setOpenMenuHabitId(null);
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      <Card title="Add Habit">
        {activeHabits.length === 0 && habits.length === 0 && (
          <p className="mb-3 text-sm text-zinc-600">Add your first habit below – the example row will disappear.</p>
        )}
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">Name</label>
            <Input
              placeholder="e.g. No alcohol"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addHabit()}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700">Active days (uncheck = skip day)</label>
            <div className="flex flex-wrap gap-2">
              {DAY_LABELS.map((label, i) => (
                <label
                  key={i}
                  className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-sm sm:px-3 ${
                    newActiveDays.includes(i) ? "border-emerald-400 bg-emerald-50/80 text-emerald-700" : "border-zinc-200 bg-zinc-50/80 text-zinc-500"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={newActiveDays.includes(i)}
                    onChange={() => toggleActiveDay(i)}
                    className="h-3.5 w-3.5 rounded border-zinc-300 text-emerald-500 focus:ring-emerald-400"
                  />
                  {label}
                </label>
              ))}
            </div>
            <p className="mt-1.5 text-xs text-zinc-500">Unchecked days show as skip (—) and don’t count.</p>
          </div>
          <Button onClick={addHabit}>Add habit</Button>
        </div>
      </Card>

      <Card title="Skip days (special occasions)">
        <p className="mb-2 text-sm text-zinc-600">
          Add a date when you’re not tracking (e.g. holiday, celebration). All habits show as skip for that day.
        </p>
        <div className="flex flex-wrap gap-2">
          <Input
            type="date"
            value={newSkipDate}
            onChange={(e) => setNewSkipDate(e.target.value)}
            className="max-w-[160px]"
          />
          <Button variant="secondary" onClick={addSkipDate}>
            Add skip day
          </Button>
        </div>
        {sortedSkipDates.length > 0 && (
          <ul className="mt-3 space-y-1.5">
            {sortedSkipDates.map((dateISO) => (
              <li key={dateISO} className="flex items-center justify-between rounded-xl bg-zinc-50/80 px-3 py-2 text-sm">
                <span className="text-zinc-700">{formatShortDate(dateISO)}</span>
                <button
                  type="button"
                  onClick={() => removeSkipDate(dateISO)}
                  className="text-zinc-400 hover:text-red-500"
                  aria-label="Remove skip day"
                >
                  🗑
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
