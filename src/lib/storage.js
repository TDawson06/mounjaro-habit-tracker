const STORAGE_KEY = "mounjaro_tracker_v1";

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const defaultData = {
  habits: [],
  habitChecks: {},
  skipDates: {},
  weightLogs: [],
  milestones: [
    { id: uid(), label: "Fit into Adidas Originals Jacket (94kg)", targetKg: 94, type: "custom" },
    { id: uid(), label: "Fit into Adidas Originals Jacket (93kg)", targetKg: 93, type: "custom" },
  ],
};

function isValidData(data) {
  return (
    data &&
    typeof data === "object" &&
    Array.isArray(data.habits) &&
    typeof data.habitChecks === "object" &&
    Array.isArray(data.weightLogs) &&
    Array.isArray(data.milestones)
  );
}

function ensureSkipDates(data) {
  if (typeof data.skipDates !== "object" || data.skipDates === null) {
    data.skipDates = {};
  }
  return data;
}

function isOldDefaultHabits(habits) {
  if (!Array.isArray(habits) || habits.length !== 2) return false;
  const names = habits.map((h) => (h && h.name) || "").sort();
  return names[0] === "Morning walk" && names[1] === "Track food";
}

export function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultCopy();
    const data = JSON.parse(raw);
    if (!isValidData(data)) return getDefaultCopy();
    if (isOldDefaultHabits(data.habits)) {
      data.habits = [];
    }
    return ensureSkipDates(data);
  } catch {
    return getDefaultCopy();
  }
}

function getDefaultCopy() {
  return {
    habits: [],
    habitChecks: {},
    skipDates: {},
    weightLogs: [],
    milestones: defaultData.milestones.map((m) => ({ ...m })),
  };
}

export function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn("Failed to save data:", e);
  }
}

export { uid };
