"""
ModbusReader — handles RTU connection, float32 CDAB decode, batch reads,
graceful reconnect, and simulated data mode (when no hardware present).
"""

import struct
import time
import random
import math
from typing import Optional, Dict

from config import Settings, REGISTER_MAP


class ModbusReader:
    def __init__(self, settings: Settings):
        self.settings = settings
        self._client = None
        self._sim_mode = False      # auto-enabled if pymodbus missing or connect fails
        self._sim_t = 0.0           # time counter for simulation

        try:
            from pymodbus.client import ModbusSerialClient
            self._ModbusSerialClient = ModbusSerialClient
        except ImportError:
            print("[MODBUS] pymodbus not installed — enabling SIMULATION mode")
            self._sim_mode = True
            self._ModbusSerialClient = None

    # ─── Connection ───────────────────────────────────────────────────────────
    def ensure_connected(self) -> bool:
        if self._sim_mode:
            return True
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
                print(f"[MODBUS] Connected to {self.settings.PORT}")
            else:
                print(f"[MODBUS] Failed to connect to {self.settings.PORT} — using SIMULATION")
                self._sim_mode = True
            return result
        except Exception as e:
            print(f"[MODBUS] Connection error: {e} — using SIMULATION")
            self._sim_mode = True
            return False

    def close(self):
        if self._client:
            try:
                self._client.close()
            except Exception:
                pass
            self._client = None

    def update_settings(self, settings: Settings):
        self.settings = settings
        self._sim_mode = False

    # ─── Float32 CDAB Decode ──────────────────────────────────────────────────
    @staticmethod
    def _decode_float32_cdab(regs) -> float:
        """
        CDAB byte order (most common for energy meters).
        regs[0] = high word (CD), regs[1] = low word (AB)
        pack as ">HH" then unpack as ">f"
        """
        raw = struct.pack(">HH", regs[1], regs[0])
        return round(struct.unpack(">f", raw)[0], 3)

    # ─── Single Register Read ─────────────────────────────────────────────────
    def _read_float32(self, reg_400xx: int) -> Optional[float]:
        address = reg_400xx - 40001
        try:
            res = self._client.read_holding_registers(
                address=address,
                count=2,
                slave=self.settings.SLAVE_ID,
            )
            if res.isError():
                return None
            return self._decode_float32_cdab(res.registers)
        except Exception as e:
            print(f"[MODBUS] Read error at {reg_400xx}: {e}")
            return None

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

    # ─── Simulation Mode ──────────────────────────────────────────────────────
    def _simulate(self) -> Dict[str, float]:
        t = self._sim_t
        self._sim_t += self.settings.POLL_TIME

        def noisy(base, amp=0.05, freq=0.1):
            return round(base + amp * base * math.sin(freq * t) + random.uniform(-0.002, 0.002) * base, 3)

        return {
            "grid_i_r": noisy(150.0, 0.03, 0.07),
            "grid_i_y": noisy(148.5, 0.03, 0.08),
            "grid_i_b": noisy(151.2, 0.03, 0.06),
            "grid_i_n": noisy(3.5,   0.1,  0.15),
            "grid_thdi_r": noisy(8.2,  0.1, 0.05),
            "grid_thdi_y": noisy(8.5,  0.1, 0.06),
            "grid_thdi_b": noisy(8.0,  0.1, 0.04),
            "grid_thdi_n": noisy(15.1, 0.1, 0.09),
            "load_i_r": noisy(140.0, 0.04, 0.07),
            "load_i_y": noisy(138.0, 0.04, 0.08),
            "load_i_b": noisy(141.5, 0.04, 0.06),
            "load_i_n": noisy(4.2,   0.1,  0.13),
            "load_thdi_r": noisy(12.3, 0.1, 0.05),
            "load_thdi_y": noisy(12.8, 0.1, 0.06),
            "load_thdi_b": noisy(12.1, 0.1, 0.04),
            "load_thdi_n": noisy(22.5, 0.1, 0.09),
            "volt_r": noisy(230.0, 0.01, 0.03),
            "volt_y": noisy(230.5, 0.01, 0.04),
            "volt_b": noisy(229.8, 0.01, 0.035),
            "freq_r": noisy(50.0, 0.002, 0.02),
            "freq_y": noisy(50.0, 0.002, 0.02),
            "freq_b": noisy(50.0, 0.002, 0.02),
            "thdu_r": noisy(2.1, 0.05, 0.04),
            "thdu_y": noisy(2.3, 0.05, 0.05),
            "thdu_b": noisy(2.0, 0.05, 0.03),
            "grid_pf_r": noisy(0.92, 0.02, 0.06),
            "grid_pf_y": noisy(0.91, 0.02, 0.07),
            "grid_pf_b": noisy(0.93, 0.02, 0.05),
            "grid_pf_n": noisy(0.85, 0.03, 0.08),
            "load_pf_r": noisy(0.88, 0.02, 0.06),
            "load_pf_y": noisy(0.87, 0.02, 0.07),
            "load_pf_b": noisy(0.89, 0.02, 0.05),
            "load_pf_n": noisy(0.82, 0.03, 0.08),
            "comp_cur_r": noisy(10.2, 0.1, 0.1),
            "comp_cur_y": noisy(10.5, 0.1, 0.1),
            "comp_cur_b": noisy(9.8,  0.1, 0.1),
            "comp_rate_r": noisy(88.0, 0.03, 0.07),
            "comp_rate_y": noisy(87.5, 0.03, 0.08),
            "comp_rate_b": noisy(89.0, 0.03, 0.06),
            "grid_kvar_r": noisy(8.5,  0.05, 0.06),
            "grid_kvar_y": noisy(8.3,  0.05, 0.07),
            "grid_kvar_b": noisy(8.7,  0.05, 0.05),
            "grid_kw_r":   noisy(34.5, 0.03, 0.04),
            "grid_kw_y":   noisy(34.1, 0.03, 0.05),
            "grid_kw_b":   noisy(34.8, 0.03, 0.03),
            "grid_kva_r":  noisy(37.5, 0.03, 0.04),
            "grid_kva_y":  noisy(37.1, 0.03, 0.05),
            "grid_kva_b":  noisy(37.8, 0.03, 0.03),
            "load_kvar_r": noisy(9.1,  0.05, 0.06),
            "load_kvar_y": noisy(8.9,  0.05, 0.07),
            "load_kvar_b": noisy(9.3,  0.05, 0.05),
            "load_kw_r":   noisy(32.0, 0.03, 0.04),
            "load_kw_y":   noisy(31.8, 0.03, 0.05),
            "load_kw_b":   noisy(32.2, 0.03, 0.03),
            "load_kva_r":  noisy(36.4, 0.03, 0.04),
            "load_kva_y":  noisy(36.1, 0.03, 0.05),
            "load_kva_b":  noisy(36.7, 0.03, 0.03),
            "temp_j1": noisy(42.3, 0.02, 0.01),
            "temp_j2": noisy(45.1, 0.02, 0.01),
            "temp_j3": noisy(41.8, 0.02, 0.01),
        }

    # ─── Public API ───────────────────────────────────────────────────────────
    def read_all(self) -> Optional[Dict]:
        if self._sim_mode:
            return self._simulate()
        try:
            return self._batch_read()
        except Exception as e:
            print(f"[MODBUS] read_all error: {e}")
            return None
