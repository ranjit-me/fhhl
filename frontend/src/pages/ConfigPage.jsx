import { useState } from 'react'
import { useStore } from '../store/useStore'

const REGISTER_TABLE = [
    { addr: '40011–40015', name: 'grid_thdi_r/y/b', unit: '%', group: 'Grid THDi' },
    { addr: '40017–40021', name: 'grid_i_r/y/b', unit: 'A', group: 'Grid Current' },
    { addr: '40023–40027', name: 'load_thdi_r/y/b', unit: '%', group: 'Load THDi' },
    { addr: '40029–40033', name: 'load_i_r/y/b', unit: 'A', group: 'Load Current' },
    { addr: '40035–40045', name: 'volt/freq r/y/b', unit: 'V/Hz', group: 'Voltage & Freq' },
    { addr: '40047–40051', name: 'thdu_r/y/b', unit: '%', group: 'THDu' },
    { addr: '40053–40055', name: 'grid_i_n, grid_thdi_n', unit: 'A/%', group: 'Neutral Grid' },
    { addr: '40057–40063', name: 'grid_pf_r/y/b/n', unit: 'PF', group: 'Grid PF' },
    { addr: '40065–40075', name: 'comp_cur/rate r/y/b', unit: 'A/%', group: 'Compensation' },
    { addr: '40077–40087', name: 'load_i_n, thdi_n, pf r/y/b/n', unit: 'A/%/PF', group: 'Load Neutral & PF' },
    { addr: '40089–40105', name: 'grid_kvar/kw/kva r/y/b', unit: 'kVAr/kW/kVA', group: 'Grid Power' },
    { addr: '40107–40123', name: 'load_kvar/kw/kva r/y/b', unit: 'kVAr/kW/kVA', group: 'Load Power' },
    { addr: '40125–40129', name: 'temp_j1/j2/j3', unit: '°C', group: 'Temperature' },
]

export default function ConfigPage() {
    const { modbusStatus } = useStore()
    const [form, setForm] = useState({
        PORT: modbusStatus.port || 'COM9',
        BAUDRATE: modbusStatus.baudrate || 9600,
        SLAVE_ID: modbusStatus.slave_id || 1,
        POLL_TIME: modbusStatus.poll_time || 1.0,
    })
    const [msg, setMsg] = useState(null)

    const applyConfig = async () => {
        try {
            const res = await fetch('/api/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    PORT: form.PORT,
                    BAUDRATE: parseInt(form.BAUDRATE),
                    SLAVE_ID: parseInt(form.SLAVE_ID),
                    POLL_TIME: parseFloat(form.POLL_TIME),
                }),
            })
            const data = await res.json()
            setMsg(data.ok ? `✓ Config applied${data.reconnect ? ' — Modbus reconnecting' : ''}` : '✗ Failed')
        } catch {
            setMsg('✗ Network error')
        }
        setTimeout(() => setMsg(null), 4000)
    }

    const inputStyle = {
        background: 'var(--surface2)',
        border: '1px solid var(--border2)',
        borderRadius: 4,
        color: 'var(--text-bright)',
        fontFamily: 'var(--mono)',
        fontSize: 13,
        padding: '6px 10px',
        width: '100%',
    }

    return (
        <div className="fade-in" style={{ padding: 20 }}>
            <h1 style={{ fontFamily: 'var(--head)', fontSize: 16, color: 'var(--text-bright)', marginBottom: 20, letterSpacing: 2 }}>Config</h1>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                {/* Connection Status */}
                <Card title="Connection Status">
                    {[
                        ['Status', modbusStatus.connected ? '🟢 CONNECTED' : '🔴 OFFLINE'],
                        ['Errors', modbusStatus.error_count],
                        ['Port', modbusStatus.port || '—'],
                        ['Baudrate', modbusStatus.baudrate || '—'],
                        ['Slave ID', modbusStatus.slave_id || '—'],
                        ['Poll Time', modbusStatus.poll_time ? `${modbusStatus.poll_time}s` : '—'],
                        ['Last Read', modbusStatus.last_success ? new Date(modbusStatus.last_success).toLocaleTimeString('en-GB') : 'never'],
                    ].map(([k, v]) => (
                        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                            <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-dim)' }}>{k}</span>
                            <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-bright)' }}>{v}</span>
                        </div>
                    ))}
                </Card>

                {/* Edit Settings */}
                <Card title="Edit Settings">
                    {[
                        { key: 'PORT', label: 'Serial Port', type: 'text' },
                        { key: 'BAUDRATE', label: 'Baudrate', type: 'number' },
                        { key: 'SLAVE_ID', label: 'Slave ID', type: 'number' },
                        { key: 'POLL_TIME', label: 'Poll Time (s)', type: 'number' },
                    ].map(f => (
                        <div key={f.key} style={{ marginBottom: 12 }}>
                            <label style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-dim)', letterSpacing: 1, display: 'block', marginBottom: 4 }}>{f.label}</label>
                            <input
                                id={`config-${f.key}`}
                                type={f.type}
                                value={form[f.key]}
                                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                                style={inputStyle}
                            />
                        </div>
                    ))}

                    <button
                        id="apply-config"
                        onClick={applyConfig}
                        style={{
                            background: 'var(--accent)',
                            border: 'none',
                            borderRadius: 4,
                            color: '#fff',
                            fontFamily: 'var(--head)',
                            fontSize: 12,
                            letterSpacing: 1,
                            padding: '10px 20px',
                            cursor: 'pointer',
                            width: '100%',
                            transition: 'opacity 0.2s',
                        }}
                    >
                        APPLY CONFIG
                    </button>

                    {msg && (
                        <div style={{
                            marginTop: 10,
                            fontFamily: 'var(--mono)',
                            fontSize: 11,
                            color: msg.startsWith('✓') ? 'var(--accent2)' : 'var(--warn)',
                            padding: '6px 10px',
                            background: msg.startsWith('✓') ? 'rgba(61,232,192,0.08)' : 'rgba(255,69,96,0.08)',
                            border: `1px solid ${msg.startsWith('✓') ? 'var(--accent2)' : 'var(--warn)'}`,
                            borderRadius: 4,
                        }}>
                            {msg}
                        </div>
                    )}
                </Card>
            </div>

            {/* Data Export */}
            <Card title="Data Export" style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button
                        id="export-csv"
                        onClick={() => window.open('/api/export/csv', '_blank')}
                        style={{
                            background: 'rgba(61,232,192,0.1)',
                            border: '1px solid var(--accent2)',
                            borderRadius: 4,
                            color: 'var(--accent2)',
                            fontFamily: 'var(--head)',
                            fontSize: 11,
                            letterSpacing: 1,
                            padding: '8px 16px',
                            cursor: 'pointer',
                        }}
                    >
                        EXPORT CSV
                    </button>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-dim)' }}>
                        Downloads ems_log.csv — all historical readings
                    </span>
                </div>
            </Card>

            {/* Register Map */}
            <Card title="Register Map Reference">
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                {['Address', 'Name', 'Unit', 'Group'].map(h => (
                                    <th key={h} style={{
                                        textAlign: 'left',
                                        padding: '6px 12px',
                                        fontFamily: 'var(--mono)',
                                        fontSize: 10,
                                        color: 'var(--text-dim)',
                                        borderBottom: '1px solid var(--border2)',
                                        letterSpacing: 1,
                                    }}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {REGISTER_TABLE.map((row, i) => (
                                <tr key={i} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                                    <td style={tdStyle}>{row.addr}</td>
                                    <td style={{ ...tdStyle, color: 'var(--accent)' }}>{row.name}</td>
                                    <td style={{ ...tdStyle, color: 'var(--accent2)' }}>{row.unit}</td>
                                    <td style={tdStyle}>{row.group}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    )
}

const tdStyle = {
    padding: '6px 12px',
    fontFamily: 'var(--mono)',
    fontSize: 11,
    color: 'var(--text-mid)',
    borderBottom: '1px solid var(--border)',
}

function Card({ title, children, style }) {
    return (
        <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: 16,
            ...style,
        }}>
            <div style={{
                fontFamily: 'var(--head)',
                fontSize: 12,
                color: 'var(--accent)',
                letterSpacing: 2,
                textTransform: 'uppercase',
                marginBottom: 12,
                paddingBottom: 8,
                borderBottom: '1px solid var(--border)',
            }}>
                {title}
            </div>
            {children}
        </div>
    )
}
