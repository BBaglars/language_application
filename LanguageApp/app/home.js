import React from 'react';
import { View, Text, StyleSheet, Platform, ScrollView, Image } from 'react-native';
import Navbar from '../components/ui/Navbar';
import Sidebar from '../components/ui/Sidebar';
import Footer from '../components/ui/Footer';
import { useTheme } from '../context/ThemeContext';
import { useColorScheme as useDeviceColorScheme } from 'react-native';
import { useUser } from '../context/UserContext';

export default function HomeScreen() {
  const isWeb = Platform.OS === 'web';
  const { theme } = useTheme ? useTheme() : { theme: 'light' };
  const deviceColorScheme = useDeviceColorScheme ? useDeviceColorScheme() : 'light';
  const colorScheme = theme === 'system' ? deviceColorScheme : theme;
  const isDark = colorScheme === 'dark';
  const { user } = useUser ? useUser() : { user: null };
  // Temaya göre renkler
  const mainBg = isDark ? '#181825' : '#f8f6ff';
  const cardBg = isDark ? '#232136' : '#fff';
  const textColor = isDark ? '#fff' : '#222';
  const accent = '#7C3AED';
  const nameColor = isDark ? '#f472b6' : '#f472b6';
  const mottoColor = isDark ? '#a78bfa' : '#6366f1';
  const quoteTitleColor = isDark ? '#a78bfa' : '#a78bfa';
  const quoteColor = isDark ? '#e0e0e0' : '#444';
  const bgCircle1 = isDark ? '#fbbf24aa' : '#a78bfa33';
  const bgCircle2 = isDark ? '#fde68aaa' : '#f472b633';

  return (
    <>
      <Navbar />
      <View style={{ flexDirection: isWeb ? 'row' : 'column', width: '100%', flex: 1, backgroundColor: mainBg }}>
        {isWeb && <Sidebar />}
        <View style={styles.centerArea}>
          {/* Renkli arka plan şekilleri */}
          <View style={[styles.bgCircle1, { backgroundColor: bgCircle1 }]} />
          <View style={[styles.bgCircle2, { backgroundColor: bgCircle2 }]} />
          {/* Karşılama Alanı */}
          <View style={[styles.welcomeBox, { backgroundColor: cardBg, shadowColor: accent }]}> 
            <Image source={{ uri: user?.photoURL || 'https://api.dicebear.com/7.x/bottts/svg?seed=berkay' }} style={[styles.avatar, { backgroundColor: cardBg, borderColor: accent }]} />
            <Text style={[styles.hello, { color: accent }]}>Hoş geldin!</Text>
            <Text style={[styles.name, { color: nameColor }]}>{user?.name || 'Kullanıcı'} <Text style={styles.wave}>👋</Text></Text>
            <Text style={[styles.motto, { color: mottoColor }]}>Bugün harika bir gün, yeni bir şey öğren!</Text>
            <Text style={[styles.quoteTitle, { color: quoteTitleColor }]}>Günün Sözü</Text>
            <Text style={[styles.quote, { color: quoteColor }]}>
              "Başarı, her gün tekrarlanan küçük çabaların toplamıdır."
            </Text>
          </View>
        </View>
    </View>
      {!isWeb && <Footer />}
    </>
  );
}

const styles = StyleSheet.create({
  centerArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  bgCircle1: {
    position: 'absolute',
    width: 340,
    height: 340,
    borderRadius: 170,
    top: -80,
    left: -100,
    zIndex: 0,
  },
  bgCircle2: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    bottom: -60,
    right: -60,
    zIndex: 0,
  },
  welcomeBox: {
    borderRadius: 32,
    paddingVertical: 48,
    paddingHorizontal: 36,
    alignItems: 'center',
    shadowOpacity: 0.12,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
    zIndex: 2,
    minWidth: 320,
    maxWidth: 400,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    marginBottom: 18,
    borderWidth: 4,
  },
  hello: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  wave: {
    fontSize: 28,
  },
  motto: {
    fontSize: 18,
    marginBottom: 24,
    textAlign: 'center',
    fontWeight: '500',
  },
  quoteTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    marginTop: 10,
    letterSpacing: 0.5,
  },
  quote: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    maxWidth: 320,
  },
}); 