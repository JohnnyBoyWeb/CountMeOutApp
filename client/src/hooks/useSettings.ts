import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db, UserSettings } from '@/lib/db';
import { speechEngine } from '@/lib/speechEngine';

export interface AppSettings extends Omit<UserSettings, 'id' | 'updatedAt'> {
  // Additional UI-only settings
  animations: boolean;
  notifications: boolean;
  autoSave: boolean;
}

const defaultSettings: AppSettings = {
  dyslexiaMode: false,
  highContrast: false,
  largeText: false,
  soundEffects: true,
  voiceFeedback: true,
  voiceSpeed: 1.0,
  darkMode: false,
  animations: true,
  notifications: true,
  autoSave: true
};

export function useSettings() {
  const queryClient = useQueryClient();
  const [localSettings, setLocalSettings] = useState<AppSettings>(defaultSettings);

  // Load settings from database
  const { data: settings, isLoading } = useQuery({
    queryKey: ['user-settings'],
    queryFn: async (): Promise<AppSettings> => {
      const dbSettings = await db.userSettings.orderBy('id').last();
      
      if (!dbSettings) {
        // Create default settings in database
        await db.userSettings.add({
          ...defaultSettings,
          updatedAt: new Date()
        });
        return defaultSettings;
      }

      // Merge with UI-only settings from localStorage
      const uiSettings = JSON.parse(localStorage.getItem('ui-settings') || '{}');
      
      return {
        dyslexiaMode: dbSettings.dyslexiaMode,
        highContrast: dbSettings.highContrast,
        largeText: dbSettings.largeText,
        soundEffects: dbSettings.soundEffects,
        voiceFeedback: dbSettings.voiceFeedback,
        voiceSpeed: dbSettings.voiceSpeed,
        darkMode: dbSettings.darkMode,
        animations: uiSettings.animations ?? defaultSettings.animations,
        notifications: uiSettings.notifications ?? defaultSettings.notifications,
        autoSave: uiSettings.autoSave ?? defaultSettings.autoSave
      };
    }
  });

  // Save settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: async (newSettings: Partial<AppSettings>) => {
      const currentSettings = await db.userSettings.orderBy('id').last();
      
      if (currentSettings) {
        await db.userSettings.update(currentSettings.id!, {
          ...newSettings,
          updatedAt: new Date()
        });
      } else {
        await db.userSettings.add({
          ...defaultSettings,
          ...newSettings,
          updatedAt: new Date()
        });
      }

      // Save UI-only settings to localStorage
      const uiSettings = {
        animations: newSettings.animations,
        notifications: newSettings.notifications,
        autoSave: newSettings.autoSave
      };
      localStorage.setItem('ui-settings', JSON.stringify(uiSettings));

      return newSettings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-settings'] });
    }
  });

  // Update local settings when database settings change
  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
      applySettings(settings);
    }
  }, [settings]);

  // Apply settings to the application
  const applySettings = (settingsToApply: AppSettings) => {
    const html = document.documentElement;
    const body = document.body;

    // Dark mode
    if (settingsToApply.darkMode) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }

    // High contrast
    if (settingsToApply.highContrast) {
      html.classList.add('high-contrast');
    } else {
      html.classList.remove('high-contrast');
    }

    // Large text
    if (settingsToApply.largeText) {
      body.classList.add('large-text');
    } else {
      body.classList.remove('large-text');
    }

    // Dyslexia-friendly font
    if (settingsToApply.dyslexiaMode) {
      body.classList.add('dyslexia-font');
    } else {
      body.classList.remove('dyslexia-font');
    }

    // Animations
    if (!settingsToApply.animations) {
      html.style.setProperty('--animation-duration', '0s');
    } else {
      html.style.removeProperty('--animation-duration');
    }

    // Speech engine settings
    speechEngine.setDefaultOptions({
      rate: settingsToApply.voiceSpeed
    });
  };

  // Individual setting updaters
  const updateSetting = <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    saveSettingsMutation.mutate({ [key]: value });
  };

  const toggleDarkMode = () => updateSetting('darkMode', !localSettings.darkMode);
  const toggleDyslexiaMode = () => updateSetting('dyslexiaMode', !localSettings.dyslexiaMode);
  const toggleHighContrast = () => updateSetting('highContrast', !localSettings.highContrast);
  const toggleLargeText = () => updateSetting('largeText', !localSettings.largeText);
  const toggleSoundEffects = () => updateSetting('soundEffects', !localSettings.soundEffects);
  const toggleVoiceFeedback = () => updateSetting('voiceFeedback', !localSettings.voiceFeedback);
  const toggleAnimations = () => updateSetting('animations', !localSettings.animations);
  const toggleNotifications = () => updateSetting('notifications', !localSettings.notifications);
  const toggleAutoSave = () => updateSetting('autoSave', !localSettings.autoSave);

  const setVoiceSpeed = (speed: number) => updateSetting('voiceSpeed', speed);

  // Export all data
  const exportData = async () => {
    try {
      const [sessions, progress, achievements, settings] = await Promise.all([
        db.practiceSessions.toArray(),
        db.userProgress.toArray(),
        db.achievements.toArray(),
        db.userSettings.toArray()
      ]);

      const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        data: {
          practiceSessions: sessions,
          userProgress: progress,
          achievements: achievements,
          userSettings: settings
        }
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `count-me-out-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error('Export failed:', error);
      return false;
    }
  };

  // Clear all data
  const clearAllData = async () => {
    try {
      await Promise.all([
        db.practiceSessions.clear(),
        db.userProgress.clear(),
        db.achievements.clear(),
        db.userSettings.clear()
      ]);

      // Reinitialize with defaults
      await db.userSettings.add({
        ...defaultSettings,
        updatedAt: new Date()
      });

      queryClient.invalidateQueries();
      return true;
    } catch (error) {
      console.error('Clear data failed:', error);
      return false;
    }
  };

  // Get storage usage
  const getStorageUsage = async () => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        return {
          used: estimate.usage || 0,
          total: estimate.quota || 0,
          percentage: estimate.quota ? ((estimate.usage || 0) / estimate.quota) * 100 : 0
        };
      } catch (error) {
        console.error('Storage estimate failed:', error);
      }
    }
    return { used: 0, total: 0, percentage: 0 };
  };

  return {
    settings: localSettings,
    isLoading,
    isSaving: saveSettingsMutation.isPending,
    updateSetting,
    toggleDarkMode,
    toggleDyslexiaMode,
    toggleHighContrast,
    toggleLargeText,
    toggleSoundEffects,
    toggleVoiceFeedback,
    toggleAnimations,
    toggleNotifications,
    toggleAutoSave,
    setVoiceSpeed,
    exportData,
    clearAllData,
    getStorageUsage
  };
}

// Hook for accessibility context
export function useAccessibility() {
  const { settings } = useSettings();
  
  return {
    isDyslexiaMode: settings.dyslexiaMode,
    isHighContrast: settings.highContrast,
    isLargeText: settings.largeText,
    hasReducedMotion: !settings.animations
  };
}
