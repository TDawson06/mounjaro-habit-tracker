import React from "react";

export function Card({ title, subtitle, children, right }) {
  return (
    <div className="rounded-2xl bg-white/90 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] backdrop-blur-sm">
      {(title || right) && (
        <div className="mb-3 flex items-center justify-between gap-2">
          {title && <h3 className="text-sm font-semibold tracking-tight text-zinc-800">{title}</h3>}
          {right && <div className="min-w-0 truncate text-right text-xs text-zinc-500">{right}</div>}
        </div>
      )}
      {subtitle && <p className="mb-3 text-xs text-zinc-500">{subtitle}</p>}
      {children}
    </div>
  );
}

export function Button({ children, variant = "primary", className = "", ...props }) {
  const base = "rounded-xl px-4 py-2.5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white";
  const variants = {
    primary: "bg-emerald-500 text-white hover:bg-emerald-600 focus:ring-emerald-400",
    secondary: "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 focus:ring-zinc-300",
    ghost: "text-zinc-600 hover:bg-zinc-100 focus:ring-zinc-200",
  };
  return (
    <button className={`${base} ${variants[variant] || variants.primary} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function Input({ className = "", ...props }) {
  return (
    <input
      className={`w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-800 placeholder:text-zinc-400 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400 ${className}`}
      {...props}
    />
  );
}

export function Chip({ children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}
    >
      {children}
    </span>
  );
}
