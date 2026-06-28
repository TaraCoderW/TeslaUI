// useSmartVitalIoT.js
// Drop into your SmartVital React/Vite project.
// Connects to ws://localhost:8000/ws/vitals and returns live sensor readings.
//
// Usage:
//   const { vitals, connected, scenario } = useSmartVitalIoT();

import { useState, useEffect, useRef, useCallback } from "react";

const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8000/ws/vitals";

export function useSmartVitalIoT() {
  const [vitals, setVitals]       = useState(null);
  const [connected, setConnected] = useState(false);
  const [scenario, setScenario]   = useState(null);
  const [error, setError]         = useState(null);
  const wsRef = useRef(null);

  const connect = useCallback(() => {
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      setError(null);
      console.log("[SmartVital IoT] WebSocket connected");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.error) { setError(data.error); return; }

        setScenario(data.meta?.scenario_label ?? data.meta?.scenario ?? "Unknown");

        const s = data.sensors;

        // Flatten into a clean vitals object your components can directly use
        setVitals({
          // MAX30102
          heartRate:     s.MAX30102?.heart_rate_bpm   ?? null,
          spo2:          s.MAX30102?.spo2_percent      ?? null,

          // AD8232
          ecgWaveform:   s.AD8232?.ecg_waveform        ?? [],
          ecgLeadOff:    s.AD8232?.lead_off             ?? false,

          // DHT22
          temperature:   s.DHT22?.temperature_celsius  ?? null,
          humidity:      s.DHT22?.humidity_percent      ?? null,

          // BP Module
          systolic:      s.BP_MODULE?.systolic_mmhg     ?? null,
          diastolic:     s.BP_MODULE?.diastolic_mmhg    ?? null,
          bpCategory:    s.BP_MODULE?.bp_category       ?? null,

          // GSR
          gsrConductance: s.GSR?.conductance_uS         ?? null,
          stressLevel:    s.GSR?.stress_level            ?? null,

          // Raw mode tag
          mode:          data.meta?.mode               ?? "UNKNOWN",
          timestamp:     data.meta?.timestamp          ?? Date.now() / 1000,
        });
      } catch (e) {
        console.error("[SmartVital IoT] Parse error:", e);
      }
    };

    ws.onclose = () => {
      setConnected(false);
      console.log("[SmartVital IoT] Disconnected — retrying in 3s...");
      setTimeout(connect, 3000);   // auto-reconnect
    };

    ws.onerror = (e) => {
      setError("WebSocket connection failed");
      console.error("[SmartVital IoT] Error:", e);
    };
  }, []);

  useEffect(() => {
    connect();
    return () => wsRef.current?.close();
  }, [connect]);

  return { vitals, connected, scenario, error };
}
