"""
Configuration — all Modbus register maps + app settings
"""

from dataclasses import dataclass, field
from typing import Dict, Tuple


@dataclass
class Settings:
    # ── Serial Port ──────────────────────────────────────────────────────────
    PORT: str = "COM9"          # Change to /dev/ttyUSB0 on Linux
    BAUDRATE: int = 9600
    PARITY: str = "N"           # N=None, E=Even, O=Odd
    STOPBITS: int = 1
    BYTESIZE: int = 8
    TIMEOUT: float = 1.0
    SLAVE_ID: int = 1

    # ── Polling ──────────────────────────────────────────────────────────────
    POLL_TIME: float = 1.0      # seconds between polls
    HISTORY_SIZE: int = 3600    # 1 hour at 1-second intervals

    # ── Logging ──────────────────────────────────────────────────────────────
    CSV_FILE: str = "ems_log.csv"


settings = Settings()


# ─── Register Map ─────────────────────────────────────────────────────────────
# Format: name → (40xxx_address, unit, group, phase)
# subtract 40001 from address to get zero-based Modbus offset

REGISTER_MAP: Dict[str, Tuple[int, str, str, str]] = {
    # ── Grid Currents (A) ────────────────────────────────────────────────────
    "grid_i_r":        (40017, "A",    "grid_current",   "R"),
    "grid_i_y":        (40019, "A",    "grid_current",   "Y"),
    "grid_i_b":        (40021, "A",    "grid_current",   "B"),
    "grid_i_n":        (40053, "A",    "grid_current",   "N"),

    # ── Grid THDi (%) ────────────────────────────────────────────────────────
    "grid_thdi_r":     (40011, "%",    "grid_thdi",      "R"),
    "grid_thdi_y":     (40013, "%",    "grid_thdi",      "Y"),
    "grid_thdi_b":     (40015, "%",    "grid_thdi",      "B"),
    "grid_thdi_n":     (40055, "%",    "grid_thdi",      "N"),

    # ── Load Currents (A) ────────────────────────────────────────────────────
    "load_i_r":        (40029, "A",    "load_current",   "R"),
    "load_i_y":        (40031, "A",    "load_current",   "Y"),
    "load_i_b":        (40033, "A",    "load_current",   "B"),
    "load_i_n":        (40077, "A",    "load_current",   "N"),

    # ── Load THDi (%) ────────────────────────────────────────────────────────
    "load_thdi_r":     (40023, "%",    "load_thdi",      "R"),
    "load_thdi_y":     (40025, "%",    "load_thdi",      "Y"),
    "load_thdi_b":     (40027, "%",    "load_thdi",      "B"),
    "load_thdi_n":     (40079, "%",    "load_thdi",      "N"),

    # ── Voltages (V) ─────────────────────────────────────────────────────────
    "volt_r":          (40035, "V",    "voltage",        "R"),
    "volt_y":          (40037, "V",    "voltage",        "Y"),
    "volt_b":          (40039, "V",    "voltage",        "B"),

    # ── Frequency (Hz) ───────────────────────────────────────────────────────
    "freq_r":          (40041, "Hz",   "frequency",      "R"),
    "freq_y":          (40043, "Hz",   "frequency",      "Y"),
    "freq_b":          (40045, "Hz",   "frequency",      "B"),

    # ── THDu (%) ─────────────────────────────────────────────────────────────
    "thdu_r":          (40047, "%",    "thdu",           "R"),
    "thdu_y":          (40049, "%",    "thdu",           "Y"),
    "thdu_b":          (40051, "%",    "thdu",           "B"),

    # ── Grid Power Factor ─────────────────────────────────────────────────────
    "grid_pf_r":       (40057, "PF",   "grid_pf",        "R"),
    "grid_pf_y":       (40059, "PF",   "grid_pf",        "Y"),
    "grid_pf_b":       (40061, "PF",   "grid_pf",        "B"),
    "grid_pf_n":       (40063, "PF",   "grid_pf",        "N"),

    # ── Load Power Factor ─────────────────────────────────────────────────────
    "load_pf_r":       (40081, "PF",   "load_pf",        "R"),
    "load_pf_y":       (40083, "PF",   "load_pf",        "Y"),
    "load_pf_b":       (40085, "PF",   "load_pf",        "B"),
    "load_pf_n":       (40087, "PF",   "load_pf",        "N"),

    # ── Compensation Current (A) ──────────────────────────────────────────────
    "comp_cur_r":      (40065, "A",    "comp_current",   "R"),
    "comp_cur_y":      (40067, "A",    "comp_current",   "Y"),
    "comp_cur_b":      (40069, "A",    "comp_current",   "B"),

    # ── Compensation Rate (%) ─────────────────────────────────────────────────
    "comp_rate_r":     (40071, "%",    "comp_rate",      "R"),
    "comp_rate_y":     (40073, "%",    "comp_rate",      "Y"),
    "comp_rate_b":     (40075, "%",    "comp_rate",      "B"),

    # ── Grid Power ────────────────────────────────────────────────────────────
    "grid_kvar_r":     (40089, "kVAr", "grid_kvar",      "R"),
    "grid_kvar_y":     (40091, "kVAr", "grid_kvar",      "Y"),
    "grid_kvar_b":     (40093, "kVAr", "grid_kvar",      "B"),
    "grid_kw_r":       (40095, "kW",   "grid_kw",        "R"),
    "grid_kw_y":       (40097, "kW",   "grid_kw",        "Y"),
    "grid_kw_b":       (40099, "kW",   "grid_kw",        "B"),
    "grid_kva_r":      (40101, "kVA",  "grid_kva",       "R"),
    "grid_kva_y":      (40103, "kVA",  "grid_kva",       "Y"),
    "grid_kva_b":      (40105, "kVA",  "grid_kva",       "B"),

    # ── Load Power ────────────────────────────────────────────────────────────
    "load_kvar_r":     (40107, "kVAr", "load_kvar",      "R"),
    "load_kvar_y":     (40109, "kVAr", "load_kvar",      "Y"),
    "load_kvar_b":     (40111, "kVAr", "load_kvar",      "B"),
    "load_kw_r":       (40113, "kW",   "load_kw",        "R"),
    "load_kw_y":       (40115, "kW",   "load_kw",        "Y"),
    "load_kw_b":       (40117, "kW",   "load_kw",        "B"),
    "load_kva_r":      (40119, "kVA",  "load_kva",       "R"),
    "load_kva_y":      (40121, "kVA",  "load_kva",       "Y"),
    "load_kva_b":      (40123, "kVA",  "load_kva",       "B"),

    # ── Temperature (°C) ──────────────────────────────────────────────────────
    "temp_j1":         (40125, "°C",   "temperature",    "J1"),
    "temp_j2":         (40127, "°C",   "temperature",    "J2"),
    "temp_j3":         (40129, "°C",   "temperature",    "J3"),
}
