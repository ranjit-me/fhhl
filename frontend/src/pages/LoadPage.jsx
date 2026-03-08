import { useStore } from '../store/useStore'
import PhaseTable from '../components/PhaseTable'
import MiniChart from '../components/MiniChart'

export default function LoadPage() {
    const { latest } = useStore()
    const d = latest || {}

    const tables = [
        {
            title: 'Load Current', unit: 'A', color: '#f7716a',
            rows: [{ phase: 'R', value: d.load_i_r }, { phase: 'Y', value: d.load_i_y }, { phase: 'B', value: d.load_i_b }, { phase: 'N', value: d.load_i_n }],
        },
        {
            title: 'Load THDi', unit: '%', color: '#f5c842',
            rows: [{ phase: 'R', value: d.load_thdi_r }, { phase: 'Y', value: d.load_thdi_y }, { phase: 'B', value: d.load_thdi_b }, { phase: 'N', value: d.load_thdi_n }],
        },
        {
            title: 'Load Power Factor', unit: 'PF', color: '#c084fc',
            rows: [{ phase: 'R', value: d.load_pf_r }, { phase: 'Y', value: d.load_pf_y }, { phase: 'B', value: d.load_pf_b }, { phase: 'N', value: d.load_pf_n }],
        },
        {
            title: 'Load kW', unit: 'kW', color: '#4da6ff',
            rows: [{ phase: 'R', value: d.load_kw_r }, { phase: 'Y', value: d.load_kw_y }, { phase: 'B', value: d.load_kw_b }],
        },
        {
            title: 'Load kVAr', unit: 'kVAr', color: '#f7716a',
            rows: [{ phase: 'R', value: d.load_kvar_r }, { phase: 'Y', value: d.load_kvar_y }, { phase: 'B', value: d.load_kvar_b }],
        },
        {
            title: 'Load kVA', unit: 'kVA', color: '#3de8c0',
            rows: [{ phase: 'R', value: d.load_kva_r }, { phase: 'Y', value: d.load_kva_y }, { phase: 'B', value: d.load_kva_b }],
        },
        {
            title: 'Comp Current', unit: 'A', color: '#7c6af7',
            rows: [{ phase: 'R', value: d.comp_cur_r }, { phase: 'Y', value: d.comp_cur_y }, { phase: 'B', value: d.comp_cur_b }],
        },
        {
            title: 'Comp Rate', unit: '%', color: '#3de8c0',
            rows: [{ phase: 'R', value: d.comp_rate_r }, { phase: 'Y', value: d.comp_rate_y }, { phase: 'B', value: d.comp_rate_b }],
        },
    ]

    return (
        <div className="fade-in" style={{ padding: 20 }}>
            <h1 style={{ fontFamily: 'var(--head)', fontSize: 16, color: 'var(--text-bright)', marginBottom: 16, letterSpacing: 2 }}>Load Side</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
                {tables.map(t => <PhaseTable key={t.title} {...t} />)}
            </div>

            <div style={{
                fontFamily: 'var(--head)', fontSize: 11, color: 'var(--accent)',
                letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10,
                paddingLeft: 8, borderLeft: '2px solid var(--accent)',
            }}>
                Comp Rate Trends
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {[
                    { key: 'comp_rate_r', label: 'Comp Rate R', color: '#f7716a' },
                    { key: 'comp_rate_y', label: 'Comp Rate Y', color: '#f5c842' },
                    { key: 'comp_rate_b', label: 'Comp Rate B', color: '#4da6ff' },
                ].map(({ key, label, color }) => (
                    <div key={key} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '10px 12px' }}>
                        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-dim)', marginBottom: 4, letterSpacing: 1 }}>{label}</div>
                        <MiniChart dataKey={key} color={color} height={70} limit={64} />
                    </div>
                ))}
            </div>
        </div>
    )
}
