/**
 * Progress helpers: latest weight, change, next milestones, bands, streaks.
 */

export function getLatestWeight(weightLogs) {
  if (!weightLogs?.length) return null;
  const sorted = [...weightLogs].sort((a, b) => (b.date > a.date ? 1 : -1));
  return sorted[0];
}

export function getWeightChange(weightLogs) {
  if (!weightLogs?.length || weightLogs.length < 2) return null;
  const sorted = [...weightLogs].sort((a, b) => (b.date > a.date ? 1 : -1));
  const latest = sorted[0].weightKg;
  const prev = sorted[1].weightKg;
  return { diff: latest - prev, latest, prev };
}

/**
 * @param {number} currentWeight
 * @param {Array<{targetKg: number, label?: string, id?: string}>} milestones
 * @param {number} count
 * @returns next `count` milestones below current weight (closest first)
 */
export function getNextMilestones(currentWeight, milestones, count = 3) {
  if (currentWeight == null || !milestones?.length) return [];
  const below = milestones
    .filter((m) => m.targetKg < currentWeight)
    .sort((a, b) => b.targetKg - a.targetKg);
  return below.slice(0, count);
}

/**
 * Upcoming: targets above current weight (we want to reach them), closest first.
 */
export function getUpcomingMilestones(currentWeight, milestones, count = 5) {
  if (currentWeight == null || !milestones?.length) return [];
  const above = milestones
    .filter((m) => m.targetKg <= currentWeight)
    .sort((a, b) => b.targetKg - a.targetKg);
  return above.slice(0, count);
}

/**
 * Next targets we haven't reached yet: targetKg > currentWeight, closest first.
 */
export function getNextTargets(currentWeight, milestones, count = 5) {
  if (currentWeight == null || !milestones?.length) return [];
  const notReached = milestones
    .filter((m) => m.targetKg < currentWeight)
    .sort((a, b) => b.targetKg - a.targetKg);
  return notReached.slice(0, count);
}

export function kgToGo(currentWeight, targetKg) {
  if (currentWeight == null) return null;
  if (currentWeight <= targetKg) return 0;
  return Math.round((currentWeight - targetKg) * 10) / 10;
}

/**
 * Generate auto milestone bands every stepKg from startKg down to endKg.
 */
export function generateMilestoneBands(startKg, endKg, stepKg = 2) {
  const bands = [];
  for (let kg = startKg; kg >= endKg; kg -= stepKg) {
    bands.push({
      id: `band-${kg}`,
      label: `${kg}kg milestone`,
      targetKg: kg,
      type: "auto",
    });
  }
  return bands;
}

/**
 * Merge custom milestones with band milestones; dedupe by targetKg, keep custom label on clash.
 */
export function mergeMilestones(customMilestones, bandMilestones) {
  const byTarget = new Map();
  for (const m of customMilestones || []) {
    byTarget.set(m.targetKg, { ...m });
  }
  for (const m of bandMilestones || []) {
    if (!byTarget.has(m.targetKg)) {
      byTarget.set(m.targetKg, { ...m });
    }
  }
  return Array.from(byTarget.values()).sort((a, b) => b.targetKg - a.targetKg);
}

/**
 * Consecutive days checked ending at endDateISO. Returns number of days.
 */
export function getHabitStreak(habitChecks, habitId, endDateISO) {
  if (!habitChecks || !habitId || !endDateISO) return 0;
  let streak = 0;
  const d = new Date(endDateISO + "T12:00:00");
  for (;;) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const iso = `${y}-${m}-${day}`;
    if (!habitChecks[iso]?.[habitId]) break;
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}
