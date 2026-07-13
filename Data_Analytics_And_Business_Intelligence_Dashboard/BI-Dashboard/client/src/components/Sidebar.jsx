import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/", label: "Dashboard", icon: "M3 13h8V3H3v10Zm0 8h8v-6H3v6Zm10 0h8V11h-8v10Zm0-18v6h8V3h-8Z" },
  { to: "/products", label: "Products", icon: "M4 4h16v4H4V4Zm0 6h16v10H4V10Zm3 3v4h4v-4H7Z" },
  { to: "/import", label: "Import", icon: "M12 3v12m0 0 4-4m-4 4-4-4M5 19h14" },
];

export default function Sidebar({ darkMode, onToggleDark }) {
  return (
    <aside className="w-60 shrink-0 bg-surface-dark text-white/90 flex flex-col h-screen sticky top-0">
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/10">
        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center font-display font-700 text-sm">
          B
        </div>
        <div>
          <p className="font-display font-600 text-sm leading-tight">BI Dashboard</p>
          <p className="text-[11px] text-white/40 leading-tight">Project 9 · Codec</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-white/10 text-white font-500"
                  : "text-white/55 hover:text-white hover:bg-white/5"
              }`
            }
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d={item.icon} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={onToggleDark}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs text-white/55 hover:text-white hover:bg-white/5 transition-colors"
        >
          <span>{darkMode ? "Dark mode" : "Light mode"}</span>
          <span className={`w-8 h-4 rounded-full relative transition-colors ${darkMode ? "bg-accent" : "bg-white/20"}`}>
            <span
              className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${
                darkMode ? "left-4.5" : "left-0.5"
              }`}
              style={{ left: darkMode ? "18px" : "2px" }}
            />
          </span>
        </button>
        <p className="text-[10px] text-white/30 px-3 pt-3">Built by Aishi · Codec Technologies internship</p>
      </div>
    </aside>
  );
}
