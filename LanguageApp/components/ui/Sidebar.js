import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useColorScheme as useDeviceColorScheme } from 'react-native';
import { useUser } from '../../context/UserContext';

const ACCENT = '#7C3AED';

const menuItems = [
  { label: 'Ana Sayfa', route: '/home', icon: 'home' },
  { label: 'Oyunlar', route: '/games', icon: 'sports-esports', isNew: true },
  { label: 'Kelime Listem', route: '/words', icon: 'list' },
  { label: 'Hikayeler', route: '/stories', icon: 'menu-book' },
  { label: 'İstatistikler', route: '/stats', icon: 'bar-chart' },
  { label: 'Ayarlar', route: '/settings', icon: 'settings' },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [hovered, setHovered] = useState(null);
  const { theme } = useTheme();
  const deviceColorScheme = useDeviceColorScheme();
  const colorScheme = theme === 'system' ? deviceColorScheme : theme;
  const isDark = colorScheme === 'dark';
  const isWeb = Platform.OS === 'web';
  const { user, logout } = useUser ? useUser() : { user: null, logout: () => {} };

  // Aktif menü kontrolü için fonksiyon
  function isActive(route) {
    return pathname.startsWith(route);
  }

  return (
    <View style={[styles.sidebar, isDark && styles.sidebarDark]}>
      <View style={styles.profileArea}>
        <View style={styles.avatarCircle}>
          {user?.photoURL ? (
            <img src={user.photoURL} alt="avatar" style={{ width: 54, height: 54, borderRadius: 27 }} />
          ) : (
            <Text style={styles.avatarText}>{user?.name ? user.name[0].toUpperCase() : 'K'}</Text>
          )}
        </View>
        <Text style={styles.profileName}>{user?.name || 'Kullanıcı'}</Text>
      </View>
      <View style={styles.divider} />
      {menuItems.map((item, idx) => {
        const active = isActive(item.route);
        const isHover = hovered === idx;
        return (
          <TouchableOpacity
            key={item.route}
            style={[
              styles.menuItem,
              active && styles.activeMenu,
              !active && isHover && styles.hoverMenu,
            ]}
            onPress={() => router.push(item.route)}
            activeOpacity={0.88}
            {...(isWeb && {
              onMouseEnter: () => setHovered(idx),
              onMouseLeave: () => setHovered(null),
            })}
          >
            <MaterialIcons name={item.icon} size={24} color={active ? '#fff' : ACCENT} style={{ marginRight: 12 }} />
            <Text style={[styles.menuText, active && styles.activeText, !active && isHover && styles.hoverText]}>{item.label}</Text>
            {item.isNew && <View style={styles.newBadge}><Text style={styles.newBadgeText}>Yeni</Text></View>}
          </TouchableOpacity>
        );
      })}
      {/* Çıkış Yap butonu */}
      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={async () => {
          await logout();
          router.replace('/login');
        }}
        activeOpacity={0.88}
      >
        <MaterialIcons name="logout" size={22} color="#ef4444" style={{ marginRight: 10 }} />
        <Text style={styles.logoutText}>Çıkış Yap</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 220,
    backgroundColor: '#fff',
    paddingVertical: 32,
    paddingHorizontal: 16,
    minHeight: '100%',
    borderRightWidth: 1,
    borderRightColor: '#ececec',
    shadowColor: '#7C3AED',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  sidebarDark: {
    backgroundColor: '#232136',
    borderRightColor: '#232136',
  },
  profileArea: {
    alignItems: 'center',
    marginBottom: 18,
  },
  avatarCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    shadowColor: '#7C3AED',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 26,
  },
  profileName: {
    color: '#7C3AED',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#e9d5ff',
    marginVertical: 10,
    width: '100%',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingLeft: 10,
    borderRadius: 14,
    marginBottom: 12,
    position: 'relative',
    backgroundColor: 'transparent',
    transition: 'background-color 0.18s',
  },
  activeMenu: {
    backgroundColor: '#7C3AED',
    shadowColor: '#7C3AED',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
  },
  hoverMenu: {
    backgroundColor: '#a78bfa',
  },
  menuText: {
    fontSize: 17,
    color: ACCENT,
    fontWeight: '600',
    marginLeft: 4,
    transition: 'color 0.18s',
  },
  activeText: {
    fontWeight: 'bold',
    color: '#fff',
    fontSize: 18,
  },
  hoverText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  newBadge: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 10,
    shadowColor: '#7C3AED',
    shadowOpacity: 0.10,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  newBadgeText: {
    color: '#7C3AED',
    fontWeight: 'bold',
    fontSize: 13,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    paddingVertical: 12,
    paddingLeft: 10,
    borderRadius: 14,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  logoutText: {
    color: '#ef4444',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 