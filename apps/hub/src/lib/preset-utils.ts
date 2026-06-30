import { supabase } from '@/lib/supabase';
import { F1NewPresetType as F1PresetType } from '@/hooks/useDashboardPreset';

// Save preset to Supabase
export async function savePresetToSupabase(
  userId: string,
  preset: F1PresetType
) {
  try {
    const { data, error } = await supabase
      .from('user_customization')
      .upsert({
        user_id: userId,
        f1_dashboard_preset: preset,
        updated_at: new Date().toISOString()
      })
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Failed to save preset:', error);
    throw error;
  }
}

// Sync preset across tabs/devices
export function onPresetChange(callback: (preset: F1PresetType) => void) {
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === 'f1-dashboard-preset' && e.newValue) {
      callback(e.newValue as F1PresetType);
    }
  };

  window.addEventListener('storage', handleStorageChange);

  return () => {
    window.removeEventListener('storage', handleStorageChange);
  };
}
