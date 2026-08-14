import { Menu } from 'lucide-react';

export default function Topbar({ onMenuClick }) {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-ink/80 backdrop-blur">
      <div className="flex items-center justify-between px-5 py-3.5">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden text-text-muted hover:text-text p-1.5 rounded-md hover:bg-surface-raised"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <p className="mono text-xs text-accent tracking-[0.25em]">
            OSINT <span className="text-text-muted">INTELLIGENCE DASHBOARD</span>
          </p>
        </div>
        <span className="hidden sm:inline-flex items-center gap-2 text-[11px] mono text-accent border border-accent/30 bg-accent/10 rounded-full px-3 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-accent inline-block shadow-glow-sm" />
          Zero Trust Networks
        </span>
      </div>
    </header>
  );
}
