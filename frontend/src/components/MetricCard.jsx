export default function MetricCard({ label, value, unit, color = 'var(--accent)', sub, alert = false }) {
    const displayValue = value == null ? '---' : typeof value === 'number' ? value.toFixed(value < 10 ? 3 : value < 100 ? 2 : 1) : value

    return (
        <div style={{
            background: alert ? 'rgba(255,69,96,0.06)' : 'var(--surface)',
            border: alert ? '1px solid var(--warn)' : '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '14px 16px 12px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: alert ? '0 0 12px rgba(255,69,96,0.2)' : 'none',
            transition: 'box-shadow 0.3s',
        }}>
            {/* Top accent bar */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 2,
                background: alert
                    ? 'linear-gradient(to right, var(--warn), transparent)'
                    : `linear-gradient(to right, ${color}, transparent)`,
            }} />

            {/* Label */}
            <div style={{
                fontFamily: 'var(--mono)',
                fontSize: 10,
                color: 'var(--text-dim)',
                letterSpacing: 1.5,
                textTransform: 'uppercase',
                marginBottom: 8,
            }}>
                {label}
            </div>

            {/* Value */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{
                    fontFamily: 'var(--head)',
                    fontSize: 22,
                    fontWeight: 700,
                    color: alert ? 'var(--warn)' : 'var(--text-bright)',
                    lineHeight: 1,
                }}>
                    {displayValue}
                </span>
                <span style={{
                    fontFamily: 'var(--mono)',
                    fontSize: 11,
                    color: alert ? 'var(--warn)' : color,
                }}>
                    {unit}
                </span>
            </div>

            {/* Sub text */}
            {sub && (
                <div style={{
                    marginTop: 4,
                    fontFamily: 'var(--mono)',
                    fontSize: 9,
                    color: 'var(--text-dim)',
                }}>
                    {sub}
                </div>
            )}
        </div>
    )
}
