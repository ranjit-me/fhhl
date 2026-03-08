const PHASE_COLORS = { R: '#f7716a', Y: '#f5c842', B: '#4da6ff', N: '#c084fc', J1: '#3de8c0', J2: '#7c6af7', J3: '#f7716a' }

export default function PhaseTable({ title, rows, unit, color = 'var(--accent)' }) {
    return (
        <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            overflow: 'hidden',
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderLeft: `3px solid ${color}`,
                background: 'var(--surface2)',
                borderBottom: '1px solid var(--border)',
            }}>
                <span style={{
                    fontFamily: 'var(--mono)',
                    fontSize: 11,
                    color: 'var(--text-mid)',
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                }}>
                    {title}
                </span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: color }}>{unit}</span>
            </div>

            {/* Rows */}
            {rows.map(({ phase, value }) => {
                const phaseColor = PHASE_COLORS[phase] || color
                const displayVal = value == null ? '---' : typeof value === 'number'
                    ? value.toFixed(value < 10 ? 3 : value < 100 ? 2 : 1) : value

                return (
                    <div key={phase} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '7px 12px',
                        borderBottom: '1px solid var(--border)',
                    }}>
                        {/* Phase badge */}
                        <div style={{
                            width: 22,
                            height: 22,
                            borderRadius: 4,
                            background: `${phaseColor}20`,
                            border: `1px solid ${phaseColor}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontFamily: 'var(--mono)',
                            fontSize: 10,
                            fontWeight: 700,
                            color: phaseColor,
                        }}>
                            {phase}
                        </div>

                        {/* Value */}
                        <span style={{
                            fontFamily: 'var(--mono)',
                            fontSize: 14,
                            color: value == null ? 'var(--text-dim)' : 'var(--text-bright)',
                        }}>
                            {displayVal}
                        </span>
                    </div>
                )
            })}
        </div>
    )
}
