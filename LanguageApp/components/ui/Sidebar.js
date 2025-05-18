import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

const ACCENT = '#4F46E5';

const menuItems = [
  { label: 'Ana Sayfa', route: '/home' },
  { label: 'Oyunlar', route: '/games' },
  { label: 'Kelime Listem', route: '/words' },
  { label: 'Hikayeler', route: '/stories' },
  { label: 'İstatistikler', route: '/stats' },
  { label: 'Ayarlar', route: '/settings' },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [hovered, setHovered] = useState(null);
  const isWeb = Platform.OS === 'web';

  // Aktif menü kontrolü için fonksiyon
  function isActive(route) {
    return pathname.startsWith(route);
  }

  return (
    <View style={styles.sidebar}>
      {menuItems.map((item, idx) => {
        const isActive = pathname.startsWith(item.route);
        const isHover = hovered === idx;
        return (
          <TouchableOpacity
            key={item.route}
            style={[
              styles.menuItem,
              isActive && styles.activeMenu,
              !isActive && isHover && styles.hoverMenu,
            ]}
            onPress={() => router.push(item.route)}
            activeOpacity={0.85}
            {...(isWeb && {
              onMouseEnter: () => setHovered(idx),
              onMouseLeave: () => setHovered(null),
            })}
          >
            {isActive && <View style={styles.accentBar} />}
            <Text style={[
              styles.menuText,
              isActive && styles.activeText,
              !isActive && isHover && styles.hoverText,
            ]}>{item.label}</Text>
          </TouchableOpacity>
        );
      })}
      <TouchableOpacity
        style={[styles.menuItem, isActive('/(tabs)/games')]}
        onPress={() => router.push('/(tabs)/games')}
      >
        <MaterialIcons name="sports-esports" size={22} color={isActive('/(tabs)/games') ? '#4F46E5' : '#888'} />
        <Text style={[styles.menuText, isActive('/(tabs)/games') && styles.menuTextActive]}>Oyunlar</Text>
      </TouchableOpacity>
      {/* Admin Paneli */}
      <TouchableOpacity
        style={[styles.menuItem, isActive('/(tabs)/admin')]}
        onPress={() => router.push('/(tabs)/admin')}
      >
        <MaterialIcons name="admin-panel-settings" size={22} color={isActive('/(tabs)/admin') ? '#4F46E5' : '#888'} />
        <Text style={[styles.menuText, isActive('/(tabs)/admin') && styles.menuTextActive]}>Admin Paneli</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 200,
    backgroundColor: '#fff',
    paddingVertical: 28,
    paddingHorizontal: 10,
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
    minHeight: '100%',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingLeft: 8,
    borderRadius: 12,
    marginBottom: 10,
    position: 'relative',
    backgroundColor: 'transparent',
    transition: 'background-color 0.18s',
  },
  activeMenu: {
    backgroundColor: '#f5f7ff',
    shadowColor: ACCENT,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  hoverMenu: {
    backgroundColor: ACCENT,
  },
  accentBar: {
    width: 6,
    height: 32,
    borderRadius: 4,
    backgroundColor: ACCENT,
    marginRight: 10,
    shadowColor: ACCENT,
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  menuText: {
    fontSize: 16,
    color: ACCENT,
    fontWeight: '500',
    marginLeft: 4,
    transition: 'color 0.18s',
  },
  activeText: {
    fontWeight: 'bold',
    color: ACCENT,
    fontSize: 17,
  },
  hoverText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  menuTextActive: {
    fontWeight: 'bold',
    color: ACCENT,
    fontSize: 17,
  },
}); 