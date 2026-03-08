import { useEffect } from 'react'
import { useStore } from './store/useStore'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import OverviewPage from './pages/OverviewPage'
import GridPage from './pages/GridPage'
import LoadPage from './pages/LoadPage'
import PowerPage from './pages/PowerPage'
import TrendsPage from './pages/TrendsPage'
import ConfigPage from './pages/ConfigPage'

const PAGE_MAP = {
    overview: OverviewPage,
    grid: GridPage,
    load: LoadPage,
    power: PowerPage,
    trends: TrendsPage,
    config: ConfigPage,
}

export default function App() {
    const { connectWS, activePage } = useStore()

    useEffect(() => {
        connectWS()
    }, [])

    const Page = PAGE_MAP[activePage] || OverviewPage

    return (
        <>
            <div className="scanline" />
            <Header />
            <div style={{ display: 'flex', height: 'calc(100vh - 56px)', overflow: 'hidden' }}>
                <Sidebar />
                <main style={{ flex: 1, overflowY: 'auto', background: 'var(--bg)' }}>
                    <Page />
                </main>
            </div>
        </>
    )
}
