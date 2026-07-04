import { useRouter } from 'next/router';
import { useState } from 'react';
import { Activity, Menu, X, ChevronRight } from 'lucide-react';

export function Navbar() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { label: 'Dashboard', href: '/' },
    { label: 'Predict', href: '/predict' },
    { label: 'Train Models', href: '/train' },
  ];

  return (
    <header className="bg-white border-b border-border shadow-sm sticky top-0 z-50">
      <div className="page-container">
        <div className="h-16 flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 rounded-lg"
          >
            <div className="bg-brand rounded-[10px] w-8 h-8 flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-ink font-bold text-[15px] tracking-tight">Prognos AI</span>
              <span className="text-clinical-400 text-[10px] font-medium tracking-wide">INTELLIGENCE PLATFORM</span>
            </div>
          </button>

          <nav className="hidden md:flex items-center gap-1">
            {links.map(l => (
              <button
                key={l.href}
                onClick={() => router.push(l.href)}
                className={`px-4 py-2 rounded-lg text-sm transition-all duration-150 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${router.pathname === l.href ? 'text-brand bg-brand-pale font-semibold' : 'text-gray-600 font-medium'}`}
              >
                {l.label}
              </button>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => router.push('/predict')}
              className="btn-primary"
            >
              Run Analysis
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            className="md:hidden btn-ghost"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="bg-white border-t border-border md:hidden">
          <div className="page-container py-3 space-y-1">
            {links.map(l => (
              <button
                key={l.href}
                onClick={() => { router.push(l.href); setMobileOpen(false); }}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${router.pathname === l.href ? 'text-brand font-semibold' : 'text-gray-600 font-normal'}`}
              >
                {l.label}
              </button>
            ))}
            <button onClick={() => router.push('/predict')} className="btn-primary w-full mt-2">
              Run Analysis
            </button>
          </div>
        </div>
      )}
    </header>
  );
}