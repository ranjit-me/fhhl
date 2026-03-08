import { create } from 'zustand'

const WS_URL = 'ws://localhost:8000/ws'
const RECONNECT_DELAY = 3000

export const useStore = create((set, get) => ({
    wsStatus: 'connecting',
    modbusStatus: {
        connected: false,
        last_success: null,
        error_count: 0,
        port: 'COM9',
        baudrate: 9600,
        slave_id: 1,
        poll_time: 1.0,
    },
    simMode: false,
    latest: null,
    history: [],
    activePage: 'overview',
    _ws: null,
    _reconnectTimer: null,

    setActivePage: (page) => set({ activePage: page }),

    connectWS: () => {
        const { _ws, _reconnectTimer } = get()
        if (_reconnectTimer) clearTimeout(_reconnectTimer)
        if (_ws && _ws.readyState === WebSocket.OPEN) return

        set({ wsStatus: 'connecting' })
        const ws = new WebSocket(WS_URL)

        ws.onopen = () => {
            set({ wsStatus: 'open', _ws: ws })
            ws._pingInterval = setInterval(() => {
                if (ws.readyState === WebSocket.OPEN) ws.send('ping')
            }, 30000)
        }

        ws.onmessage = (evt) => {
            try {
                const msg = JSON.parse(evt.data)
                get()._handleMessage(msg)
            } catch (e) { console.error('[WS] Parse error', e) }
        }

        ws.onclose = () => {
            if (ws._pingInterval) clearInterval(ws._pingInterval)
            set({ wsStatus: 'closed' })
            const timer = setTimeout(() => get().connectWS(), RECONNECT_DELAY)
            set({ _reconnectTimer: timer })
        }

        ws.onerror = () => { set({ wsStatus: 'error' }) }
        set({ _ws: ws })
    },

    _handleMessage: (msg) => {
        switch (msg.type) {
            case 'init':
                set({
                    history: msg.history || [],
                    modbusStatus: msg.status || get().modbusStatus,
                    simMode: msg.status?.connected === false,
                })
                break
            case 'reading':
                set((state) => {
                    const newEntry = { timestamp: msg.timestamp, ...msg.data }
                    const history = [...state.history, newEntry].slice(-3600)
                    return {
                        latest: msg.data,
                        history,
                        modbusStatus: msg.status || state.modbusStatus,
                        simMode: false,
                    }
                })
                break
            case 'disconnected':
                set((state) => ({ modbusStatus: msg.status || state.modbusStatus, simMode: true }))
                break
            case 'error':
                set((state) => ({ modbusStatus: msg.status || state.modbusStatus }))
                break
        }
    },

    getHistory: (key, limit = 60) => {
        return get().history.slice(-limit).map((h) => ({ t: h.timestamp, v: h[key] ?? null }))
    },
}))
