import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useColorScheme as useDeviceColorScheme } from 'react-native';
import { useUser } from '../../context/UserContext';
import { LinearGradient } from 'expo-linear-gradient';

const ACCENT = '#7C3AED';

const menuItems = [
  { label: 'Ana Sayfa', route: '/home', icon: 'home' },
  { label: 'Oyunlar', route: '/games', icon: 'sports-esports', isNew: true },
  { label: 'Akıllı Metinler', route: '/smart-texts', icon: 'psychology' },
  { label: 'Metinler', route: '/stories', icon: 'menu-book', locked: true  },
  { label: 'İstatistikler', route: '/stats', icon: 'bar-chart', locked: true },
  { label: 'Ayarlar', route: '/settings', icon: 'settings' },
];

let createPortal = null;
if (typeof window !== 'undefined') {
  try {
    // Sadece webde import et
    createPortal = require('react-dom').createPortal;
  } catch {}
}

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [hovered, setHovered] = useState(null);
  const { theme, setTheme } = useTheme ? useTheme() : { theme: 'light', setTheme: () => {} };
  const deviceColorScheme = useDeviceColorScheme();
  const colorScheme = theme === 'system' ? deviceColorScheme : theme;
  const isDark = colorScheme === 'dark';
  const isWeb = Platform.OS === 'web';
  const { user, logout } = useUser ? useUser() : { user: null, logout: () => {} };
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Aktif menü kontrolü için fonksiyon
  function isActive(route) {
    return pathname.startsWith(route);
  }

  // Ayarlar menü öğesinin index'ini bul
  const settingsIdx = menuItems.findIndex(item => item.label === 'Ayarlar');
  const MENU_ITEM_HEIGHT = 44; // Tahmini yükseklik (padding+icon+text)
  const PROFILE_AREA_HEIGHT = 210; // Profil alanı ve divider tahmini yükseklik
  const fabTop = PROFILE_AREA_HEIGHT + settingsIdx * MENU_ITEM_HEIGHT;

  return (
    <LinearGradient
      colors={isDark ? ['#181825', '#232136', '#4f378b'] : ['#f8fafc', '#e0e7ff', '#a78bfa']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={[styles.sidebar, isDark && styles.sidebarDark, { position: 'relative' }]}
    >
      <View style={styles.profileArea}>
        <View style={styles.avatarCircle}>
          {user?.photoURL ? (
            <img src={user.photoURL} alt="avatar" style={{ width: 64, height: 64, borderRadius: 32, boxShadow: '0 2px 12px #a78bfa33' }} />
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
              item.locked && styles.lockedMenuItem,
            ]}
            onPress={() => {
              if (item.locked) return;
              if (item.label === 'Ayarlar') {
                setSettingsOpen(v => !v);
              } else {
                router.push(item.route);
              }
            }}
            activeOpacity={item.locked ? 1 : 0.88}
            {...(isWeb && {
              onMouseEnter: () => setHovered(idx),
              onMouseLeave: () => setHovered(null),
            })}
          >
            {/* Aktif menüde sol renkli bar */}
            {active && <View style={styles.activeBar} />}
            <MaterialIcons name={item.icon} size={28} color={active ? '#fff' : (item.locked ? ACCENT : ACCENT)} style={{ marginRight: 16, marginLeft: 2 }} />
            <Text style={[
              styles.menuText,
              active && styles.activeText,
              !active && isHover && styles.hoverText,
              item.locked && styles.lockedText,
              isDark && !active && !isHover && !item.locked && { color: '#e0e7ff' },
              isDark && item.locked && { color: '#bdbdf6' },
            ]}>{item.label}</Text>
            {item.isNew && <View style={styles.newBadge}><Text style={styles.newBadgeText}>Yeni</Text></View>}
            {item.locked && <MaterialIcons name="lock" size={18} color={ACCENT} style={{ marginLeft: 8 }} />}
          </TouchableOpacity>
        );
      })}
      {/* Ayarlar FAB */}
      {settingsOpen && (
        <>
          {/* Overlay */}
          {isWeb && createPortal(
            <div
              style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                zIndex: 99998,
                background: 'transparent',
              }}
              onClick={() => setSettingsOpen(false)}
            />, document.body
          )}
          {/* FAB - Bir tık büyük ve modern */}
          {isWeb && createPortal(
            <View style={{
              position: 'fixed',
              left: 220,
              top: fabTop,
              background: isDark
                ? 'linear-gradient(135deg, #232136 80%, #a78bfa 100%)'
                : 'linear-gradient(135deg, #fff 80%, #ede9fe 100%)',
              borderRadius: 18,
              padding: 22,
              boxShadow: isDark
                ? '0 6px 24px 0 rgba(124,58,237,0.22)'
                : '0 6px 24px 0 rgba(124,58,237,0.13)',
              border: isDark ? '2.2px solid #a78bfa' : '2.2px solid #a78bfa',
              zIndex: 99999,
              minWidth: 200,
              maxWidth: 270,
              alignItems: 'center',
              transition: 'box-shadow 0.2s',
            }}>
              <Text style={{
                color: isDark ? '#fff' : '#a78bfa',
                fontWeight: 'bold',
                fontSize: 17,
                marginBottom: 13,
                textAlign: 'center',
                letterSpacing: 0.4,
              }}>Tema</Text>
              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 18 }}>
                {['light', 'dark', 'system'].map((mode, i) => (
                  <TouchableOpacity
                    key={mode}
                    style={{
                      backgroundColor: theme === mode ? (isDark ? '#a78bfa33' : '#f3e8ff') : (isDark ? '#232136' : '#fff'),
                      borderRadius: 12,
                      padding: 11,
                      borderWidth: 2,
                      borderColor: theme === mode ? '#a78bfa' : (isDark ? '#444' : '#e5e7eb'),
                      boxShadow: theme === mode ? (isDark ? '0 1px 6px #a78bfa55' : '0 1px 6px #a78bfa22') : 'none',
                      marginRight: i < 2 ? 7 : 0,
                      transition: 'all 0.18s',
                    }}
                    onPress={() => setTheme(mode)}
                  >
                    <Text style={{ fontSize: 21, color: isDark ? '#fff' : '#7C3AED' }}>
                      {mode === 'light' ? '☀️' : mode === 'dark' ? '🌙' : '💻'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                style={{
                  backgroundColor: '#ef4444',
                  borderRadius: 12,
                  paddingVertical: 13,
                  alignItems: 'center',
                  width: '100%',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  boxShadow: isDark ? '0 1px 8px #a78bfa55' : '0 1px 8px #ef444422',
                  marginTop: 4,
                  transition: 'background 0.18s',
                }}
                onPress={async () => {
                  await logout();
                  router.replace('/login');
                }}
              >
                <MaterialIcons name="logout" size={20} color="#fff" style={{ marginRight: 7 }} />
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16, letterSpacing: 0.4 }}>Çıkış Yap</Text>
              </TouchableOpacity>
            </View>,
            document.body
          )}
          {/* Mobilde overlay ve FAB */}
          {!isWeb && (
            <>
              <TouchableOpacity
                style={{
                  position: 'absolute',
                  top: 0, left: 0, right: 0, bottom: 0,
                  zIndex: 99998,
                  backgroundColor: 'transparent',
                }}
                onPress={() => setSettingsOpen(false)}
              />
              <View style={{
                position: 'absolute',
                left: 270,
                top: fabTop + 260,
                backgroundColor: isDark ? '#232136' : '#fff',
                borderRadius: 18,
                padding: 22,
                shadowColor: '#7C3AED',
                shadowOpacity: isDark ? 0.22 : 0.13,
                shadowRadius: 12,
                elevation: 99999,
                borderWidth: 2.2,
                borderColor: '#a78bfa',
                zIndex: 99999,
                minWidth: 200,
                maxWidth: 270,
                alignItems: 'center',
              }}>
                <Text style={{
                  color: isDark ? '#fff' : '#a78bfa',
                  fontWeight: 'bold',
                  fontSize: 17,
                  marginBottom: 13,
                  textAlign: 'center',
                  letterSpacing: 0.4,
                }}>Tema</Text>
                <View style={{ flexDirection: 'row', gap: 12, marginBottom: 18 }}>
                  {['light', 'dark', 'system'].map((mode, i) => (
                    <TouchableOpacity
                      key={mode}
                      style={{
                        backgroundColor: theme === mode ? (isDark ? '#a78bfa33' : '#f3e8ff') : (isDark ? '#232136' : '#fff'),
                        borderRadius: 12,
                        padding: 11,
                        borderWidth: 2,
                        borderColor: theme === mode ? '#a78bfa' : (isDark ? '#444' : '#e5e7eb'),
                        marginRight: i < 2 ? 7 : 0,
                      }}
                      onPress={() => setTheme(mode)}
                    >
                      <Text style={{ fontSize: 21, color: isDark ? '#fff' : '#7C3AED' }}>
                        {mode === 'light' ? '☀️' : mode === 'dark' ? '🌙' : '💻'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity
                  style={{
                    backgroundColor: '#ef4444',
                    borderRadius: 12,
                    paddingVertical: 13,
                    alignItems: 'center',
                    width: '100%',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    marginTop: 4,
                  }}
                  onPress={async () => {
                    await logout();
                    router.replace('/login');
                  }}
                >
                  <MaterialIcons name="logout" size={20} color="#fff" style={{ marginRight: 7 }} />
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16, letterSpacing: 0.4 }}>Çıkış Yap</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </>
      )}
      {/* Çıkış butonu */}
      <TouchableOpacity style={styles.logoutBtn} onPress={async () => { await logout(); router.replace('/login'); }}>
        <MaterialIcons name="logout" size={22} color="#ef4444" style={{ marginRight: 10 }} />
        <Text style={styles.logoutText}>Çıkış Yap</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 250,
    backgroundColor: '#fff',
    paddingVertical: Platform.OS === 'web' ? 40 : 20,
    paddingHorizontal: 22,
    minHeight: '100%',
    borderRightWidth: 0,
    borderRightColor: 'transparent',
    shadowColor: '#7C3AED',
    shadowOpacity: 0.10,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
    position: 'relative',
  },
  sidebarDark: {
    backgroundColor: 'transparent',
    borderRightColor: 'transparent',
  },
  profileArea: {
    alignItems: 'center',
    marginBottom: 28,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: '#7C3AED',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 32,
  },
  profileName: {
    color: '#7C3AED',
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  divider: {
    height: 2,
    backgroundColor: '#e9d5ff',
    marginVertical: 14,
    width: '100%',
    borderRadius: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingLeft: 16,
    borderRadius: 16,
    marginBottom: 7,
    position: 'relative',
    backgroundColor: 'transparent',
    transition: 'background-color 0.18s',
    minHeight: 54,
  },
  activeMenu: {
    backgroundColor: '#7C3AED',
    shadowColor: '#7C3AED',
    shadowOpacity: 0.14,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 3 },
  },
  hoverMenu: {
    backgroundColor: '#a78bfa',
  },
  activeBar: {
    position: 'absolute',
    left: 0,
    top: 8,
    bottom: 8,
    width: 5,
    borderRadius: 3,
    backgroundColor: '#fbbf24',
    zIndex: 2,
  },
  menuText: {
    fontSize: 19,
    color: ACCENT,
    fontWeight: '600',
    marginLeft: 6,
    transition: 'color 0.18s',
  },
  activeText: {
    fontWeight: 'bold',
    color: '#fff',
    fontSize: 20,
  },
  hoverText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  newBadge: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginLeft: 12,
    shadowColor: '#7C3AED',
    shadowOpacity: 0.13,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  newBadgeText: {
    color: '#7C3AED',
    fontWeight: 'bold',
    fontSize: 14,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 28,
    paddingVertical: 14,
    paddingLeft: 16,
    borderRadius: 16,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    shadowColor: '#ef4444',
    shadowOpacity: 0.10,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  logoutText: {
    color: '#ef4444',
    fontWeight: 'bold',
    fontSize: 17,
    letterSpacing: 0.3,
  },
  lockedMenuItem: {
    opacity: 1,
  },
  lockedText: {
    color: ACCENT,
  },
}); 