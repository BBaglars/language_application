import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions, Platform, ScrollView, Image } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import Navbar from '../components/ui/Navbar';
import Sidebar from '../components/ui/Sidebar';

const cards = [
  {
    title: 'Yapay Zeka ile Metin Üret',
    desc: 'AI ile hikaye, diyalog ve metin oluştur.',
    color: ['#ff9a9e', '#fad0c4'],
    icon: '🤖',
    route: '/ai-text'
  },
  {
    title: 'Kelime Oyunları',
    desc: 'Eşleştirme, çeviri ve hikaye tamamlama oyunları.',
    color: ['#a1c4fd', '#c2e9fb'],
    icon: '🎮',
    route: '/games'
  },
  {
    title: 'Hikaye Oluştur / Oku',
    desc: 'AI ile hikaye üret, oku ve paylaş.',
    color: ['#fbc2eb', '#a6c1ee'],
    icon: '📖',
    route: '/stories'
  },
  {
    title: 'Kelime Listem',
    desc: 'Öğrendiğin kelimeleri ve ilerlemeni gör.',
    color: ['#fcb69f', '#ffecd2'],
    icon: '📒',
    route: '/words'
  },
  {
    title: 'İstatistiklerim',
    desc: 'Başarılarını ve seviyeni takip et.',
    color: ['#a8edea', '#fed6e3'],
    icon: '📊',
    route: '/stats'
  }
];

const menuItems = [
  { label: 'Ana Sayfa', route: '/home' },
  { label: 'Oyunlar', route: '/games' },
  { label: 'Kelime Listem', route: '/words' },
  { label: 'İstatistikler', route: '/stats' },
  { label: 'Ayarlar', route: '/settings' },
];

export default function HomeScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const numColumns = width > 900 ? 3 : 2;
  const cardWidth = width > 900 ? '31%' : '48%';
  // Navbar hover state (web)
  const [navHover, setNavHover] = React.useState(false);
  // Sidebar hover state
  const [sidebarHover, setSidebarHover] = React.useState(-1);

  return (
    <>
      <Navbar />
      <View style={{ flexDirection: isWeb ? 'row' : 'column', width: '100%', flex: 1 }}>
        {isWeb && <Sidebar />}
        <ScrollView style={{ flex: 1, backgroundColor: '#f8f9fb' }} contentContainerStyle={{ minHeight: '100%', alignItems: isWeb ? 'flex-start' : 'center', paddingBottom: !isWeb ? 70 : 0 }}>
          {/* Kişisel Karşılama ve Hedef */}
          <View style={[styles.webHeader, !isWeb && { alignItems: 'center' }]}> 
            <Text style={styles.welcome}>Hoş geldin, Berkay! 👋</Text>
            <Text style={styles.subtitle}>Bugün ne yapmak istersin?</Text>
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>10</Text>
                <Text style={styles.statLabel}>Yeni Kelime</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>3</Text>
                <Text style={styles.statLabel}>Oyun</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>2</Text>
                <Text style={styles.statLabel}>Başarı</Text>
              </View>
            </View>
          </View>
          {/* Ana Fonksiyon Kartları */}
          <View style={[styles.cardsGrid, isWeb && { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start' }]}> 
            {cards.map((card, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.card,
                  isWeb ? styles.webCard : null,
                  { backgroundColor: card.color[0], width: isWeb ? 260 : '90%', margin: isWeb ? 18 : 10 },
                ]}
                activeOpacity={0.85}
                onPress={() => router.push(card.route)}
                onMouseEnter={isWeb ? (e) => e.currentTarget.style.boxShadow = '0 8px 32px #0002' : undefined}
                onMouseLeave={isWeb ? (e) => e.currentTarget.style.boxShadow = '0 2px 8px #0001' : undefined}
              >
                <Text style={styles.cardIcon}>{card.icon}</Text>
                <Text style={styles.cardTitle}>{card.title}</Text>
                <Text style={styles.cardDesc}>{card.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {/* Motivasyon ve İpucu Alanı */}
          <View style={styles.motivationArea}>
            <Text style={styles.motivationTitle}>Günün Motivasyonu</Text>
            <Text style={styles.motivationText}>
              “Her gün küçük bir adım, büyük bir ilerlemenin başlangıcıdır.”
            </Text>
            <Text style={styles.tipTitle}>Dil İpucu</Text>
            <Text style={styles.tipText}>Yeni öğrendiğin kelimeleri cümle içinde kullanarak pekiştir!</Text>
          </View>
          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>© 2024 LingoSpark • Tüm hakları saklıdır.</Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Text style={styles.footerLink}>Gizlilik</Text>
              <Text style={styles.footerLink}>İletişim</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  navbar: {
    height: 60,
    backgroundColor: '#4F46E5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    zIndex: 10
  },
  navbarHover: {
    backgroundColor: '#3730A3',
    transition: 'background 0.2s'
  },
  navLeft: { flexDirection: 'row', alignItems: 'center' },
  logo: { width: 36, height: 36, borderRadius: 8, marginRight: 10 },
  appName: { color: '#fff', fontSize: 22, fontWeight: 'bold', letterSpacing: 1 },
  profileArea: { flexDirection: 'row', alignItems: 'center' },
  profilePic: { width: 36, height: 36, borderRadius: 18, marginRight: 8, borderWidth: 2, borderColor: '#fff' },
  profileName: { color: '#fff', fontWeight: '600', fontSize: 16 },
  sidebar: {
    width: 200,
    backgroundColor: '#fff',
    borderRightWidth: 1,
    borderRightColor: '#ececec',
    paddingVertical: 30,
    paddingHorizontal: 10,
    minHeight: '100%'
  },
  menuItem: {
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 6,
    transition: 'background 0.2s',
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  menuItemActive: {
    backgroundColor: '#fff',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    zIndex: 2,
  },
  menuItemHover: {
    backgroundColor: '#4F46E5',
  },
  menuText: { fontSize: 16, color: '#4F46E5', fontWeight: '500' },
  menuTextActive: { color: '#4F46E5', fontWeight: 'bold' },
  menuTextHover: { color: '#fff' },
  menuAccent: {
    width: 6,
    height: 32,
    backgroundColor: '#4F46E5',
    borderRadius: 4,
    marginRight: 10,
  },
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  welcome: { fontSize: 28, fontWeight: 'bold', color: '#3a3a3a', marginTop: 20, textAlign: 'center' },
  subtitle: { fontSize: 18, color: '#666', marginBottom: 20, textAlign: 'center' },
  cardsGrid: {
    width: '100%',
    marginTop: 18,
    marginBottom: 18,
    flexDirection: 'column',
    alignItems: 'center',
  },
  card: {
    borderRadius: 18,
    padding: 22,
    marginBottom: 18,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    alignItems: 'center',
    minHeight: 160,
    transition: 'box-shadow 0.2s'
  },
  webCard: {
    cursor: 'pointer'
  },
  cardIcon: { fontSize: 40, marginBottom: 12 },
  cardTitle: { fontSize: 20, fontWeight: 'bold', color: '#222', textAlign: 'center' },
  cardDesc: { fontSize: 15, color: '#444', marginTop: 6, textAlign: 'center' },
  motivationArea: {
    marginTop: 18,
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 22,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    alignItems: 'flex-start',
  },
  motivationTitle: { fontSize: 16, fontWeight: 'bold', color: '#4F46E5', marginBottom: 4 },
  motivationText: { fontSize: 15, color: '#ff7e5f', marginBottom: 10 },
  tipTitle: { fontSize: 15, fontWeight: 'bold', color: '#10B981', marginTop: 6 },
  tipText: { fontSize: 14, color: '#222', marginTop: 2 },
  footer: {
    height: 48,
    backgroundColor: '#f3f4f6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    borderTopWidth: 1,
    borderTopColor: '#ececec',
    zIndex: 20
  },
  footerText: { color: '#888', fontSize: 14 },
  footerLink: { color: '#4F46E5', fontSize: 14, marginLeft: 12, fontWeight: '500' },
  webHeader: {
    marginTop: 24,
    marginBottom: 12,
    alignItems: 'flex-start',
    width: '100%',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 18,
    marginTop: 18,
    marginBottom: 8,
  },
  statBox: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 22,
    alignItems: 'center',
    minWidth: 80,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  statValue: { fontSize: 22, fontWeight: 'bold', color: '#4F46E5' },
  statLabel: { fontSize: 13, color: '#666', marginTop: 2 },
}); 