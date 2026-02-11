import React from "react";

const tabs = [
  { id: "dashboard", label: "Dashboard" },
  { id: "habits", label: "Habits" },
  { id: "weight", label: "Weight" },
];

export function TabBar({ activeTab, onChange }) {
  return (
    <nav className="sticky bottom-0 z-10 border-t border-gray-200 bg-white/95 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      <div className="mx-auto flex max-w-3xl justify-around">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`
              flex-1 py-3 text-sm font-medium transition
              ${activeTab === tab.id ? "text-emerald-600" : "text-gray-500 hover:text-gray-700"}
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
