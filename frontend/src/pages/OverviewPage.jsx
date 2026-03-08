import { useStore } from '../store/useStore'
import MetricCard from '../components/MetricCard'
import MiniChart from '../components/MiniChart'

const S = (v, d = 2) => v == null ? null : +v.toFixed(d)

export default function OverviewPage() {
    const { latest, simMode } = useStore()
    const d = latest || {}

    const gridTotalKW = S((d.grid_kw_r || 0) + (d.grid_kw_y || 0) + (d.grid_kw_b || 0))
    const loadTotalKW = S((d.load_kw_r || 0) + (d.load_kw_y || 0) + (d.load_kw_b || 0))
    const avgVolt = S(((d.volt_r || 0) + (d.volt_y || 0) + (d.volt_b || 0)) / 3)
    const avgFreq = S(((d.freq_r || 0) + (d.freq_y || 0) + (d.freq_b || 0)) / 3, 3)

    return (
        <div className="fade-in" style={{ padding: 20 }}>
            {simMode && (
                <div style={{
                    background: 'rgba(245,200,66,0.1)',
                    border: '1px solid var(--accent4)',
                    borderRadius: 6,
                    padding: '8px 16px',
                    marginBottom: 16,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                }}>
                    <span style={{ color: 'var(--accent4)', fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 700 }}>⚠ SIMULATION MODE</span>
                    <span style={{ color: 'var(--text-mid)', fontFamily: 'var(--body)', fontSize: 13 }}>No Modbus hardware detected — displaying synthetic data</span>
                </div>
            )}

            {/* System Summary */}
            <SectionTitle>System Summary</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
                <MetricCard label="Grid Total kW" value={gridTotalKW} unit="kW" color="#4da6ff" />
                <MetricCard label="Load Total kW" value={loadTotalKW} unit="kW" color="#c084fc" />
                <MetricCard label="Avg Voltage" value={avgVolt} unit="V" color="#3de8c0" />
                <MetricCard label="Avg Frequency" value={avgFreq} unit="Hz" color="#f5c842" />
            </div>

            {/* Grid Currents with sparklines */}
            <SectionTitle>Grid Currents</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
                {[
                    { key: 'grid_i_r', label: 'Grid I-R', color: '#f7716a', phase: 'R' },
                    { key: 'grid_i_y', label: 'Grid I-Y', color: '#f5c842', phase: 'Y' },
                    { key: 'grid_i_b', label: 'Grid I-B', color: '#4da6ff', phase: 'B' },
                    { key: 'grid_i_n', label: 'Grid I-N', color: '#c084fc', phase: 'N' },
                ].map(({ key, label, color }) => (
                    <div key={key} style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius)',
                        padding: '12px 14px 8px',
                        position: 'relative',
                        overflow: 'hidden',
                    }}>
                        <div style={{
                            position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                            background: `linear-gradient(to right, ${color}, transparent)`,
                        }} />
                        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-dim)', letterSpacing: 1.5, marginBottom: 4 }}>{label}</div>
                        <div style={{ fontFamily: 'var(--head)', fontSize: 20, color: 'var(--text-bright)', fontWeight: 700 }}>
                            {d[key] != null ? d[key].toFixed(1) : '---'}
                            <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color, marginLeft: 4 }}>A</span>
                        </div>
                        <MiniChart dataKey={key} color={color} height={48} limit={40} />
                    </div>
                ))}
            </div>

            {/* Voltages & Frequency */}
            <SectionTitle>Voltages &amp; Frequency</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12, marginBottom: 20 }}>
                <MetricCard label="Volt R" value={d.volt_r} unit="V" color="#f7716a" />
                <MetricCard label="Volt Y" value={d.volt_y} unit="V" color="#f5c842" />
                <MetricCard label="Volt B" value={d.volt_b} unit="V" color="#4da6ff" />
                <MetricCard label="Freq R" value={d.freq_r} unit="Hz" color="#f7716a" />
                <MetricCard label="Freq Y" value={d.freq_y} unit="Hz" color="#f5c842" />
                <MetricCard label="Freq B" value={d.freq_b} unit="Hz" color="#4da6ff" />
            </div>

            {/* Power Factor — Grid */}
            <SectionTitle>Power Factor — Grid</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
                {[
                    { key: 'grid_pf_r', label: 'Grid PF-R', color: '#f7716a' },
                    { key: 'grid_pf_y', label: 'Grid PF-Y', color: '#f5c842' },
                    { key: 'grid_pf_b', label: 'Grid PF-B', color: '#4da6ff' },
                    { key: 'grid_pf_n', label: 'Grid PF-N', color: '#c084fc' },
                ].map(({ key, label, color }) => (
                    <MetricCard key={key} label={label} value={d[key]} unit="PF" color={color} alert={d[key] != null && d[key] < 0.85} />
                ))}
            </div>

            {/* THDi Grid */}
            <SectionTitle>THDi — Grid</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
                {[
                    { key: 'grid_thdi_r', label: 'THDi-R', color: '#f7716a' },
                    { key: 'grid_thdi_y', label: 'THDi-Y', color: '#f5c842' },
                    { key: 'grid_thdi_b', label: 'THDi-B', color: '#4da6ff' },
                    { key: 'grid_thdi_n', label: 'THDi-N', color: '#c084fc' },
                ].map(({ key, label, color }) => (
                    <MetricCard key={key} label={label} value={d[key]} unit="%" color={color} alert={d[key] != null && d[key] > 15} />
                ))}
            </div>

            {/* Temperature */}
            <SectionTitle>Temperature</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
                {[
                    { key: 'temp_j1', label: 'Temp J1', color: '#3de8c0' },
                    { key: 'temp_j2', label: 'Temp J2', color: '#7c6af7' },
                    { key: 'temp_j3', label: 'Temp J3', color: '#f7716a' },
                ].map(({ key, label, color }) => (
                    <MetricCard key={key} label={label} value={d[key]} unit="°C" color={color} alert={d[key] != null && d[key] > 70} />
                ))}
            </div>
        </div>
    )
}

function SectionTitle({ children }) {
    return (
        <div style={{
            fontFamily: 'var(--head)',
            fontSize: 11,
            color: 'var(--accent)',
            letterSpacing: 2,
            textTransform: 'uppercase',
            marginBottom: 10,
            paddingLeft: 8,
            borderLeft: '2px solid var(--accent)',
        }}>
            {children}
        </div>
    )
}
