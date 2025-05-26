import React from 'react';
import { View, Text, StyleSheet, Platform, ScrollView, Image, TouchableOpacity } from 'react-native';
import Navbar from '../components/ui/Navbar';
import Sidebar from '../components/ui/Sidebar';
import Footer from '../components/ui/Footer';
import { useTheme } from '../context/ThemeContext';
import { useColorScheme as useDeviceColorScheme } from 'react-native';
import { useUser } from '../context/UserContext';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';

export default function HomeScreen() {
  const isWeb = Platform.OS === 'web';
  const { theme } = useTheme ? useTheme() : { theme: 'light' };
  const deviceColorScheme = useDeviceColorScheme ? useDeviceColorScheme() : 'light';
  const colorScheme = theme === 'system' ? deviceColorScheme : theme;
  const isDark = colorScheme === 'dark';
  const { user } = useUser ? useUser() : { user: null };
  const router = useRouter();
  // Temaya göre renkler
  const mainBg = isDark ? '#181825' : '#f8f6ff';
  const cardBg = isDark ? '#232136' : '#fff';
  const textColor = isDark ? '#fff' : '#222';
  const accent = '#7C3AED';
  const nameColor = isDark ? '#f472b6' : '#f472b6';
  const mottoColor = isDark ? '#a78bfa' : '#6366f1';
  const quoteTitleColor = isDark ? '#a78bfa' : '#a78bfa';
  const quoteColor = isDark ? '#e0e0e0' : '#444';

  return (
    <>
      <Navbar />
      <LinearGradient
        colors={
          isWeb
            ? (isDark ? ['#181825', '#232136', '#7C3AED'] : ['#f8fafc', '#e0e7ff', '#a78bfa'])
            : (isDark ? ['#232136', '#2d2250', '#181825'] : ['#ede9fe', '#e0e7ff', '#c7d2fe'])
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1 }}
      >
        <View style={{ flexDirection: isWeb ? 'row' : 'column', width: '100%', flex: 1 }}>
          {isWeb && <Sidebar />}
          <View style={styles.centerArea}>
            {/* Glassmorphism Karşılama Kutusu */}
            <BlurView
              intensity={60}
              tint={isDark ? 'dark' : 'light'}
              style={[
                styles.glassBox,
                !isWeb && {
                  minWidth: 260,
                  maxWidth: 320,
                  paddingVertical: 32,
                  paddingHorizontal: 18,
                  marginTop: -70,
                  marginBottom: 0,
                  backgroundColor: '#232136',
                  borderColor: '#3b3171',
                  borderWidth: 2.5,
                  shadowColor: '#a78bfa',
                  shadowOpacity: 0.18,
                  shadowRadius: 24,
                  shadowOffset: { width: 0, height: 8 },
                  elevation: 14,
                }
              ]}
            >
              {/* LingoSpark Logo ve Sparkle */}
              <View style={styles.logoRow}>
                <MaterialIcons name="auto-awesome" size={28} color={isDark ? '#fbbf24' : '#7C3AED'} style={{ marginRight: 8 }} />
                <Text style={styles.lingoSparkText}>LingoSpark</Text>
              </View>
              {/* Avatar + Gradient Border */}
              <LinearGradient
                colors={['#7C3AED', '#fbbf24']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                  styles.avatarGradient,
                  !isWeb && {
                    width: 90,
                    height: 90,
                    borderRadius: 45,
                    marginBottom: 14,
                    marginTop: 4,
                    padding: 3,
                  }
                ]}
              >
                <Image
                  source={{
                    uri: user?.photoURL ||
                      (!isWeb
                        ? 'https://api.dicebear.com/7.x/bottts/png?seed=berkay'
                        : 'https://api.dicebear.com/7.x/bottts/svg?seed=berkay')
                  }}
                  style={[
                    styles.avatarModern2,
                    !isWeb && {
                      width: 80,
                      height: 80,
                      borderRadius: 40,
                      borderWidth: 3,
                    }
                  ]}
                />
              </LinearGradient>
              {/* Hoş geldin */}
              <Text style={styles.helloModern2}>Hoş geldin!</Text>
              {/* Kullanıcı adı (gradient text) */}
              <Text style={[styles.nameModern2, { color: isDark ? '#fff' : '#232136' }]}>{user?.name || 'Kullanıcı'}</Text>
              {/* Motto */}
              <Text style={styles.mottoModern2}>"Bugün harika bir gün, yeni bir şey öğren!"</Text>
              {/* Günün sözü kutusu */}
              <BlurView
                intensity={40}
                tint={isDark ? 'dark' : 'light'}
                style={[
                  styles.quoteGlassBox,
                  !isWeb && {
                    backgroundColor: '#1a1533',
                  }
                ]}
              >
                <View style={styles.quoteRow}>
                  <MaterialIcons name="auto-awesome" size={20} color={isDark ? '#fbbf24' : '#7C3AED'} style={{ marginRight: 6 }} />
                  <Text style={styles.quoteModernTitle2}>Günün Sözü</Text>
                </View>
                <Text style={styles.quoteModernText2}>
                  "Başarı, her gün tekrarlanan küçük çabaların toplamıdır."
                </Text>
              </BlurView>
            </BlurView>
          </View>
        </View>
        {!isWeb && <Footer />}
      </LinearGradient>
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
  glassBox: {
    borderRadius: 40,
    paddingVertical: 48,
    paddingHorizontal: 36,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7C3AED',
    shadowOpacity: 0.13,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
    minWidth: 340,
    maxWidth: 440,
    marginBottom: 36,
    marginTop: 24,
    borderWidth: 2,
    borderColor: 'rgba(124,58,237,0.18)',
    backgroundColor: 'rgba(255,255,255,0.18)',
    overflow: 'hidden',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  lingoSparkText: {
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 1.2,
    backgroundColor: 'transparent',
  },
  avatarGradient: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    marginTop: 2,
    padding: 3,
  },
  avatarModern2: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#fff',
    backgroundColor: '#fff',
  },
  helloModern2: {
    fontSize: 15,
    fontWeight: '600',
    color: '#a78bfa',
    marginBottom: 2,
    letterSpacing: 0.5,
    marginTop: 2,
  },
  nameModern2: {
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 1.1,
    textAlign: 'center',
    backgroundColor: 'transparent',
  },
  mottoModern2: {
    fontSize: 17,
    fontStyle: 'italic',
    color: '#a78bfa',
    marginBottom: 24,
    textAlign: 'center',
    fontWeight: '500',
    maxWidth: 320,
  },
  quoteGlassBox: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(124,58,237,0.18)',
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#7C3AED',
    shadowOpacity: 0.10,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    minWidth: 240,
    maxWidth: 360,
    backgroundColor: 'rgba(255,255,255,0.18)',
    overflow: 'hidden',
  },
  quoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  quoteModernTitle2: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#7C3AED',
    letterSpacing: 0.5,
  },
  quoteModernText2: {
    fontSize: 15,
    fontStyle: 'italic',
    color: '#6B7280',
    textAlign: 'center',
    maxWidth: 320,
  },
}); 