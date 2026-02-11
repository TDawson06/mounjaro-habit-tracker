import React from "react";
import { TabBar } from "./TabBar.jsx";

export function AppShell({ children, activeTab, onTabChange }) {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-emerald-50/40 to-gray-50">
      <header className="relative overflow-hidden border-b border-emerald-100 bg-gradient-to-r from-white to-emerald-50/80 px-4 py-3 shadow-sm">
        <div className="absolute right-0 top-0 h-full w-24 opacity-30">
          <svg viewBox="0 0 96 96" className="h-full w-full text-emerald-400" aria-hidden>
            <path d="M48 20 L48 44 M36 32 L48 44 L60 32" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M28 52 L68 52 M48 52 L48 76" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>
        <div className="relative mx-auto flex max-w-3xl items-center gap-3">
          <img src="/app-icon.svg" alt="" className="h-9 w-9 shrink-0 rounded-xl shadow-sm" aria-hidden />
          <div>
            <h1 className="text-xl font-bold text-gray-900">Mounjaro Tracker</h1>
            <p className="text-sm text-emerald-700/80">Habits • Weight • Milestones</p>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-3 py-4 pb-2 sm:px-4">{children}</main>
      <TabBar activeTab={activeTab} onChange={onTabChange} />
    </div>
  );
}
