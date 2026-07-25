import { NavLink } from 'react-router-dom';
import { LayoutGrid, FolderKanban, SlidersHorizontal, Bell, LogOut, Compass } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid, color: '#4F9DFF', bg: 'rgba(79,157,255,0.15)' },
  { to: '/ledger', label: 'Bookings', icon: FolderKanban, color: '#34E0A1', bg: 'rgba(52,224,161,0.15)' },
  { to: '/settings', label: 'Settings', icon: SlidersHorizontal, color: '#FFB84D', bg: 'rgba(255,184,77,0.15)' },
  { to: '/support', label: 'Support', icon: Bell, color: '#FF6FA5', bg: 'rgba(255,111,165,0.15)' },
];

export default function Sidebar() {
  const { email, logout } = useAuth();

  return (
    <aside className="w-60 shrink-0 h-screen sticky top-0 flex flex-col p-4 border-r border-line bg-surface/60 backdrop-blur-sm max-md:w-[76px] max-md:p-2.5">
      <div className="flex items-center gap-2.5 px-2 pb-7 pt-1 font-display font-bold text-white">
        <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet to-blue flex items-center justify-center">
          <Compass size={18} />
        </span>
        <span className="max-md:hidden">TripSpot</span>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon, color, bg }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors max-md:justify-center ${
                isActive ? 'text-white' : 'text-mist hover:text-white hover:bg-white/5'
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
        <div className="px-2 pb-2 text-[0.7rem] text-mist-soft font-mono truncate max-md:hidden">{email}</div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl text-sm text-mist hover:text-white hover:bg-white/5 max-md:justify-center"
        >
          <LogOut size={16} />
          <span className="max-md:hidden">Sign out</span>
        </button>
      </div>
    </aside>
  );
}
