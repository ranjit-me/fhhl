import { useEffect, useState } from 'react'
import { useStore } from '../store/useStore'

const PAGES = [
    { id: 'overview', label: 'Overview' },
    { id: 'grid', label: 'Grid' },
    { id: 'load', label: 'Load' },
    { id: 'power', label: 'Power' },
    { id: 'trends', label: 'Trends' },
    { id: 'config', label: 'Config' },
]

export default function Header() {
    const { wsStatus, modbusStatus, activePage, setActivePage } = useStore()
    const [time, setTime] = useState(new Date())

    useEffect(() => {
        const t = setInterval(() => setTime(new Date()), 1000)
        return () => clearInterval(t)
    }, [])

    const isLive = modbusStatus.connected && wsStatus === 'open'
    const dotColor = isLive ? '#3de8c0' : '#f7716a'
    const statusLabel = isLive ? 'LIVE' : 'OFFLINE'

    return (
        <header style={{
            height: 56,
            background: 'var(--surface)',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
            gap: 12,
            position: 'sticky',
            top: 0,
            zIndex: 100,
        }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 16 }}>
                <svg width="32" height="32" viewBox="0 0 40 40" style={{ animation: 'hex-pulse 3s ease-in-out infinite' }}>
                    <polygon
                        points="20,2 36,11 36,29 20,38 4,29 4,11"
                        fill="none"
                        stroke="var(--accent)"
                        strokeWidth="2"
                    />
                    <polygon
                        points="20,8 30,14 30,26 20,32 10,26 10,14"
                        fill="var(--accent)"
                        opacity="0.15"
                    />
                    <text x="20" y="25" textAnchor="middle" fill="var(--accent)" style={{ fontFamily: 'var(--head)', fontSize: 11, fontWeight: 700 }}>EMS</text>
                </svg>
                <div>
                    <div style={{ fontFamily: 'var(--head)', fontSize: 11, color: 'var(--accent)', letterSpacing: 2, lineHeight: 1 }}>FHHL</div>
                    <div style={{ fontFamily: 'var(--body)', fontSize: 10, color: 'var(--text-mid)', letterSpacing: 1 }}>ENERGY MONITOR</div>
                </div>
            </div>

            {/* Nav Tabs */}
            <nav style={{ display: 'flex', gap: 2, flex: 1 }}>
                {PAGES.map(p => (
                    <button
                        key={p.id}
                        id={`nav-${p.id}`}
                        onClick={() => setActivePage(p.id)}
                        style={{
                            background: activePage === p.id ? 'rgba(124,106,247,0.15)' : 'transparent',
                            border: 'none',
                            borderBottom: activePage === p.id ? '2px solid var(--accent)' : '2px solid transparent',
                            color: activePage === p.id ? 'var(--text-bright)' : 'var(--text-mid)',
                            fontFamily: 'var(--body)',
                            fontSize: 13,
                            fontWeight: 600,
                            letterSpacing: 1,
                            padding: '0 14px',
                            height: 56,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            textTransform: 'uppercase',
                        }}
                    >
                        {p.label}
                    </button>
                ))}
            </nav>

            {/* Clock */}
            <div style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--text-mid)', marginRight: 12 }}>
                {time.toLocaleTimeString('en-GB')}
            </div>

            {/* Error count */}
            {modbusStatus.error_count > 0 && (
                <div style={{
                    background: 'rgba(255,69,96,0.15)',
                    border: '1px solid var(--warn)',
                    color: 'var(--warn)',
                    fontFamily: 'var(--mono)',
                    fontSize: 11,
                    padding: '2px 8px',
                    borderRadius: 4,
                }}>
                    ERR:{modbusStatus.error_count}
                </div>
            )}

            {/* Status Pill */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: 'rgba(0,0,0,0.3)',
                border: `1px solid ${dotColor}33`,
                borderRadius: 20,
                padding: '4px 10px',
            }}>
                <div style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: dotColor,
                    animation: 'blink 1.5s ease-in-out infinite',
                    boxShadow: `0 0 6px ${dotColor}`,
                }} />
                <span style={{
                    fontFamily: 'var(--mono)',
                    fontSize: 11,
                    fontWeight: 500,
                    color: dotColor,
                    letterSpacing: 1,
                }}>
                    {statusLabel}
                </span>
            </div>
        </header>
    )
}
