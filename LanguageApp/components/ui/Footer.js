import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useColorScheme as useDeviceColorScheme } from 'react-native';
import { useUser } from '../../context/UserContext';
import { Portal } from 'react-native-paper';

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
  const { theme, setTheme } = useTheme();
  const { logout } = useUser();
  const deviceColorScheme = useDeviceColorScheme();
  const colorScheme = theme === 'system' ? deviceColorScheme : theme;
  const isDark = colorScheme === 'dark';
  const [fabOpen, setFabOpen] = React.useState(false);
  const isMobile = Platform.OS !== 'web';

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
          const isSettings = item.label === 'Ayarlar';
          return (
            <TouchableOpacity
              key={item.route}
              style={[styles.menuItem, isCenter && styles.centerItem]}
              onPress={() => {
                if (isMobile && isSettings) {
                  setFabOpen(true);
                } else {
                  router.push(item.route);
                }
              }}
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
      {/* Mobilde Ayarlar FAB */}
      {fabOpen && isMobile && (
        <Portal>
          <TouchableOpacity
            style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              zIndex: 999999,
              backgroundColor: 'rgba(0,0,0,0.08)',
            }}
            onPress={() => setFabOpen(false)}
            activeOpacity={1}
          />
          <View style={{
            position: 'absolute',
            left: 'auto',
            right: 8,
            bottom: 125,
            backgroundColor: isDark ? '#232136' : '#fff',
            borderRadius: 16,
            padding: 12,
            shadowColor: '#7C3AED',
            shadowOpacity: isDark ? 0.22 : 0.13,
            shadowRadius: 12,
            elevation: 999999,
            borderWidth: 1.5,
            borderColor: '#a78bfa',
            zIndex: 999999,
            minWidth: 140,
            maxWidth: 240,
            alignItems: 'center',
          }}>
            <Text style={{
              color: isDark ? '#fff' : '#a78bfa',
              fontWeight: 'bold',
              fontSize: 15,
              marginBottom: 10,
              textAlign: 'center',
              letterSpacing: 0.4,
            }}>Tema</Text>
            <View style={{ flexDirection: 'row', gap: 6, marginBottom: 14 }}>
              {['light', 'dark', 'system'].map((mode, i) => (
                <TouchableOpacity
                  key={mode}
                  style={{
                    backgroundColor: theme === mode ? (isDark ? '#a78bfa33' : '#f3e8ff') : (isDark ? '#232136' : '#fff'),
                    borderRadius: 10,
                    padding: 7,
                    borderWidth: 1.5,
                    borderColor: theme === mode ? '#a78bfa' : (isDark ? '#444' : '#e5e7eb'),
                    marginRight: i < 2 ? 5 : 0,
                  }}
                  onPress={() => setTheme(mode)}
                >
                  <Text style={{ fontSize: 18, color: isDark ? '#fff' : '#7C3AED' }}>
                    {mode === 'light' ? '☀️' : mode === 'dark' ? '🌙' : '💻'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={{
                backgroundColor: '#ef4444',
                borderRadius: 10,
                paddingVertical: 10,
                alignItems: 'center',
                width: '100%',
                flexDirection: 'row',
                justifyContent: 'center',
                marginTop: 2,
              }}
              onPress={async () => {
                await logout();
                router.replace('/login');
              }}
            >
              <MaterialIcons name="logout" size={18} color="#fff" style={{ marginRight: 6 }} />
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 14, letterSpacing: 0.4 }}>Çıkış Yap</Text>
            </TouchableOpacity>
          </View>
        </Portal>
      )}
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