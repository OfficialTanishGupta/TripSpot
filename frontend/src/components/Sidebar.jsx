import { NavLink } from "react-router-dom";
import {
  LayoutGrid,
  FolderKanban,
  SlidersHorizontal,
  Bell,
  LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/tour-guide.svg";

const NAV_ITEMS = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: LayoutGrid,
    color: "#4F9DFF",
    bg: "#EAF3FF",
  },
  {
    to: "/ledger",
    label: "Bookings",
    icon: FolderKanban,
    color: "#1FB980",
    bg: "#E6F9F1",
  },
  {
    to: "/settings",
    label: "Settings",
    icon: SlidersHorizontal,
    color: "#FF9F1C",
    bg: "#FFF3E0",
  },
  {
    to: "/support",
    label: "Support",
    icon: Bell,
    color: "#FF6FA5",
    bg: "#FFEAF2",
  },
];

export default function Sidebar() {
  const { email, logout } = useAuth();

  return (
    <aside className="w-60 shrink-0 h-screen sticky top-0 flex flex-col p-4 border-r border-line bg-surface max-md:w-[76px] max-md:p-2.5">
      <div className="flex items-center gap-2.5 px-2 pb-7 pt-1 font-display font-semibold text-ink">
        <img src={logo} alt="TripSpot" className="w-8 h-8 shrink-0" />
        <span className="max-md:hidden tracking-[-0.01em]">TripSpot</span>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon, color, bg }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors max-md:justify-center ${
                isActive
                  ? "text-ink"
                  : "text-mist hover:text-ink hover:bg-canvas"
              }`
            }
            style={({ isActive }) => (isActive ? { background: bg } : {})}
          >
            <span
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ color }}
            >
              <Icon size={17} />
            </span>
            <span className="max-md:hidden">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-line pt-3 mt-2">
        <div className="px-2 pb-2 text-[0.7rem] text-mist-soft font-mono truncate max-md:hidden">
          {email}
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl text-sm text-mist hover:text-ink hover:bg-canvas max-md:justify-center"
        >
          <LogOut size={16} />
          <span className="max-md:hidden">Sign out</span>
        </button>
      </div>
    </aside>
  );
}
