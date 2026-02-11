import React from "react";

export function TogglePill({ checked, onClick, label, size = "md" }) {
  const sizeClass = size === "sm" ? "px-2 py-1 text-xs" : "px-3 py-2 text-sm";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        rounded-full font-medium transition
        focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1
        ${sizeClass}
        ${checked
          ? "bg-emerald-600 text-white"
          : "border border-gray-300 bg-white text-gray-600 hover:border-emerald-400 hover:bg-emerald-50"}
      `}
      aria-pressed={checked}
    >
      {label != null ? label : (checked ? "✓" : "—")}
    </button>
  );
}
