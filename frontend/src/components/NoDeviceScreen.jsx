import { useStore } from '../store/useStore'

export default function NoDeviceScreen() {
    const { modbusStatus } = useStore()

    return (
        <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            gap: 24,
            padding: 40,
        }}>
            {/* Pulsing icon */}
            <div style={{ position: 'relative' }}>
                <div style={{
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    border: '2px solid #f7716a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: 'glow-pulse 2s ease-in-out infinite',
                    boxShadow: '0 0 30px rgba(247,113,106,0.2)',
                }}>
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                        <circle cx="24" cy="24" r="10" stroke="#f7716a" strokeWidth="2" />
                        <path d="M24 8 L24 4M24 44 L24 40M8 24 L4 24M44 24 L40 24" stroke="#f7716a" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
                        <path d="M12 12 L9 9M39 9 L36 12M36 36 L39 39M9 39 L12 36" stroke="#f7716a" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
                        <circle cx="24" cy="24" r="4" fill="#f7716a" opacity="0.6" />
                    </svg>
                </div>
                {/* Outer ring pulse */}
                <div style={{
                    position: 'absolute',
                    inset: -12,
                    borderRadius: '50%',
                    border: '1px solid rgba(247,113,106,0.3)',
                    animation: 'glow-pulse 2s ease-in-out infinite reverse',
                }} />
            </div>

            {/* Title */}
            <div style={{ textAlign: 'center' }}>
                <div style={{
                    fontFamily: 'var(--head)',
                    fontSize: 20,
                    color: '#f7716a',
                    letterSpacing: 3,
                    marginBottom: 8,
                }}>
                    NO DEVICE CONNECTED
                </div>
                <div style={{
                    fontFamily: 'var(--body)',
                    fontSize: 15,
                    color: 'var(--text-mid)',
                    maxWidth: 420,
                    lineHeight: 1.6,
                }}>
                    Waiting for Modbus RTU energy meter on
                    <span style={{ fontFamily: 'var(--mono)', color: 'var(--accent)', margin: '0 6px' }}>
                        {modbusStatus.port || 'COM9'}
                    </span>
                    at
                    <span style={{ fontFamily: 'var(--mono)', color: 'var(--accent)', margin: '0 6px' }}>
                        {modbusStatus.baudrate || 9600} baud
                    </span>
                </div>
            </div>

            {/* Steps */}
            <div style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                padding: '20px 24px',
                maxWidth: 480,
                width: '100%',
            }}>
                <div style={{ fontFamily: 'var(--head)', fontSize: 11, color: 'var(--accent)', letterSpacing: 2, marginBottom: 14 }}>
                    HOW TO CONNECT
                </div>
                {[
                    ['1', 'Plug in your RS485/USB serial adapter to this computer'],
                    ['2', 'Connect the adapter to your energy meter (RS485 A/B terminals)'],
                    ['3', 'Go to Config page and update the Serial Port to your adapter (e.g. /dev/tty.usbserial-XXXX on Mac)'],
                    ['4', 'Click APPLY CONFIG — the dashboard will connect automatically'],
                ].map(([num, text]) => (
                    <div key={num} style={{ display: 'flex', gap: 12, marginBottom: 10, alignItems: 'flex-start' }}>
                        <div style={{
                            width: 22, height: 22,
                            borderRadius: '50%',
                            background: 'rgba(124,106,247,0.15)',
                            border: '1px solid var(--accent)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                            fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--accent)',
                        }}>
                            {num}
                        </div>
                        <span style={{ fontFamily: 'var(--body)', fontSize: 13, color: 'var(--text-mid)', lineHeight: 1.5 }}>{text}</span>
                    </div>
                ))}
            </div>

            {/* Retry indicator */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontFamily: 'var(--mono)',
                fontSize: 11,
                color: 'var(--text-dim)',
            }}>
                <div style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: '#f7716a',
                    animation: 'blink 1.5s ease-in-out infinite',
                }} />
                Retrying connection every second...
            </div>
        </div>
    )
}
