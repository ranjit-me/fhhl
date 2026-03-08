import { useState } from 'react'
import { useStore } from '../store/useStore'
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

const WINDOWS = [
    { label: '30s', value: 30 },
    { label: '60s', value: 60 },
    { label: '2m', value: 120 },
    { label: '5m', value: 300 },
    { label: '10m', value: 600 },
]

export default function TrendsPage() {
    const { history } = useStore()
    const [window, setWindow] = useState(60)

    const data = history.slice(-window).map(h => ({
        t: new Date(h.timestamp).toLocaleTimeString('en-GB'),
        ...h,
    }))

    const tooltipStyle = {
        contentStyle: {
            background: 'var(--surface2)',
            border: '1px solid var(--border2)',
            borderRadius: 4,
            fontFamily: 'var(--mono)',
            fontSize: 10,
            color: 'var(--text-bright)',
        },
        formatter: (v) => [v?.toFixed ? v.toFixed(3) : v, ''],
    }

    const charts = [
        {
            title: 'Grid Currents (A)',
            lines: [
                { key: 'grid_i_r', color: '#f7716a', label: 'I-R' },
                { key: 'grid_i_y', color: '#f5c842', label: 'I-Y' },
                { key: 'grid_i_b', color: '#4da6ff', label: 'I-B' },
                { key: 'grid_i_n', color: '#c084fc', label: 'I-N' },
            ],
        },
        {
            title: 'Voltages (V)',
            lines: [
                { key: 'volt_r', color: '#f7716a', label: 'V-R' },
                { key: 'volt_y', color: '#f5c842', label: 'V-Y' },
                { key: 'volt_b', color: '#4da6ff', label: 'V-B' },
            ],
        },
        {
            title: 'Grid THDi (%)',
            lines: [
                { key: 'grid_thdi_r', color: '#f7716a', label: 'THDi-R' },
                { key: 'grid_thdi_y', color: '#f5c842', label: 'THDi-Y' },
                { key: 'grid_thdi_b', color: '#4da6ff', label: 'THDi-B' },
                { key: 'grid_thdi_n', color: '#c084fc', label: 'THDi-N' },
            ],
        },
        {
            title: 'Grid Power Factor',
            lines: [
                { key: 'grid_pf_r', color: '#f7716a', label: 'PF-R' },
                { key: 'grid_pf_y', color: '#f5c842', label: 'PF-Y' },
                { key: 'grid_pf_b', color: '#4da6ff', label: 'PF-B' },
            ],
        },
        {
            title: 'Grid Active Power kW',
            lines: [
                { key: 'grid_kw_r', color: '#f7716a', label: 'kW-R' },
                { key: 'grid_kw_y', color: '#f5c842', label: 'kW-Y' },
                { key: 'grid_kw_b', color: '#4da6ff', label: 'kW-B' },
            ],
        },
        {
            title: 'Temperature (°C)',
            lines: [
                { key: 'temp_j1', color: '#3de8c0', label: 'J1' },
                { key: 'temp_j2', color: '#7c6af7', label: 'J2' },
                { key: 'temp_j3', color: '#f7716a', label: 'J3' },
            ],
        },
    ]

    return (
        <div className="fade-in" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                <h1 style={{ fontFamily: 'var(--head)', fontSize: 16, color: 'var(--text-bright)', letterSpacing: 2 }}>Trends</h1>
                <div style={{ display: 'flex', gap: 6 }}>
                    {WINDOWS.map(w => (
                        <button
                            key={w.value}
                            id={`window-${w.label}`}
                            onClick={() => setWindow(w.value)}
                            style={{
                                padding: '4px 12px',
                                background: window === w.value ? 'rgba(124,106,247,0.2)' : 'var(--surface)',
                                border: `1px solid ${window === w.value ? 'var(--accent)' : 'var(--border)'}`,
                                borderRadius: 4,
                                color: window === w.value ? 'var(--accent)' : 'var(--text-mid)',
                                fontFamily: 'var(--mono)',
                                fontSize: 11,
                                cursor: 'pointer',
                                transition: 'all 0.15s',
                            }}
                        >
                            {w.label}
                        </button>
                    ))}
                </div>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-dim)' }}>
                    {data.length} pts
                </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {charts.map(({ title, lines }) => (
                    <div key={title} style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius)',
                        padding: '14px',
                    }}>
                        <div style={{ fontFamily: 'var(--head)', fontSize: 11, color: 'var(--text-mid)', letterSpacing: 1, marginBottom: 10 }}>{title}</div>
                        <ResponsiveContainer width="100%" height={160}>
                            <LineChart data={data} margin={{ top: 0, right: 10, bottom: 0, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                <XAxis dataKey="t" tick={{ fontFamily: 'var(--mono)', fontSize: 9, fill: 'var(--text-dim)' }} interval="preserveStartEnd" />
                                <YAxis tick={{ fontFamily: 'var(--mono)', fontSize: 9, fill: 'var(--text-dim)' }} domain={['auto', 'auto']} />
                                <Tooltip {...tooltipStyle} />
                                <Legend wrapperStyle={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-mid)' }} />
                                {lines.map(l => (
                                    <Line
                                        key={l.key}
                                        type="monotone"
                                        dataKey={l.key}
                                        name={l.label}
                                        stroke={l.color}
                                        strokeWidth={1.5}
                                        dot={false}
                                        isAnimationActive={false}
                                        connectNulls
                                    />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                ))}
            </div>
        </div>
    )
}
