import React from 'react';
import { useGamePhysics } from '../../store/telemetry';
import { Button } from '@manjanium/ui/src/components/Button';

export function SettingsModal({ onClose }: { onClose: () => void }) {
  const { mouseSteeringEnabled, mouseSensitivity, setMouseSteering, setMouseSensitivity } = useGamePhysics();

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-[#1E1E1E] border border-white/10 rounded-xl p-8 max-w-md w-full text-white">
        <h2 className="text-2xl font-bold mb-6 font-[Outfit]">Driving Settings</h2>
        
        <div className="space-y-6">
          {/* Mouse Steering */}
          <div className="flex justify-between items-center">
            <span className="text-white/70 font-['Inter']">Mouse Steering</span>
            <Button 
              variant={mouseSteeringEnabled ? 'primary' : 'outline'}
              onClick={() => setMouseSteering(!mouseSteeringEnabled)}
              size="sm"
            >
              {mouseSteeringEnabled ? 'On' : 'Off'}
            </Button>
          </div>

          {/* Steering Sensitivity */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-white/70 font-['Inter']">Steering Sensitivity</span>
              <span className="text-white font-mono">{mouseSensitivity.toFixed(3)}x</span>
            </div>
            <input 
              type="range" 
              min="0.001" 
              max="0.02" 
              step="0.001" 
              value={mouseSensitivity}
              onChange={(e) => setMouseSensitivity(parseFloat(e.target.value))}
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
