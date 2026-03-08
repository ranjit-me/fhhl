"""
ModbusReader — handles RTU connection, float32 CDAB decode, batch reads,
graceful reconnect. NO simulation mode — only real hardware data.
"""

import struct
from typing import Optional, Dict

from config import Settings, REGISTER_MAP


class ModbusReader:
    def __init__(self, settings: Settings):
        self.settings = settings
        self._client = None
        self._connected = False

        try:
            from pymodbus.client import ModbusSerialClient
            self._ModbusSerialClient = ModbusSerialClient
        except ImportError:
            print("[MODBUS] pymodbus not installed — install with: pip3 install pymodbus pyserial")
            self._ModbusSerialClient = None

    # ─── Connection ───────────────────────────────────────────────────────────
    def ensure_connected(self) -> bool:
        if self._ModbusSerialClient is None:
            return False
        if self._client and self._client.is_socket_open():
            return True
        return self._connect()

    def _connect(self) -> bool:
        try:
            if self._client:
                try:
                    self._client.close()
                except Exception:
                    pass

            self._client = self._ModbusSerialClient(
                port=self.settings.PORT,
                baudrate=self.settings.BAUDRATE,
                parity=self.settings.PARITY,
                stopbits=self.settings.STOPBITS,
                bytesize=self.settings.BYTESIZE,
                timeout=self.settings.TIMEOUT,
            )
            result = self._client.connect()
            if result:
                self._connected = True
                print(f"[MODBUS] Connected to {self.settings.PORT}")
            else:
                self._connected = False
                print(f"[MODBUS] Cannot connect to {self.settings.PORT} — waiting for device")
            return result
        except Exception as e:
            self._connected = False
            print(f"[MODBUS] Connection error: {e}")
            return False

    def close(self):
        if self._client:
            try:
                self._client.close()
            except Exception:
                pass
            self._client = None
        self._connected = False

    def update_settings(self, settings: Settings):
        self.settings = settings
        self._connected = False

    # ─── Float32 CDAB Decode ──────────────────────────────────────────────────
    @staticmethod
    def _decode_float32_cdab(regs) -> float:
        """
        CDAB byte order (most common for energy meters).
        regs[0] = high word (CD), regs[1] = low word (AB)
        """
        raw = struct.pack(">HH", regs[1], regs[0])
        return round(struct.unpack(">f", raw)[0], 3)

    # ─── Batch Read (faster — one request per contiguous block) ──────────────
    def _batch_read(self) -> Dict[str, Optional[float]]:
        """Read all registers in minimal batches by contiguous address ranges."""
        result = {}

        # Build sorted list of (name, address)
        items = sorted(
            [(name, addr) for name, (addr, *_) in REGISTER_MAP.items()],
            key=lambda x: x[1]
        )

        # Group into contiguous blocks (gap <= 10 registers)
        blocks = []
        block_start = None
        block_names = []
        prev_addr = None

        for name, addr in items:
            if prev_addr is None or (addr - prev_addr) > 10:
                if block_names:
                    blocks.append((block_start, block_names))
                block_start = addr
                block_names = [(name, addr)]
            else:
                block_names.append((name, addr))
            prev_addr = addr

        if block_names:
            blocks.append((block_start, block_names))

        for block_base_addr, block_items in blocks:
            last_addr = block_items[-1][1]
            count = (last_addr - block_base_addr) + 2  # +2 for float32

            offset = block_base_addr - 40001
            try:
                res = self._client.read_holding_registers(
                    address=offset,
                    count=count,
                    slave=self.settings.SLAVE_ID,
                )
                if res.isError():
                    for name, _ in block_items:
                        result[name] = None
                    continue

                for name, addr in block_items:
                    rel = addr - block_base_addr
                    if rel + 1 < len(res.registers):
                        try:
                            result[name] = self._decode_float32_cdab(
                                [res.registers[rel], res.registers[rel + 1]]
                            )
                        except Exception:
                            result[name] = None
                    else:
                        result[name] = None

            except Exception as e:
                print(f"[MODBUS] Batch read error: {e}")
                for name, _ in block_items:
                    result[name] = None

        return result

    # ─── Public API ───────────────────────────────────────────────────────────
    def read_all(self) -> Optional[Dict]:
        """Returns real register data, or None if not connected."""
        if not self._connected:
            return None
        try:
            return self._batch_read()
        except Exception as e:
            print(f"[MODBUS] read_all error: {e}")
            self._connected = False
            return None
