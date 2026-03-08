import { useStore } from '../store/useStore'

const NAV_ITEMS = [
    { id: 'overview', label: 'Overview', icon: '◈' },
    { id: 'grid', label: 'Grid Side', icon: '⬡' },
    { id: 'load', label: 'Load Side', icon: '⬢' },
    { id: 'power', label: 'Power', icon: '⚡' },
    { id: 'trends', label: 'Trends', icon: '〜' },
    { id: 'config', label: 'Config', icon: '⚙' },
]

export default function Sidebar() {
    const { activePage, setActivePage, modbusStatus } = useStore()

    return (
        <aside style={{
            width: 200,
            background: 'var(--surface)',
            borderRight: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
        }}>
            {/* MONITORING section */}
            <div style={{ padding: '12px 0' }}>
                <div style={{
                    padding: '4px 16px 8px',
                    fontSize: 10,
                    fontFamily: 'var(--mono)',
                    color: 'var(--text-dim)',
                    letterSpacing: 2,
                    textTransform: 'uppercase',
                }}>
                    Monitoring
                </div>
                {NAV_ITEMS.filter(i => i.id !== 'config').map(item => (
                    <SidebarItem key={item.id} item={item} active={activePage === item.id} onClick={() => setActivePage(item.id)} />
                ))}
            </div>

            <div style={{ borderTop: '1px solid var(--border)', padding: '12px 0' }}>
                <div style={{
                    padding: '4px 16px 8px',
                    fontSize: 10,
                    fontFamily: 'var(--mono)',
                    color: 'var(--text-dim)',
                    letterSpacing: 2,
                    textTransform: 'uppercase',
                }}>
                    System
                </div>
                <SidebarItem item={NAV_ITEMS.find(i => i.id === 'config')} active={activePage === 'config'} onClick={() => setActivePage('config')} />
            </div>

            {/* Bottom info panel */}
            <div style={{ flex: 1 }} />
            <div style={{
                borderTop: '1px solid var(--border)',
                padding: '12px 16px',
                background: 'var(--surface2)',
            }}>
                <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text-dim)', marginBottom: 8, letterSpacing: 1 }}>MODBUS</div>
                {[
                    ['PORT', modbusStatus.port || 'COM9'],
                    ['BAUD', modbusStatus.baudrate || 9600],
                    ['ID', modbusStatus.slave_id || 1],
                    ['POLL', `${modbusStatus.poll_time || 1}s`],
                ].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text-dim)' }}>{k}</span>
                        <span style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text-mid)' }}>{v}</span>
                    </div>
                ))}
                {modbusStatus.last_success && (
                    <div style={{ marginTop: 8, fontSize: 9, fontFamily: 'var(--mono)', color: 'var(--text-dim)' }}>
                        LAST OK<br />
                        <span style={{ color: 'var(--accent2)' }}>
                            {new Date(modbusStatus.last_success).toLocaleTimeString('en-GB')}
                        </span>
                    </div>
                )}
            </div>
        </aside>
    )
}

function SidebarItem({ item, active, onClick }) {
    return (
        <button
            id={`sidebar-${item.id}`}
            onClick={onClick}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                padding: '9px 16px',
                background: active ? 'rgba(124,106,247,0.1)' : 'transparent',
                borderLeft: active ? '3px solid var(--accent)' : '3px solid transparent',
                border: 'none',
                borderTopRightRadius: 4,
                borderBottomRightRadius: 4,
                cursor: 'pointer',
                transition: 'all 0.15s',
                textAlign: 'left',
            }}
        >
            <span style={{ fontSize: 14, color: active ? 'var(--accent)' : 'var(--text-dim)' }}>{item.icon}</span>
            <span style={{
                fontFamily: 'var(--body)',
                fontSize: 13,
                fontWeight: 600,
                color: active ? 'var(--text-bright)' : 'var(--text-mid)',
                letterSpacing: 0.5,
            }}>
                {item.label}
            </span>
        </button>
    )
}
