import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { F1NewPresetType as F1PresetType } from '@/hooks/useDashboardPreset';

interface PresetSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentPreset: F1PresetType;
  onSelectPreset: (preset: F1PresetType) => void;
}

const PRESETS = [
  {
    id: 'live-focused',
    name: 'Live Focused',
    icon: '⚡',
    description: 'Real-time race tracking. Timing tower + Global race tracker. Perfect for live race viewing.',
    color: 'from-[#FBBF24] to-orange-600',
    features: ['Real-time lap times', 'Position changes', 'Live speed data', '3D globe tracker']
  },
  {
    id: 'stats-detailed',
    name: 'Stats Detailed',
    icon: '📊',
    description: 'In-depth analysis. Championship standings + Telemetry + Strategy + Weather.',
    color: 'from-[#0EA5E9] to-blue-600',
    features: ['Championship data', 'Telemetry charts', 'Pit strategy', 'Track conditions']
  },
  {
    id: 'compact-overview',
    name: 'Compact Overview',
    icon: '🎯',
    description: 'Balanced view. Session status + Globe + Quick stats + Top 10 timing.',
    color: 'from-[#10B981] to-emerald-600',
    features: ['Quick stats', 'Session info', 'Balanced layout', 'Top 10 drivers']
  }
];

export function PresetSidebar({
  isOpen,
  onClose,
  currentPreset,
  onSelectPreset
}: PresetSidebarProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Sidebar - Expands from left */}
          <motion.div
            initial={{ x: -500, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -500, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 120 }}
            className="fixed left-0 top-0 h-full w-[500px] bg-[#0a0a0a] border-r border-[#333333] z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-[#0a0a0a] border-b border-[#333333] p-6 flex items-center justify-between z-10">
              <div>
                <h2 
                  className="text-2xl font-bold text-white"
                  style={{ fontFamily: 'var(--f1-font-heading)' }}
                >
                  Dashboard Presets
                </h2>
                <p className="text-[#6B7280] text-sm">Choose your F1 Hub layout</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 hover:bg-[#1F2937] rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </motion.button>
            </div>

            {/* Preset Cards */}
            <div className="p-6 space-y-4 relative">
              {PRESETS.map((preset) => (
                <motion.button
                  key={preset.id}
                  onClick={() => {
                    onSelectPreset(preset.id as F1PresetType);
                    onClose();
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    w-full text-left p-6 rounded-lg border-2 transition-all relative
                    ${currentPreset === preset.id
                      ? 'border-[#FBBF24] bg-[#FBBF24]/10'
                      : 'border-[#333333] bg-[#131313] hover:border-[#FBBF24]/50'
                    }
                  `}
                >
                  {/* Selected indicator */}
                  {currentPreset === preset.id && (
                    <div className="absolute top-4 right-4">
                      <div className="px-3 py-1 bg-[#FBBF24] text-black rounded-full text-xs font-bold">
                        ACTIVE
                      </div>
                    </div>
                  )}

                  {/* Icon and Name */}
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{preset.icon}</span>
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        {preset.name}
                      </h3>
                      <p className="text-xs text-[#6B7280]">
                        {preset.id.toUpperCase().replace('-', ' ')}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-[#6B7280] mb-4">
                    {preset.description}
                  </p>

                  {/* Features */}
                  <div className="space-y-2">
                    <p className="text-xs text-[#6B7280] font-semibold uppercase tracking-widest">
                      Features
                    </p>
                    <ul className="space-y-1">
                      {preset.features.map((feature, idx) => (
                        <li key={idx} className="text-sm text-[#6B7280] flex items-center gap-2">
                          <span className="text-[#FBBF24]">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Preview badge */}
                  <div className="mt-4 pt-4 border-t border-[#333333]">
                    <p className="text-xs text-[#FBBF24] font-semibold">
                      Click to apply preset
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Footer info */}
            <div className="p-6 border-t border-[#333333] mt-auto">
              <div className="p-4 bg-[#1F2937] rounded-lg">
                <p className="text-sm text-[#6B7280]">
                  <span className="text-[#FBBF24] font-semibold">💡 Tip:</span> Your preset choice is saved across all devices. Switch anytime from Settings.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
