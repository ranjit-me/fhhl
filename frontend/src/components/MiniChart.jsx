import { useStore } from '../store/useStore'
import {
    LineChart, Line, ResponsiveContainer, Tooltip, YAxis,
} from 'recharts'

export default function MiniChart({ dataKey, color = 'var(--accent)', height = 60, limit = 60 }) {
    const getHistory = useStore(s => s.getHistory)
    const data = getHistory(dataKey, limit)

    if (data.filter(d => d.v != null).length < 2) {
        return (
            <div style={{
                height,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-dim)',
                fontFamily: 'var(--mono)',
                fontSize: 10,
                letterSpacing: 1,
            }}>
                NO DATA
            </div>
        )
    }

    return (
        <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
                <YAxis domain={['auto', 'auto']} hide />
                <Tooltip
                    contentStyle={{
                        background: 'var(--surface2)',
                        border: '1px solid var(--border2)',
                        borderRadius: 4,
                        fontFamily: 'var(--mono)',
                        fontSize: 11,
                        color: 'var(--text-bright)',
                    }}
                    formatter={(val) => [val != null ? val.toFixed(3) : '---', dataKey]}
                    labelFormatter={() => ''}
                />
                <Line
                    type="monotone"
                    dataKey="v"
                    stroke={color}
                    strokeWidth={1.5}
                    dot={false}
                    isAnimationActive={false}
                    connectNulls
                />
            </LineChart>
        </ResponsiveContainer>
    )
}
