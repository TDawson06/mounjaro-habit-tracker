import React from "react";
import { TabBar } from "./TabBar.jsx";

export function AppShell({ children, activeTab, onTabChange }) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-4 py-3 shadow-sm">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-xl font-bold text-gray-900">Mounjaro Tracker</h1>
          <p className="text-sm text-gray-500">Habits • Weight • Milestones</p>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-4 pb-2">{children}</main>
      <TabBar activeTab={activeTab} onChange={onTabChange} />
    </div>
  );
}
