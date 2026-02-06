import React, { createContext, useContext, useEffect, useState } from 'react';

interface UserProfile {
  fullName: string;
  email: string;
  phone: string;
  phoneCode: string;
  timezone: string;
}

interface NotificationSettings {
  notifications: boolean;
  emailReports: boolean;
  autoSync: boolean;
}

interface AppearanceSettings {
  language: string;
  dataRetention: string;
}

interface SettingsContextType {
  profile: UserProfile;
  notifications: NotificationSettings;
  appearance: AppearanceSettings;
  updateProfile: (profile: Partial<UserProfile>) => void;
  updateNotifications: (settings: Partial<NotificationSettings>) => void;
  updateAppearance: (settings: Partial<AppearanceSettings>) => void;
  saveSettings: () => void;
  resetSettings: () => void;
  isDirty: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

interface SettingsProviderProps {
  children: React.ReactNode;
}

const defaultProfile: UserProfile = {
  fullName: "John Doe",
  email: "john.doe@example.com",
  phone: "98765 43210",
  phoneCode: "+91",
  timezone: "IST"
};

const defaultNotifications: NotificationSettings = {
  notifications: true,
  emailReports: false,
  autoSync: true
};

const defaultAppearance: AppearanceSettings = {
  language: "en",
  dataRetention: "1year"
};

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('userProfile');
    return saved ? JSON.parse(saved) : defaultProfile;
  });

  const [notifications, setNotifications] = useState<NotificationSettings>(() => {
    const saved = localStorage.getItem('notificationSettings');
    return saved ? JSON.parse(saved) : defaultNotifications;
  });

  const [appearance, setAppearance] = useState<AppearanceSettings>(() => {
    const saved = localStorage.getItem('appearanceSettings');
    return saved ? JSON.parse(saved) : defaultAppearance;
  });

  const [originalSettings, setOriginalSettings] = useState({
    profile: { ...profile },
    notifications: { ...notifications },
    appearance: { ...appearance }
  });

  const [isDirty, setIsDirty] = useState(false);

  // Save to localStorage whenever settings change
  useEffect(() => {
    localStorage.setItem('userProfile', JSON.stringify(profile));
    localStorage.setItem('notificationSettings', JSON.stringify(notifications));
    localStorage.setItem('appearanceSettings', JSON.stringify(appearance));
  }, [profile, notifications, appearance]);

  // Check if settings have changed
  useEffect(() => {
    const hasChanged = 
      JSON.stringify(profile) !== JSON.stringify(originalSettings.profile) ||
      JSON.stringify(notifications) !== JSON.stringify(originalSettings.notifications) ||
      JSON.stringify(appearance) !== JSON.stringify(originalSettings.appearance);
    
    setIsDirty(hasChanged);
  }, [profile, notifications, appearance, originalSettings]);

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };

  const updateNotifications = (updates: Partial<NotificationSettings>) => {
    setNotifications(prev => ({ ...prev, ...updates }));
  };

  const updateAppearance = (updates: Partial<AppearanceSettings>) => {
    setAppearance(prev => ({ ...prev, ...updates }));
  };

  const saveSettings = () => {
    setOriginalSettings({
      profile: { ...profile },
      notifications: { ...notifications },
      appearance: { ...appearance }
    });
    setIsDirty(false);
  };

  const resetSettings = () => {
    setProfile(defaultProfile);
    setNotifications(defaultNotifications);
    setAppearance(defaultAppearance);
    setOriginalSettings({
      profile: defaultProfile,
      notifications: defaultNotifications,
      appearance: defaultAppearance
    });
    setIsDirty(false);
  };

  return (
    <SettingsContext.Provider value={{
      profile,
      notifications,
      appearance,
      updateProfile,
      updateNotifications,
      updateAppearance,
      saveSettings,
      resetSettings,
      isDirty
    }}>
      {children}
    </SettingsContext.Provider>
  );
};