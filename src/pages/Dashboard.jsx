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

function formatKg(n) {
  if (n == null || Number.isNaN(n)) return "—";
  return Number(n).toFixed(2);
}

const DAILY_QUOTES = [
  "Small steps add up.",
  "Your future self will thank you.",
  "Progress over perfection.",
  "One day at a time.",
  "You're capable of more than you know.",
  "Every habit counts.",
  "Consistency beats intensity.",
  "Trust the process.",
  "Good choices compound.",
  "You've got this.",
];

function getDailyQuote() {
  const start = new Date(new Date().getFullYear(), 0, 0);
  const now = new Date();
  const dayOfYear = Math.floor((now - start) / (1000 * 60 * 60 * 24));
  return DAILY_QUOTES[dayOfYear % DAILY_QUOTES.length];
}

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

  const weekPct = totalPossible > 0 ? Math.round((totalChecks / totalPossible) * 100) : 0;
  const weekMessage =
    totalPossible === 0
      ? null
      : weekPct >= 100
        ? "Perfect week! 🎉"
        : weekPct >= 80
          ? "Great week so far!"
          : weekPct >= 50
            ? "You're on track — keep it up!"
            : weekPct > 0
              ? "Every check counts. You've got this!"
              : "Start with one check today.";

  const todayPossible = habitsActiveToday.length;
  const todayDone = todayPossible > 0 ? habitsActiveToday.filter((h) => habitChecks[today]?.[h.id]).length : 0;
  const dayComplete = todayPossible > 0 && todayDone === todayPossible;

  const badges = [];
  if (totalPossible > 0 && weekPct >= 100) badges.push({ id: "perfect-week", label: "Perfect week", emoji: "🌟" });
  if (totalPossible > 0 && weekPct >= 80 && weekPct < 100) badges.push({ id: "week-warrior", label: "Week warrior", emoji: "💪" });
  const maxStreak = Math.max(0, ...streaks.map((s) => s.streak));
  if (maxStreak >= 7) badges.push({ id: "on-fire", label: "On fire", emoji: "🔥" });
  if (maxStreak >= 3 && maxStreak < 7) badges.push({ id: "streak-builder", label: "Streak builder", emoji: "⭐" });

  const quote = getDailyQuote();

  return (
    <div className="space-y-4">
      <p className="text-center text-xs italic text-zinc-500">"{quote}"</p>
      {dayComplete && (
        <div className="rounded-2xl border border-violet-100 bg-violet-50/80 px-4 py-3 text-center">
          <p className="text-sm font-semibold text-violet-800">Day complete! 🎉</p>
          <p className="text-xs text-violet-600/90">You checked every habit for today. Nice work!</p>
        </div>
      )}
      {badges.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2">
          {badges.map((b) => (
            <span
              key={b.id}
              className="inline-flex items-center gap-1 rounded-full bg-violet-100/90 px-3 py-1.5 text-xs font-medium text-violet-700"
            >
              <span>{b.emoji}</span>
              {b.label}
            </span>
          ))}
        </div>
      )}
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
              <p className="text-sm text-zinc-500">Add habits on the Habits tab to start your daily check-in.</p>
            </>
          ) : todayIsSkipDay ? (
            <p className="text-sm text-zinc-500">Today is a skip day – no habits to check. Enjoy your special occasion.</p>
          ) : habitsActiveToday.length === 0 ? (
            <p className="text-sm text-zinc-500">No habits scheduled for today (all are skip days).</p>
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

      <Card title="Weight" right={latestLog && <span className="text-zinc-500">{formatShortDate(latestLog.date)}</span>}>
        {currentWeight != null ? (
          <div>
            <p className="text-2xl font-bold text-zinc-900">{formatKg(currentWeight)} kg</p>
            {change != null && (
              <>
                <p className={`text-sm font-medium ${change.diff <= 0 ? "text-emerald-600" : "text-zinc-500"}`}>
                  {change.diff < 0 ? `${formatKg(Math.abs(change.diff))} kg down` : change.diff > 0 ? `+${formatKg(change.diff)} kg` : "No change"} from previous
                </p>
                {change.diff < 0 && (
                  <p className="mt-0.5 text-xs text-emerald-600">Trending in the right direction!</p>
                )}
              </>
            )}
          </div>
        ) : (
          <p className="text-sm text-zinc-500">Log weight on the Weight tab to track your progress.</p>
        )}
      </Card>

      <Card title="This week so far">
        {totalPossible > 0 && (
          <>
            <div className="mb-2 h-2.5 w-full overflow-hidden rounded-full bg-zinc-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-[width] duration-500"
                style={{ width: `${Math.min(100, weekPct)}%` }}
                role="progressbar"
                aria-valuenow={totalChecks}
                aria-valuemin={0}
                aria-valuemax={totalPossible}
                aria-label={`${totalChecks} of ${totalPossible} checks this week`}
              />
            </div>
            <p className="mb-1 text-center text-xl font-semibold text-zinc-800">
              {totalChecks} <span className="font-normal text-zinc-400">/</span> {totalPossible}
            </p>
            <p className="mb-2 text-center text-sm font-medium text-emerald-600">{weekPct}%</p>
            {weekMessage && (
              <p className="mb-3 text-center text-xs font-medium text-zinc-600">{weekMessage}</p>
            )}
          </>
        )}
        <div className="flex items-end gap-1">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="h-16 w-full min-w-0 flex-1 sm:h-20" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0" stopColor="#d1fae5" stopOpacity="0.25" />
                <stop offset="1" stopColor="#34d399" stopOpacity="0.4" />
              </linearGradient>
            </defs>
            {areaD && <path d={areaD} fill="url(#chartGradient)" />}
            {pathD && (
              <path d={pathD} fill="none" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            )}
          </svg>
        </div>
        <div className="mt-1 flex justify-between text-[11px] text-zinc-400">
          {DAY_LABELS.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
        {totalPossible === 0 && (
          <p className="mt-2 text-center text-xs text-zinc-500">Complete habits today to see your week here.</p>
        )}
      </Card>

      <Card title="Next milestones">
        {nextThree.length === 0 ? (
          <p className="text-sm text-zinc-500">
            {currentWeight != null ? "You've reached the lowest target, or add more milestones." : "Log weight to see milestones."}
          </p>
        ) : (
          <ul className="space-y-2">
            {nextThree.map((m) => {
              const toGo = kgToGo(currentWeight, m.targetKg);
              const achieved = toGo === 0;
              return (
                <li key={m.id} className="flex items-center justify-between text-sm">
                  <span className="text-zinc-700">{m.label}</span>
                  {achieved ? (
                    <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-700">
                      Achieved ✓
                    </span>
                  ) : (
                    <span className="text-zinc-500">{formatKg(toGo)} kg to go</span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {streaks.length > 0 && (
        <Card title="Streaks" subtitle="You're building momentum!">
          <ul className="space-y-1.5 text-sm">
            {streaks.map(({ habit, streak }) => (
              <li key={habit.id} className="flex items-center justify-between rounded-xl bg-emerald-50/60 px-3 py-2">
                <span className="font-medium text-zinc-800">{habit.name}</span>
                <span className="text-sm font-semibold text-emerald-600">{streak} day{streak !== 1 ? "s" : ""}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
