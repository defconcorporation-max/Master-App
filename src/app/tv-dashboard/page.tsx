'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const CityHallScene = dynamic(() => import('@/components/CityHallScene'), {
  ssr: false,
  loading: () => (
    <div style={{ backgroundColor: '#e0f2fe', width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontFamily: 'sans-serif' }}>
      Loading City Simulator...
    </div>
  ),
});

import { ChevronLeft } from 'lucide-react';

export default function TvDashboardPage() {
  const [time, setTime] = React.useState<string>('--:--');
  const [mounted, setMounted] = React.useState(false);
  const [data, setData] = React.useState<any>(null);

  React.useEffect(() => {
    setMounted(true);
    
    // Time interval
    const clockInterval = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    setTime(new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }));
    
    // Live Stats Fetching
    const fetchLiveStats = async () => {
      try {
        const res = await fetch('/api/stats');
        const json = await res.json();
        setData(json);
      } catch (e) {
        console.error("Failed to sync structural data:", e);
      }
    };
    fetchLiveStats();
    const statsInterval = setInterval(fetchLiveStats, 15000); // Refresh every 15s

    return () => {
      clearInterval(clockInterval);
      clearInterval(statsInterval);
    };
  }, []);

  return (
    <div style={{ backgroundColor: '#1e1b4b', width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden', margin: 0, padding: 0 }}>
      {/* 3D Canvas Background */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
        {data && <CityHallScene stats={data.stats} tasks={data.tasks} />}
      </div>

      {/* Cinematic Dark Overlay matching image reference */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10, pointerEvents: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        
        {/* Top Header Bar */}
        <header style={{ 
          background: 'rgba(0,0,0,0.6)', 
          backdropFilter: 'blur(8px)', 
          padding: '12px 24px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          color: '#cbd5e1', 
          fontFamily: 'sans-serif',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          pointerEvents: 'auto'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button 
                onClick={() => window.location.href = '/'}
                style={{ 
                    display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.1)', 
                    border: '1px solid rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: '6px', 
                    color: '#fff', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            >
                <ChevronLeft size={16} />
                BACK TO HQ
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#fff' }}>A</span>
              <span style={{ fontSize: '14px', letterSpacing: '1px' }}>AUCLAIRE TV-DASHBOARD</span>
            </div>
          </div>
          <div style={{ fontSize: '14px', letterSpacing: '1px', opacity: 0.6 }}>
            Empire Engine - 3D Tycoon Mode
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff' }}>{mounted ? time : '--:--'}</span>
          </div>
        </header>

        {/* Bottom Ticker Info bar */}
        <footer style={{ padding: '24px' }}>
          <div style={{ 
            background: 'rgba(0,0,0,0.7)', 
            backdropFilter: 'blur(12px)', 
            padding: '16px 24px', 
            borderRadius: '8px', 
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#cbd5e1',
            fontFamily: 'sans-serif',
            fontSize: '14px',
            whiteSpace: 'nowrap',
            overflow: 'hidden'
          }}>
            <div className="animate-[ticker_35s_linear_infinite] custom-ticker">
               • NEW CONTRACT SIGNED ON AUCLAIRE (DRS LLC) • MALORIE C. COMPLETED A DESIGN TASK • INVOICE #9822 PAID • SARAH K. UPDATED PROJECT PHOENIX • MEGAN J. ADDED NEW CLIENT (VEGAS) • {mounted ? time : '--:--'} •
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
