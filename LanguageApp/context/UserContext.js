import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [points, setPoints] = useState(0);

  // Uygulama açılışında storage'dan user, token ve puanı yükle
  useEffect(() => {
    const loadUserAndToken = async () => {
      const storedUser = await AsyncStorage.getItem('userData');
      const storedToken = await AsyncStorage.getItem('token');
      const storedPoints = await AsyncStorage.getItem('points');
      if (storedUser) setUser(JSON.parse(storedUser));
      if (storedToken) setToken(storedToken);
      if (storedPoints) setPoints(Number(storedPoints));
      setLoading(false);
    };
    loadUserAndToken();
  }, []);

  // Token'ı hem state'e hem de AsyncStorage'a kaydet
  const saveToken = async (newToken) => {
    setToken(newToken);
    if (newToken) {
      await AsyncStorage.setItem('token', newToken);
    } else {
      await AsyncStorage.removeItem('token');
    }
  };

  // Kullanıcıyı hem state'e hem de AsyncStorage'a kaydet
  const saveUser = async (newUser) => {
    setUser(newUser);
    if (newUser) {
      await AsyncStorage.setItem('userData', JSON.stringify(newUser));
    } else {
      await AsyncStorage.removeItem('userData');
    }
  };

  // Puanı hem state'e hem de AsyncStorage'a kaydet
  const savePoints = async (newPoints) => {
    setPoints(newPoints);
    await AsyncStorage.setItem('points', newPoints.toString());
  };

  // Puan ekle
  const addPoints = async (amount) => {
    const newPoints = points + amount;
    setPoints(newPoints);
    await AsyncStorage.setItem('points', newPoints.toString());
  };

  // Puan harca
  const spendPoints = async (amount) => {
    if (points >= amount) {
      const newPoints = points - amount;
      setPoints(newPoints);
      await AsyncStorage.setItem('points', newPoints.toString());
      return true;
    }
    return false;
  };

  // Kullanıcıyı ve token'ı sıfırla (logout)
  const logout = async () => {
    setUser(null);
    setToken(null);
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('userData');
  };

  return (
    <UserContext.Provider value={{ user, setUser, token, saveToken, logout, saveUser, loading, points, setPoints: savePoints, addPoints, spendPoints }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
} 