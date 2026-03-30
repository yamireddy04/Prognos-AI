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
    <header style={{ background: 'white', borderBottom: '1px solid #e2e6ec', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }} className="sticky top-0 z-50">
      <div className="page-container">
        <div className="h-16 flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2.5 group"
          >
            <div style={{ background: '#1a56db', borderRadius: 10 }} className="w-8 h-8 flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col leading-none">
              <span style={{ color: '#111827', fontWeight: 700, fontSize: 15, letterSpacing: '-0.02em' }}>Prognos AI</span>
              <span style={{ color: '#9aa3b0', fontSize: 10, fontWeight: 500, letterSpacing: '0.05em' }}>INTELLIGENCE PLATFORM</span>
            </div>
          </button>

          <nav className="hidden md:flex items-center gap-1">
            {links.map(l => (
              <button
                key={l.href}
                onClick={() => router.push(l.href)}
                style={{
                  color: router.pathname === l.href ? '#1a56db' : '#4b5563',
                  background: router.pathname === l.href ? '#eff4ff' : 'transparent',
                  fontWeight: router.pathname === l.href ? 600 : 500,
                }}
                className="px-4 py-2 rounded-lg text-sm transition-all duration-150 hover:bg-gray-50"
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
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div style={{ background: 'white', borderTop: '1px solid #e2e6ec' }} className="md:hidden">
          <div className="page-container py-3 space-y-1">
            {links.map(l => (
              <button
                key={l.href}
                onClick={() => { router.push(l.href); setMobileOpen(false); }}
                style={{ color: router.pathname === l.href ? '#1a56db' : '#4b5563', fontWeight: router.pathname === l.href ? 600 : 400 }}
                className="w-full text-left px-4 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-colors"
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