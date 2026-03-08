import { useStore } from '../store/useStore'
import PhaseTable from '../components/PhaseTable'
import MiniChart from '../components/MiniChart'

export default function GridPage() {
    const { latest } = useStore()
    const d = latest || {}

    const tables = [
        {
            title: 'Grid Current', unit: 'A', color: '#f7716a',
            rows: [{ phase: 'R', value: d.grid_i_r }, { phase: 'Y', value: d.grid_i_y }, { phase: 'B', value: d.grid_i_b }, { phase: 'N', value: d.grid_i_n }],
        },
        {
            title: 'Grid THDi', unit: '%', color: '#f5c842',
            rows: [{ phase: 'R', value: d.grid_thdi_r }, { phase: 'Y', value: d.grid_thdi_y }, { phase: 'B', value: d.grid_thdi_b }, { phase: 'N', value: d.grid_thdi_n }],
        },
        {
            title: 'Voltage', unit: 'V', color: '#3de8c0',
            rows: [{ phase: 'R', value: d.volt_r }, { phase: 'Y', value: d.volt_y }, { phase: 'B', value: d.volt_b }],
        },
        {
            title: 'Frequency', unit: 'Hz', color: '#4da6ff',
            rows: [{ phase: 'R', value: d.freq_r }, { phase: 'Y', value: d.freq_y }, { phase: 'B', value: d.freq_b }],
        },
        {
            title: 'Grid Power Factor', unit: 'PF', color: '#c084fc',
            rows: [{ phase: 'R', value: d.grid_pf_r }, { phase: 'Y', value: d.grid_pf_y }, { phase: 'B', value: d.grid_pf_b }, { phase: 'N', value: d.grid_pf_n }],
        },
        {
            title: 'Grid kW', unit: 'kW', color: '#4da6ff',
            rows: [{ phase: 'R', value: d.grid_kw_r }, { phase: 'Y', value: d.grid_kw_y }, { phase: 'B', value: d.grid_kw_b }],
        },
        {
            title: 'Grid kVAr', unit: 'kVAr', color: '#f7716a',
            rows: [{ phase: 'R', value: d.grid_kvar_r }, { phase: 'Y', value: d.grid_kvar_y }, { phase: 'B', value: d.grid_kvar_b }],
        },
        {
            title: 'Grid kVA', unit: 'kVA', color: '#3de8c0',
            rows: [{ phase: 'R', value: d.grid_kva_r }, { phase: 'Y', value: d.grid_kva_y }, { phase: 'B', value: d.grid_kva_b }],
        },
        {
            title: 'THDu', unit: '%', color: '#f5c842',
            rows: [{ phase: 'R', value: d.thdu_r }, { phase: 'Y', value: d.thdu_y }, { phase: 'B', value: d.thdu_b }],
        },
    ]

    return (
        <div className="fade-in" style={{ padding: 20 }}>
            <PageTitle>Grid Side</PageTitle>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
                {tables.map(t => <PhaseTable key={t.title} {...t} />)}
            </div>

            <SectionTitle>Live Sparklines</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {[
                    { key: 'grid_i_r', label: 'Grid I-R', color: '#f7716a' },
                    { key: 'grid_i_y', label: 'Grid I-Y', color: '#f5c842' },
                    { key: 'grid_i_b', label: 'Grid I-B', color: '#4da6ff' },
                    { key: 'volt_r', label: 'Volt R', color: '#f7716a' },
                    { key: 'volt_y', label: 'Volt Y', color: '#f5c842' },
                    { key: 'volt_b', label: 'Volt B', color: '#4da6ff' },
                ].map(({ key, label, color }) => (
                    <div key={key} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '10px 12px' }}>
                        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-dim)', marginBottom: 4, letterSpacing: 1 }}>{label}</div>
                        <MiniChart dataKey={key} color={color} height={70} limit={60} />
                    </div>
                ))}
            </div>
        </div>
    )
}

function PageTitle({ children }) {
    return <h1 style={{ fontFamily: 'var(--head)', fontSize: 16, color: 'var(--text-bright)', marginBottom: 16, letterSpacing: 2 }}>{children}</h1>
}

function SectionTitle({ children }) {
    return (
        <div style={{
            fontFamily: 'var(--head)', fontSize: 11, color: 'var(--accent)',
            letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10,
            paddingLeft: 8, borderLeft: '2px solid var(--accent)',
        }}>
            {children}
        </div>
    )
}
