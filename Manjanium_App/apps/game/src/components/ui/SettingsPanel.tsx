'use client';

import React, { useState, useEffect } from 'react';
import { STITCH_COLORS } from '@manjanium/ui';
import { getSimulatorInputs, setMouseSensitivity, setSimulatorPaused } from '../../hooks/useSimulatorInputs';

export function SettingsPanel() {
  const [isPaused, setIsPaused] = useState(false);
  const [sensitivity, setSensitivity] = useState(0.005);
  const [isAuto, setIsAuto] = useState(true);

  // Poll the singleton state to update UI
  useEffect(() => {
    const interval = setInterval(() => {
      const inputs = getSimulatorInputs();
      setIsPaused(inputs.isPaused);
      setIsAuto(inputs.isAuto);
      setSensitivity(inputs.mouseSensitivity);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const handleSensitivityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setSensitivity(val);
    setMouseSensitivity(val);
  };

  if (!isPaused) {
    return (
      <div 
        style={{
          position: 'absolute',
          top: 20,
          left: 20,
          color: STITCH_COLORS.accent,
          fontFamily: 'monospace',
          pointerEvents: 'none',
          textShadow: '1px 1px 2px black',
        }}
      >
        <p>Press ESC to open Settings / Pause</p>
        <p>Transmission: {isAuto ? 'AUTO' : 'MANUAL'}</p>
        {!isAuto && <p>Shift: Space (Up) / L-Shift (Down)</p>}
      </div>
    );
  }

  return (
    <div 
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        width: '350px',
        backgroundColor: STITCH_COLORS.surfaceAlt,
        color: 'white',
        padding: '2rem',
        boxShadow: '5px 0 15px rgba(0,0,0,0.5)',
        fontFamily: 'sans-serif',
        transform: isPaused ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s ease-in-out',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
      }}
    >
      <h2 style={{ color: STITCH_COLORS.accent, margin: 0 }}>Simulator Settings</h2>
      
      <div>
        <h4 style={{ marginBottom: '0.5rem', color: STITCH_COLORS.muted }}>Mouse Steering Sensitivity</h4>
        <input 
          type="range" 
          min="0.001" 
          max="0.02" 
          step="0.001" 
          value={sensitivity}
          onChange={handleSensitivityChange}
          style={{ width: '100%', accentColor: STITCH_COLORS.accent }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: STITCH_COLORS.muted }}>
          <span>Low</span>
          <span>{sensitivity.toFixed(3)}</span>
          <span>High</span>
        </div>
      </div>

      <div>
        <h4 style={{ marginBottom: '0.5rem', color: STITCH_COLORS.muted }}>Controls</h4>
        <ul style={{ fontSize: '0.9rem', lineHeight: '1.8', color: STITCH_COLORS.muted, paddingLeft: '1.2rem' }}>
          <li><strong style={{color: 'white'}}>W/S</strong> - Throttle / Brake</li>
          <li><strong style={{color: 'white'}}>Mouse X</strong> - Steering (Click canvas to lock)</li>
          <li><strong style={{color: 'white'}}>Ctrl</strong> - Toggle Auto/Manual</li>
          <li><strong style={{color: 'white'}}>Space</strong> - Manual Shift Up</li>
          <li><strong style={{color: 'white'}}>L-Shift</strong> - Manual Shift Down</li>
        </ul>
      </div>

      <button
        onClick={() => setSimulatorPaused(false)}
        style={{
          marginTop: 'auto',
          padding: '1rem',
          backgroundColor: STITCH_COLORS.accent,
          color: STITCH_COLORS.surface,
          border: 'none',
          borderRadius: '4px',
          fontWeight: 'bold',
          cursor: 'pointer',
        }}
      >
        Resume Simulation
      </button>
    </div>
  );
}
