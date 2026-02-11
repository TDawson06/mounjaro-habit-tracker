import React from "react";
import { Card } from "../components/ui.jsx";
import { TogglePill } from "../components/TogglePill.jsx";
import { todayISO, getWeekDates, formatShortDate, getDayOfWeekMonFirst } from "../lib/dates.js";
import {
  getLatestWeight,
  getWeightChange,
  getNextMilestones,
  kgToGo,
  getHabitStreak,
} from "../lib/progress.js";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getActiveDays(habit) {
  return habit.activeDays ?? [0, 1, 2, 3, 4, 5, 6];
}

function isActiveToday(habit) {
  const today = todayISO();
  const dayIndex = getDayOfWeekMonFirst(today);
  return getActiveDays(habit).includes(dayIndex);
}

export function Dashboard({ data, setData }) {
  const today = todayISO();
  const habits = data.habits || [];
  const activeHabits = habits.filter((h) => !h.discontinued);
  const habitChecks = data.habitChecks || {};
  const skipDates = data.skipDates || {};
  const weightLogs = data.weightLogs || [];
  const milestones = data.milestones || [];
  const latestLog = getLatestWeight(weightLogs);
  const currentWeight = latestLog?.weightKg ?? null;
  const change = getWeightChange(weightLogs);
  const weekDates = getWeekDates(today);
  const todayIsSkipDay = !!skipDates[today];

  const habitsActiveToday = todayIsSkipDay ? [] : activeHabits.filter(isActiveToday);

  const totalPossible = activeHabits.reduce((sum, h) => {
    const activeDays = getActiveDays(h);
    return (
      sum +
      weekDates.filter(
        (d) => d <= today && activeDays.includes(getDayOfWeekMonFirst(d)) && !skipDates[d]
      ).length
    );
  }, 0);
  let totalChecks = 0;
  weekDates.forEach((d) => {
    if (d > today || skipDates[d]) return;
    const dayChecks = habitChecks[d] || {};
    activeHabits.forEach((h) => {
      const dayIndex = getDayOfWeekMonFirst(d);
      if (getActiveDays(h).includes(dayIndex) && dayChecks[h.id]) totalChecks++;
    });
  });

  const checksPerDay = weekDates.map((dateISO) => {
    if (skipDates[dateISO]) return 0;
    let count = 0;
    const dayIndex = getDayOfWeekMonFirst(dateISO);
    activeHabits.forEach((h) => {
      if (getActiveDays(h).includes(dayIndex) && habitChecks[dateISO]?.[h.id]) count++;
    });
    return count;
  });
  const maxChecks = Math.max(1, ...checksPerDay, totalPossible);

  const nextThree = getNextMilestones(currentWeight, milestones, 3);

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

  const streaks = activeHabits
    .map((h) => ({ habit: h, streak: getHabitStreak(habitChecks, h.id, today) }))
    .filter((s) => s.streak > 0)
    .sort((a, b) => b.streak - a.streak)
    .slice(0, 3);

  const chartHeight = 80;
  const chartWidth = 200;
  const chartPadding = { top: 4, right: 8, bottom: 20, left: 8 };
  const innerHeight = chartHeight - chartPadding.top - chartPadding.bottom;
  const innerWidth = chartWidth - chartPadding.left - chartPadding.right;
  const points = checksPerDay.map((val, i) => {
    const x = chartPadding.left + (i / (checksPerDay.length - 1 || 1)) * innerWidth;
    const y = chartPadding.top + innerHeight - (val / maxChecks) * innerHeight;
    return { x, y };
  });
  const pathD = points.length ? `M ${points.map((p) => `${p.x},${p.y}`).join(" L ")}` : "";
  const areaD =
    pathD &&
    `M ${points[0].x},${points[0].y} L ${points
      .slice(1)
      .map((p) => `${p.x},${p.y}`)
      .join(" L ")} L ${points[points.length - 1].x},${chartHeight - chartPadding.bottom} L ${points[0].x},${chartHeight - chartPadding.bottom} Z`;

  return (
    <div className="space-y-4">
      <Card title="Daily check-in" subtitle={formatShortDate(today) + " — Today's habits"}>
        <div className="flex flex-wrap items-center gap-2">
          {activeHabits.length === 0 ? (
            <>
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600" aria-hidden>
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 11l3 3L22 4" />
                  <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                </svg>
              </span>
              <p className="text-sm text-gray-500">Add habits on the Habits tab to start your daily check-in.</p>
            </>
          ) : todayIsSkipDay ? (
            <p className="text-sm text-gray-500">Today is a skip day – no habits to check. Enjoy your special occasion.</p>
          ) : habitsActiveToday.length === 0 ? (
            <p className="text-sm text-gray-500">No habits scheduled for today (all are skip days).</p>
          ) : (
            habitsActiveToday.map((h) => (
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
        <div className="mb-2 flex flex-wrap items-baseline justify-between gap-1">
          <p className="text-lg font-semibold text-gray-900">
            {totalChecks} / {totalPossible} checks
          </p>
          {totalPossible > 0 && (
            <p className="text-sm font-medium text-emerald-600">{Math.round((totalChecks / totalPossible) * 100)}%</p>
          )}
        </div>
        <div className="flex items-end gap-1">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="h-16 w-full min-w-0 flex-1 sm:h-20" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0" stopColor="#d1fae5" stopOpacity="0.3" />
                <stop offset="1" stopColor="#059669" stopOpacity="0.5" />
              </linearGradient>
            </defs>
            {areaD && <path d={areaD} fill="url(#chartGradient)" />}
            {pathD && (
              <path d={pathD} fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            )}
          </svg>
        </div>
        <div className="mt-1 flex justify-between text-xs text-gray-400">
          {DAY_LABELS.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
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
