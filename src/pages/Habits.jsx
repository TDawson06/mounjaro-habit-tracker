import React from "react";
import { Card, Button, Input } from "../components/ui.jsx";
import { TogglePill } from "../components/TogglePill.jsx";
import { todayISO, getWeekDates, startOfWeekISO, formatShortDay, formatShortDate } from "../lib/dates.js";
import { uid } from "../lib/storage.js";

export function Habits({ data, setData }) {
  const [weekOffset, setWeekOffset] = React.useState(0);
  const [newName, setNewName] = React.useState("");
  const [newTarget, setNewTarget] = React.useState(5);

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

  const toggleCheck = (dateISO, habitId) => {
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

  const addHabit = () => {
    const name = newName.trim();
    if (!name) return;
    setData((prev) => ({
      ...prev,
      habits: [...prev.habits, { id: uid(), name, targetDaysPerWeek: Math.max(1, Math.min(7, Number(newTarget) || 1)) }],
    }));
    setNewName("");
    setNewTarget(5);
  };

  const completionForHabit = (habitId) => {
    let done = 0;
    weekDates.forEach((d) => {
      if (habitChecks[d]?.[habitId]) done++;
    });
    const target = habits.find((h) => h.id === habitId)?.targetDaysPerWeek ?? 7;
    return { done, target };
  };

  return (
    <div className="space-y-4">
      <Card title="Weekly Habit Tracker">
        <div className="mb-3 flex items-center justify-between">
          <Button variant="secondary" onClick={() => setWeekOffset((o) => o - 1)}>
            ← Previous
          </Button>
          <span className="text-sm font-medium text-gray-700">
            {formatShortDate(weekDates[0])} – {formatShortDate(weekDates[6])}
          </span>
          <Button variant="secondary" onClick={() => setWeekOffset((o) => o + 1)}>
            Next →
          </Button>
        </div>
        {isThisWeek && (
          <button
            type="button"
            onClick={() => setWeekOffset(0)}
            className="mb-3 text-sm text-emerald-600 hover:underline"
          >
            This week
          </button>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[400px] border-collapse text-sm">
            <thead>
              <tr>
                <th className="border-b border-gray-200 py-2 text-left font-medium text-gray-600">Habit</th>
                {weekDates.map((d) => (
                  <th key={d} className="border-b border-gray-200 py-2 text-center font-medium text-gray-600">
                    <div>{formatShortDay(d)}</div>
                    <div className="text-xs text-gray-400">{formatShortDate(d)}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {habits.map((h) => {
                const { done, target } = completionForHabit(h.id);
                return (
                  <tr key={h.id} className="border-b border-gray-100">
                    <td className="py-2">
                      <div className="font-medium text-gray-800">{h.name}</div>
                      <div className="text-xs text-gray-500">
                        {done}/{target}
                      </div>
                    </td>
                    {weekDates.map((d) => (
                      <td key={d} className="py-2 text-center">
                        <div className="flex justify-center">
                          <TogglePill
                            size="sm"
                            checked={!!habitChecks[d]?.[h.id]}
                            onClick={() => toggleCheck(d, h.id)}
                          />
                        </div>
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {habits.length === 0 && (
          <p className="py-4 text-center text-sm text-gray-500">Add a habit below to start tracking.</p>
        )}
      </Card>

      <Card title="Add Habit">
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
            <Input
              placeholder="e.g. Morning walk"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addHabit()}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Target days per week (1–7)</label>
            <Input
              type="number"
              min={1}
              max={7}
              value={newTarget}
              onChange={(e) => setNewTarget(e.target.value)}
            />
          </div>
          <Button onClick={addHabit}>Add habit</Button>
        </div>
      </Card>
    </div>
  );
}
