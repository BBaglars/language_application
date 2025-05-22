import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useColorScheme as useDeviceColorScheme } from 'react-native';

const ACCENT = '#7C3AED';

// Footer'ın gösterileceği sayfalar
const FOOTER_PAGES = ['/home', '/games', '/words', '/stories', '/settings'];

const menuItems = [
  { label: 'Oyunlar', route: '/games', icon: 'sports-esports', isNew: true },
  { label: 'Kelime', route: '/words', icon: 'list' },
  { label: 'Ana Sayfa', route: '/home', icon: 'home' },
  { label: 'Hikayeler', route: '/stories', icon: 'menu-book' },
  { label: 'Ayarlar', route: '/settings', icon: 'settings' },
];

export default function Footer() {
  const router = useRouter();
  const pathname = usePathname();
  const { theme } = useTheme();
  const deviceColorScheme = useDeviceColorScheme();
  const colorScheme = theme === 'system' ? deviceColorScheme : theme;
  const isDark = colorScheme === 'dark';

  // Eğer mevcut sayfa footer'da gösterilmesi gereken bir sayfa değilse, footer'ı gösterme
  if (!FOOTER_PAGES.some(page => pathname.startsWith(page))) {
    return null;
  }

  function isActive(route) {
    return pathname.startsWith(route);
  }

  return (
    <View style={[styles.footer, isDark && styles.footerDark]}>
      <View style={styles.menuContainer}>
        {menuItems.map((item, idx) => {
          const active = isActive(item.route);
          const isCenter = item.label === 'Ana Sayfa';
          
          return (
            <TouchableOpacity
              key={item.route}
              style={[styles.menuItem, isCenter && styles.centerItem]}
              onPress={() => router.push(item.route)}
              activeOpacity={0.88}
            >
              <View style={[
                styles.iconContainer,
                active && styles.activeIconContainer,
                isCenter && styles.centerIconContainer,
                isCenter && !active && styles.centerIconContainerInactive,
                isDark && styles.iconContainerDark,
                isDark && active && styles.activeIconContainerDark,
                isDark && isCenter && (active ? styles.centerIconContainerDark : styles.centerIconContainerInactiveDark)
              ]}>
                <MaterialIcons 
                  name={item.icon} 
                  size={isCenter ? 28 : 24} 
                  color={active ? '#fff' : (isDark ? '#a78bfa' : ACCENT)} 
                />
              </View>
              {item.isNew && !isCenter && (
                <View style={[styles.newBadge, isDark && styles.newBadgeDark]}>
                  <Text style={[styles.newBadgeText, isDark && styles.newBadgeTextDark]}>Yeni</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f3e8ff',
    shadowColor: '#7C3AED',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
    paddingVertical: 8,
  },
  footerDark: {
    backgroundColor: '#232136',
    borderTopColor: '#232136',
    shadowColor: '#232136',
  },
  iconContainerDark: {
    backgroundColor: '#232136',
  },
  activeIconContainerDark: {
    backgroundColor: '#a78bfa',
  },
  centerIconContainerDark: {
    backgroundColor: '#a78bfa',
  },
  newBadgeDark: {
    backgroundColor: '#232136',
    shadowColor: '#a78bfa',
  },
  newBadgeTextDark: {
    color: '#a78bfa',
  },
  menuContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  menuItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    position: 'relative',
    flex: 1,
  },
  centerItem: {
    marginTop: -20,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3e8ff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7C3AED',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  centerIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#7C3AED',
    shadowColor: '#7C3AED',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  centerIconContainerInactive: {
    backgroundColor: '#f3e8ff',
  },
  activeIconContainer: {
    backgroundColor: '#7C3AED',
  },
  newBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    shadowColor: '#7C3AED',
    shadowOpacity: 0.10,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  newBadgeText: {
    color: '#7C3AED',
    fontWeight: 'bold',
    fontSize: 10,
  },
  centerIconContainerInactiveDark: {
    backgroundColor: '#232136',
  },
}); 