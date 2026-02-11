import React from "react";
import { Card, Button, Input } from "../components/ui.jsx";
import { todayISO } from "../lib/dates.js";
import { getLatestWeight, getWeightChange, kgToGo } from "../lib/progress.js";
import { uid } from "../lib/storage.js";

function formatKg(n) {
  if (n == null || Number.isNaN(n)) return "—";
  return Number(n).toFixed(2);
}

export function Weight({ data, setData }) {
  const [logDate, setLogDate] = React.useState(todayISO());
  const [weightKg, setWeightKg] = React.useState("");
  const [newLabel, setNewLabel] = React.useState("");
  const [newTargetKg, setNewTargetKg] = React.useState("");

  const weightLogs = [...(data.weightLogs || [])].sort((a, b) => (b.date > a.date ? 1 : -1));
  const milestones = data.milestones || [];
  const latestLog = getLatestWeight(data.weightLogs || []);
  const currentWeight = latestLog?.weightKg ?? null;
  const change = getWeightChange(data.weightLogs || []);

  const addLog = () => {
    const w = parseFloat(weightKg);
    if (Number.isNaN(w) || w <= 0) return;
    setData((prev) => ({
      ...prev,
      weightLogs: [...prev.weightLogs, { date: logDate, weightKg: w }],
    }));
    setWeightKg("");
    setLogDate(todayISO());
  };

  const deleteLog = (sortedIndex) => {
    const sorted = [...(data.weightLogs || [])].sort((a, b) => (b.date > a.date ? 1 : -1));
    const toRemove = sorted[sortedIndex];
    if (toRemove == null) return;
    setData((prev) => {
      let removed = false;
      return {
        ...prev,
        weightLogs: prev.weightLogs.filter((l) => {
          if (!removed && l.date === toRemove.date && l.weightKg === toRemove.weightKg) {
            removed = true;
            return false;
          }
          return true;
        }),
      };
    });
  };

  const addMilestone = () => {
    const label = newLabel.trim();
    const target = parseFloat(newTargetKg);
    if (!label || Number.isNaN(target) || target <= 0) return;
    setData((prev) => ({
      ...prev,
      milestones: [...prev.milestones, { id: uid(), label, targetKg: target, type: "custom" }],
    }));
    setNewLabel("");
    setNewTargetKg("");
  };

  const deleteMilestone = (id) => {
    setData((prev) => ({
      ...prev,
      milestones: prev.milestones.filter((m) => m.id !== id),
    }));
  };

  return (
    <div className="space-y-4">
      <Card title="Log Weight">
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
          <div className="min-w-0">
            <label className="mb-1 block text-sm font-medium text-zinc-700">Date</label>
            <Input type="date" value={logDate} onChange={(e) => setLogDate(e.target.value)} />
          </div>
          <div className="min-w-0">
            <label className="mb-1 block text-sm font-medium text-zinc-700">Weight (kg)</label>
            <Input
              type="number"
              step="0.1"
              min="0"
              placeholder="e.g. 95.5"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addLog()}
            />
          </div>
        </div>
        <div className="mt-3">
          <Button onClick={addLog}>Add log</Button>
        </div>
      </Card>

      <Card title="Current weight">
        {currentWeight != null ? (
          <div>
            <p className="text-2xl font-bold text-zinc-900">{formatKg(currentWeight)} kg</p>
            {change != null && (
              <p className={`text-sm ${change.diff <= 0 ? "text-emerald-600" : "text-zinc-500"}`}>
                {change.diff < 0 ? `${formatKg(Math.abs(change.diff))} kg down` : change.diff > 0 ? `+${formatKg(change.diff)} kg` : "No change"} from previous
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-zinc-500">No logs yet. Add one above.</p>
        )}
      </Card>

      <Card title="Recent logs">
        {weightLogs.length === 0 ? (
          <p className="text-sm text-zinc-500">No weight logs yet.</p>
        ) : (
          <ul className="space-y-2">
            {weightLogs.slice(0, 10).map((log, i) => (
              <li key={`${log.date}-${log.weightKg}-${i}`} className="flex items-center justify-between rounded-xl bg-zinc-50/80 px-3 py-2">
                <span className="text-zinc-800">
                  {log.date} — <strong>{formatKg(log.weightKg)} kg</strong>
                </span>
                <button
                  type="button"
                  onClick={() => deleteLog(i)}
                  className="text-zinc-400 hover:text-red-500"
                  aria-label="Delete log"
                >
                  🗑
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="Add Milestone">
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
          <div className="min-w-0 sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-zinc-700">Label</label>
            <Input
              placeholder="e.g. Fit into Adidas jacket"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addMilestone()}
            />
          </div>
          <div className="min-w-0">
            <label className="mb-1 block text-sm font-medium text-zinc-700">Target (kg)</label>
            <Input
              type="number"
              step="0.1"
              min="0"
              placeholder="e.g. 94"
              value={newTargetKg}
              onChange={(e) => setNewTargetKg(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <Button onClick={addMilestone}>Add milestone</Button>
          </div>
        </div>
      </Card>

      <Card title="Milestones">
        {milestones.length === 0 ? (
          <p className="text-sm text-zinc-500">Add milestones above. Your goals will show here.</p>
        ) : (
          <ul className="space-y-2">
            {[...milestones].sort((a, b) => b.targetKg - a.targetKg).map((m) => {
              const toGo = kgToGo(currentWeight, m.targetKg);
              const achieved = toGo === 0;
              return (
                <li key={m.id} className="flex items-center justify-between rounded-xl bg-zinc-50/80 px-3 py-2 text-sm">
                  <span className="text-zinc-700">{m.label}</span>
                  <div className="flex items-center gap-2">
                    <span className={achieved ? "font-medium text-emerald-600" : "text-zinc-500"}>
                      {achieved ? "Achieved" : `${formatKg(toGo)} kg to go`}
                    </span>
                    <button
                      type="button"
                      onClick={() => deleteMilestone(m.id)}
                      className="text-zinc-400 hover:text-red-500"
                      aria-label="Delete milestone"
                    >
                      🗑
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
