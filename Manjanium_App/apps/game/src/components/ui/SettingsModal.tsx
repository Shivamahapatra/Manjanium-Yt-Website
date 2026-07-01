import React from 'react';
import { useTelemetryStore } from '../../store/telemetry';
import { Button } from '@manjanium/ui/src/components/Button';

export function SettingsModal({ onClose }: { onClose: () => void }) {
  const { transmission, mouseSteering, steeringSensitivity, updateSettings } = useTelemetryStore();

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-[#1E1E1E] border border-white/10 rounded-xl p-8 max-w-md w-full text-white">
        <h2 className="text-2xl font-bold mb-6 font-[Outfit]">Driving Settings</h2>
        
        <div className="space-y-6">
          {/* Transmission */}
          <div className="flex justify-between items-center">
            <span className="text-white/70 font-['Inter']">Transmission</span>
            <div className="flex gap-2">
              <Button 
                variant={transmission === 'auto' ? 'primary' : 'outline'}
                onClick={() => updateSettings({ transmission: 'auto' })}
                size="sm"
              >
                Auto
              </Button>
              <Button 
                variant={transmission === 'manual' ? 'primary' : 'outline'}
                onClick={() => updateSettings({ transmission: 'manual' })}
                size="sm"
              >
                Manual
              </Button>
            </div>
          </div>

          {/* Mouse Steering */}
          <div className="flex justify-between items-center">
            <span className="text-white/70 font-['Inter']">Mouse Steering</span>
            <Button 
              variant={mouseSteering ? 'primary' : 'outline'}
              onClick={() => updateSettings({ mouseSteering: !mouseSteering })}
              size="sm"
            >
              {mouseSteering ? 'On' : 'Off'}
            </Button>
          </div>

          {/* Steering Sensitivity */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-white/70 font-['Inter']">Steering Sensitivity</span>
              <span className="text-white font-mono">{steeringSensitivity.toFixed(1)}x</span>
            </div>
            <input 
              type="range" 
              min="0.5" 
              max="2.0" 
              step="0.1" 
              value={steeringSensitivity}
              onChange={(e) => updateSettings({ steeringSensitivity: parseFloat(e.target.value) })}
              className="w-full accent-[#0EA5E9]"
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <Button onClick={onClose} variant="primary">Close</Button>
        </div>
      </div>
    </div>
  );
}
