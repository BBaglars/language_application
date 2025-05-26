import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useColorScheme as useDeviceColorScheme } from 'react-native';
import { useUser } from '../../context/UserContext';
import { LinearGradient } from 'expo-linear-gradient';

const ThemeModal = React.lazy(() => import('./ThemeModal'));

export default function Navbar({ pageTitle }) {
  const isWeb = Platform.OS === 'web';
  const { theme, setTheme } = useTheme ? useTheme() : { theme: 'light', setTheme: () => {} };
  const deviceColorScheme = useDeviceColorScheme ? useDeviceColorScheme() : 'light';
  const colorScheme = theme === 'system' ? deviceColorScheme : theme;
  const isDark = colorScheme === 'dark';
  const [modalVisible, setModalVisible] = useState(false);
  const { user, points } = useUser ? useUser() : { user: null, points: 0 };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <LinearGradient
      colors={isDark ? ['#181825', '#232136', '#7C3AED'] : ['#f8fafc', '#e0e7ff', '#a78bfa']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[
        styles.navbar,
        !isWeb && styles.navbarMobile,
        isDark && styles.navbarDark
      ]}
    >
      <View style={styles.leftSection}>
        <View style={styles.logoContainer}>
          <View style={styles.logoWrapper}>
            <Text style={[styles.logoLingo, isDark && styles.logoDark]}>Lingo</Text>
            <Text style={[styles.logoSpark, isDark && styles.logoDark]}>Spark</Text>
            <Ionicons name="sparkles" size={28} color={isDark ? "#fff" : "#F59E42"} style={styles.sparkIcon} />
          </View>
        </View>
      </View>
      {pageTitle && (
        <View style={styles.centerSection}>
          <Text style={[styles.pageTitle, isDark && styles.pageTitleDark]}>{pageTitle}</Text>
        </View>
      )}
      <View style={styles.rightSection}>
        <View style={[styles.pointsBox, isDark && styles.pointsBoxDark]}>
          <MaterialIcons name="emoji-events" size={24} color="#FBBF24" style={{ marginRight: 7 }} />
          <Text style={[styles.pointsText, isDark && styles.pointsTextDark]}>{points}</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 26,
    paddingHorizontal: 40,
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
    shadowColor: '#7C3AED',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
    zIndex: 10,
  },
  navbarDark: {
    backgroundColor: 'transparent',
    shadowColor: '#232136',
    zIndex: 10,
  },
  navbarMobile: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
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
    fontSize: 34,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.18)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  logoSpark: {
    fontSize: 34,
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
  pointsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 22,
    paddingVertical: Platform.OS === 'web' ? 10 : 6,
    paddingHorizontal: Platform.OS === 'web' ? 28 : 14,
    shadowColor: '#FBBF24',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 2,
    borderColor: '#FBBF24',
  },
  pointsBoxDark: {
    backgroundColor: '#232136',
    borderColor: '#FBBF24',
    shadowColor: '#FBBF24',
  },
  pointsText: {
    fontWeight: 'bold',
    fontSize: Platform.OS === 'web' ? 21 : 15,
    color: '#b45309',
    letterSpacing: 1.2,
  },
  pointsTextDark: {
    color: '#FBBF24',
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageTitle: {
    fontSize: Platform.OS === 'web' ? 22 : 18,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1.1,
    textShadowColor: 'rgba(0,0,0,0.13)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  pageTitleDark: {
    color: '#fbbf24',
    textShadowColor: '#232136',
  },
}); 