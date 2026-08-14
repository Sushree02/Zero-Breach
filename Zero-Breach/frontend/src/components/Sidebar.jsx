import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Globe, MapPin, User, LayoutGrid, FileSearch } from 'lucide-react';
import logo from '../assets/logo.jpeg';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid, type: null },
  { id: 'domain', label: 'Domain', icon: Globe, type: 'domain' },
  { id: 'ip', label: 'IP Address', icon: MapPin, type: 'ip' },
  { id: 'username', label: 'Username', icon: User, type: 'username' },
  { id: 'file', label: 'File', icon: FileSearch, type: 'file' },
];

export default function Sidebar({ mobileOpen, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const onHome = location.pathname === '/';

  function handleNavClick(item) {
    onClose?.();
    if (item.type) {
      navigate('/', { state: { presetType: item.type } });
    } else {
      navigate('/');
    }
  }

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-60 shrink-0 bg-surface border-r border-border z-40
          transform transition-transform lg:translate-x-0
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          <Link to="/" onClick={onClose} className="flex items-center gap-3 px-5 py-5 border-b border-border">
            <img src={logo} alt="Zero Breach logo" className="h-9 w-9 rounded-md object-cover border border-border" />
            <div className="leading-tight">
              <p className="display font-bold tracking-wide text-sm text-text">ZERO BREACH</p>
              <p className="mono text-[9px] text-text-muted tracking-widest">OSINT DASHBOARD</p>
            </div>
          </Link>

          <nav className="flex-1 px-3 py-4 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = item.id === 'dashboard' ? onHome : false;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm mono tracking-wide transition-colors
                    ${
                      active
                        ? 'bg-accent/10 text-accent border border-accent/30 shadow-glow-sm'
                        : 'text-text-muted hover:text-text hover:bg-surface-raised border border-transparent'
                    }`}
                >
                  <Icon size={16} strokeWidth={2} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="px-5 py-4 border-t border-border">
            <p className="text-[10px] text-text-muted leading-relaxed">
              Zero Breach investigates only publicly available information via legitimate third-party APIs.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
