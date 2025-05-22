import React, { createContext, useContext, useState, useEffect } from 'react';

const STORAGE_KEY = 'game_settings';
const isWeb = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

let AsyncStorage;
if (!isWeb) {
  try {
    AsyncStorage = require('@react-native-async-storage/async-storage').default;
  } catch {}
}

const GameSettingsContext = createContext();

const defaultSettings = {
  lang: 'tr',
  cat: 1,
  level: 'A1',
  langLabel: '',
  catLabel: '',
  levelLabel: '',
};

export function GameSettingsProvider({ children }) {
  const [settings, setSettings] = useState(defaultSettings);
  const [loaded, setLoaded] = useState(false);

  // Ayarları storage'dan yükle
  useEffect(() => {
    (async () => {
      try {
        let saved;
        if (isWeb) {
          const raw = window.localStorage.getItem(STORAGE_KEY);
          if (raw) saved = JSON.parse(raw);
        } else if (AsyncStorage) {
          const raw = await AsyncStorage.getItem(STORAGE_KEY);
          if (raw) saved = JSON.parse(raw);
        }
        if (saved) setSettings({ ...defaultSettings, ...saved });
      } catch {}
      setLoaded(true);
    })();
  }, []);

  // Ayarlar değişince storage'a kaydet
  useEffect(() => {
    if (!loaded) return;
    try {
      const raw = JSON.stringify(settings);
      if (isWeb) {
        window.localStorage.setItem(STORAGE_KEY, raw);
      } else if (AsyncStorage) {
        AsyncStorage.setItem(STORAGE_KEY, raw);
      }
    } catch {}
  }, [settings, loaded]);

  const updateSettings = (newSettings) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  if (!loaded) return null;

  return (
    <GameSettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </GameSettingsContext.Provider>
  );
}

export function useGameSettings() {
  return useContext(GameSettingsContext);
} 