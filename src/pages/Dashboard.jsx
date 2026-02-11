import React from "react";
import { Card } from "../components/ui.jsx";
import { TogglePill } from "../components/TogglePill.jsx";
import { todayISO, getWeekDates, formatShortDate } from "../lib/dates.js";
import {
  getLatestWeight,
  getWeightChange,
  getNextMilestones,
  kgToGo,
  mergeMilestones,
  generateMilestoneBands,
  getHabitStreak,
} from "../lib/progress.js";

export function Dashboard({ data, setData }) {
  const today = todayISO();
  const habits = data.habits || [];
  const habitChecks = data.habitChecks || {};
  const weightLogs = data.weightLogs || [];
  const customMilestones = data.milestones || [];
  const latestLog = getLatestWeight(weightLogs);
  const currentWeight = latestLog?.weightKg ?? null;
  const change = getWeightChange(weightLogs);

  const weekDates = getWeekDates(today);
  const totalPossible = habits.length * weekDates.filter((d) => d <= today).length;
  let totalChecks = 0;
  weekDates.forEach((d) => {
    if (d > today) return;
    const dayChecks = habitChecks[d] || {};
    habits.forEach((h) => {
      if (dayChecks[h.id]) totalChecks++;
    });
  });

  const bandMilestones = currentWeight != null ? generateMilestoneBands(Math.ceil(currentWeight / 2) * 2, 93, 2) : [];
  const merged = mergeMilestones(customMilestones, bandMilestones);
  const nextThree = getNextMilestones(currentWeight, merged, 3);

  const toggleCheck = (habitId) => {
    setData((prev) => {
      const next = { ...prev, habitChecks: { ...prev.habitChecks } };
      if (!next.habitChecks[today]) next.habitChecks[today] = {};
      const day = { ...next.habitChecks[today] };
      if (day[habitId]) delete day[habitId];
      else day[habitId] = true;
      next.habitChecks[today] = day;
      return next;
    });
  };

  const streaks = habits
    .map((h) => ({ habit: h, streak: getHabitStreak(habitChecks, h.id, today) }))
    .filter((s) => s.streak > 0)
    .sort((a, b) => b.streak - a.streak)
    .slice(0, 3);

  return (
    <div className="space-y-4">
      <Card title="Today" subtitle={formatShortDate(today)}>
        <div className="flex flex-wrap gap-2">
          {habits.length === 0 ? (
            <p className="text-sm text-gray-500">Add habits on the Habits tab.</p>
          ) : (
            habits.map((h) => (
              <TogglePill
                key={h.id}
                checked={!!habitChecks[today]?.[h.id]}
                onClick={() => toggleCheck(h.id)}
                label={h.name}
                size="md"
              />
            ))
          )}
        </div>
      </Card>

      <Card title="Weight" right={latestLog && <span className="text-gray-500">{formatShortDate(latestLog.date)}</span>}>
        {currentWeight != null ? (
          <div>
            <p className="text-2xl font-bold text-gray-900">{currentWeight} kg</p>
            {change != null && (
              <p className={`text-sm ${change.diff <= 0 ? "text-emerald-600" : "text-gray-500"}`}>
                {change.diff < 0 ? `${Math.abs(change.diff)} kg down` : change.diff > 0 ? `+${change.diff} kg` : "No change"} from previous
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Log weight on the Weight tab.</p>
        )}
      </Card>

      <Card title="This week so far">
        <p className="text-lg font-semibold text-gray-900">
          {totalChecks} / {totalPossible} checks
        </p>
        {totalPossible > 0 && (
          <p className="text-sm text-gray-500">
            {Math.round((totalChecks / totalPossible) * 100)}% of possible so far
          </p>
        )}
      </Card>

      <Card title="Next milestones">
        {nextThree.length === 0 ? (
          <p className="text-sm text-gray-500">
            {currentWeight != null ? "You've reached the lowest target, or add more milestones." : "Log weight to see milestones."}
          </p>
        ) : (
          <ul className="space-y-2">
            {nextThree.map((m) => {
              const toGo = kgToGo(currentWeight, m.targetKg);
              const achieved = toGo === 0;
              return (
                <li key={m.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{m.label}</span>
                  <span className={achieved ? "font-medium text-emerald-600" : "text-gray-500"}>
                    {achieved ? "Achieved" : `${toGo} kg to go`}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {streaks.length > 0 && (
        <Card title="Streaks">
          <ul className="space-y-1 text-sm">
            {streaks.map(({ habit, streak }) => (
              <li key={habit.id} className="flex justify-between">
                <span className="text-gray-700">{habit.name}</span>
                <span className="font-medium text-emerald-600">{streak} day{streak !== 1 ? "s" : ""}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
