import { useEffect } from 'react'
import { useStore } from './store/useStore'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import NoDeviceScreen from './components/NoDeviceScreen'
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
    const { connectWS, activePage, modbusStatus } = useStore()

    useEffect(() => {
        connectWS()
    }, [])

    const Page = PAGE_MAP[activePage] || OverviewPage
    // Config page is always accessible so user can fix port settings
    const deviceConnected = modbusStatus.connected
    const showNoDevice = !deviceConnected && activePage !== 'config'

    return (
        <>
            <div className="scanline" />
            <Header />
            <div style={{ display: 'flex', height: 'calc(100vh - 56px)', overflow: 'hidden' }}>
                <Sidebar />
                <main style={{ flex: 1, overflowY: 'auto', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
                    {showNoDevice ? <NoDeviceScreen /> : <Page />}
                </main>
            </div>
        </>
    )
}
