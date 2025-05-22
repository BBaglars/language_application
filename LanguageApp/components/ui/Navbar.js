import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useColorScheme as useDeviceColorScheme } from 'react-native';

const ThemeModal = React.lazy(() => import('./ThemeModal'));

export default function Navbar() {
  const isWeb = Platform.OS === 'web';
  const { theme, setTheme } = useTheme ? useTheme() : { theme: 'light', setTheme: () => {} };
  const deviceColorScheme = useDeviceColorScheme ? useDeviceColorScheme() : 'light';
  const colorScheme = theme === 'system' ? deviceColorScheme : theme;
  const isDark = colorScheme === 'dark';
  const [modalVisible, setModalVisible] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <View style={[
      styles.navbar,
      !isWeb && styles.navbarMobile,
      isDark && styles.navbarDark
    ]}>
      <View style={styles.leftSection}>
        <View style={styles.logoContainer}>
          <View style={styles.logoWrapper}>
            <Text style={[styles.logoLingo, isDark && styles.logoDark]}>Lingo</Text>
            <Text style={[styles.logoSpark, isDark && styles.logoDark]}>Spark</Text>
            <Ionicons name="sparkles" size={24} color={isDark ? "#fff" : "#F59E42"} style={styles.sparkIcon} />
          </View>
        </View>
      </View>
      <View style={styles.rightSection}>
        <TouchableOpacity onPress={toggleTheme} style={styles.themeButton}>
          <Text style={styles.themeIcon}>{isDark ? '🌙' : '☀️'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 32,
    backgroundColor: '#7C3AED',
    borderBottomWidth: 0,
    shadowColor: '#7C3AED',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
    zIndex: 10,
  },
  navbarDark: {
    backgroundColor: '#232136',
    shadowColor: '#232136',
    zIndex: 10,
  },
  navbarMobile: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  logoLingo: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 1.5,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  logoSpark: {
    fontSize: 28,
    fontWeight: '900',
    color: '#F59E42',
    letterSpacing: 1.5,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  sparkIcon: {
    position: 'absolute',
    right: -20,
    top: -4,
    transform: [{ rotate: '15deg' }],
  },
  logoDark: {
    color: '#fff',
    textShadowColor: 'rgba(124, 58, 237, 0.3)',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeButton: {
    backgroundColor: 'transparent',
    borderRadius: 24,
    padding: 4,
  },
  themeIcon: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
}); 