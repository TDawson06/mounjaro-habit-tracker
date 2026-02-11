import React from "react";

const tabs = [
  { id: "dashboard", label: "Dashboard" },
  { id: "habits", label: "Habits" },
  { id: "weight", label: "Weight" },
];

export function TabBar({ activeTab, onChange }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-10 border-t border-zinc-100 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-3xl justify-around">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`
              flex-1 py-3 text-xs font-medium tracking-wide transition
              ${activeTab === tab.id ? "text-emerald-600" : "text-zinc-500 hover:text-zinc-700"}
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
