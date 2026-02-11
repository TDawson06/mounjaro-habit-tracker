import React from "react";
import { TabBar } from "./TabBar.jsx";

export function AppShell({ children, activeTab, onTabChange }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#fafafa]">
      <header className="sticky top-0 z-20 border-b border-gray-100 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <img src="/app-icon.svg" alt="" className="h-8 w-8 shrink-0 rounded-lg" aria-hidden />
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-zinc-900">Mounjaro Tracker</h1>
            <p className="text-xs text-zinc-500">Habits · Weight · Milestones</p>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-5 pb-24">{children}</main>
      <TabBar activeTab={activeTab} onChange={onTabChange} />
    </div>
  );
}
