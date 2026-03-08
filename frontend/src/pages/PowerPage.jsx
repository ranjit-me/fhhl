import { useStore } from '../store/useStore'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import MetricCard from '../components/MetricCard'

export default function PowerPage() {
    const { latest } = useStore()
    const d = latest || {}

    const kwData = [
        { phase: 'R', Grid: d.grid_kw_r, Load: d.load_kw_r },
        { phase: 'Y', Grid: d.grid_kw_y, Load: d.load_kw_y },
        { phase: 'B', Grid: d.grid_kw_b, Load: d.load_kw_b },
    ]
    const kvarData = [
        { phase: 'R', Grid: d.grid_kvar_r, Load: d.load_kvar_r },
        { phase: 'Y', Grid: d.grid_kvar_y, Load: d.load_kvar_y },
        { phase: 'B', Grid: d.grid_kvar_b, Load: d.load_kvar_b },
    ]
    const kvaData = [
        { phase: 'R', Grid: d.grid_kva_r, Load: d.load_kva_r },
        { phase: 'Y', Grid: d.grid_kva_y, Load: d.load_kva_y },
        { phase: 'B', Grid: d.grid_kva_b, Load: d.load_kva_b },
    ]

    const tooltipStyle = {
        contentStyle: {
            background: 'var(--surface2)',
            border: '1px solid var(--border2)',
            borderRadius: 4,
            fontFamily: 'var(--mono)',
            fontSize: 11,
            color: 'var(--text-bright)',
        },
    }

    return (
        <div className="fade-in" style={{ padding: 20 }}>
            <h1 style={{ fontFamily: 'var(--head)', fontSize: 16, color: 'var(--text-bright)', marginBottom: 16, letterSpacing: 2 }}>Power</h1>

            {/* Summary row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10, marginBottom: 24 }}>
                <MetricCard label="GRID kW-R" value={d.grid_kw_r} unit="kW" color="#4da6ff" />
                <MetricCard label="LOAD kW-R" value={d.load_kw_r} unit="kW" color="#f7716a" />
                <MetricCard label="GRID kW-Y" value={d.grid_kw_y} unit="kW" color="#4da6ff" />
                <MetricCard label="LOAD kW-Y" value={d.load_kw_y} unit="kW" color="#f5c842" />
                <MetricCard label="GRID kW-B" value={d.grid_kw_b} unit="kW" color="#4da6ff" />
                <MetricCard label="LOAD kW-B" value={d.load_kw_b} unit="kW" color="#c084fc" />
            </div>

            {/* Bar charts */}
            {[
                { title: 'Active Power kW per Phase', data: kwData, units: 'kW', colors: ['#4da6ff', '#f5c842'] },
                { title: 'Reactive Power kVAr per Phase', data: kvarData, units: 'kVAr', colors: ['#f7716a', '#c084fc'] },
                { title: 'Apparent Power kVA per Phase', data: kvaData, units: 'kVA', colors: ['#3de8c0', '#7c6af7'] },
            ].map(({ title, data, units, colors }) => (
                <div key={title} style={{
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)', padding: '16px', marginBottom: 16,
                }}>
                    <div style={{ fontFamily: 'var(--head)', fontSize: 12, color: 'var(--text-mid)', letterSpacing: 1, marginBottom: 12 }}>{title}</div>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={data} margin={{ top: 4, right: 20, bottom: 4, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis dataKey="phase" tick={{ fontFamily: 'var(--mono)', fontSize: 12, fill: 'var(--text-mid)' }} />
                            <YAxis tick={{ fontFamily: 'var(--mono)', fontSize: 10, fill: 'var(--text-dim)' }} unit={` ${units}`} />
                            <Tooltip {...tooltipStyle} formatter={(v) => [v?.toFixed(3), '']} />
                            <Legend wrapperStyle={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-mid)' }} />
                            <Bar dataKey="Grid" fill={colors[0]} radius={[3, 3, 0, 0]} />
                            <Bar dataKey="Load" fill={colors[1]} radius={[3, 3, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            ))}
        </div>
    )
}
