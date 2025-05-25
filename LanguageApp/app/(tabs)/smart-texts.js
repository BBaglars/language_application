import React from 'react';
import { View, StyleSheet, Platform, ScrollView, TouchableOpacity, Text } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useColorScheme as useDeviceColorScheme } from 'react-native';
import Navbar from '../../components/ui/Navbar';
import Sidebar from '../../components/ui/Sidebar';
import Footer from '../../components/ui/Footer';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const ACCENT = '#7C3AED';

const textCards = [
  {
    id: 1,
    title: 'Hikaye Üret',
    description: 'Seviyenize uygun, ilgi çekici bir hikaye oluşturun',
    icon: 'auto-stories',
    color: '#7C3AED',
  },
  {
    id: 2,
    title: 'Makale Üret',
    description: 'Güncel konularda bilgilendirici makaleler oluşturun',
    icon: 'article',
    color: '#EC4899',
  },
  {
    id: 3,
    title: 'Diyalog Üret',
    description: 'Günlük konuşma pratiği için diyaloglar oluşturun',
    icon: 'chat',
    color: '#3B82F6',
  },
  {
    id: 4,
    title: 'Blog Yazısı',
    description: 'İlgi alanlarınıza göre blog yazıları oluşturun',
    icon: 'edit-document',
    color: '#10B981',
  },
  {
    id: 5,
    title: 'Haber Üret',
    description: 'Güncel olaylar hakkında haber metinleri oluşturun',
    icon: 'newspaper',
    color: '#F59E0B',
  },
  {
    id: 6,
    title: 'Şiir Üret',
    description: 'Duygusal ve yaratıcı şiirler oluşturun',
    icon: 'format-quote',
    color: '#8B5CF6',
  },
];

const TextCard = ({ title, description, icon, color, onPress }) => {
  const { theme } = useTheme();
  const deviceColorScheme = useDeviceColorScheme();
  const colorScheme = theme === 'system' ? deviceColorScheme : theme;
  const isDark = colorScheme === 'dark';

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isDark && styles.cardDark,
        { borderColor: color }
      ]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
        <MaterialIcons name={icon} size={32} color={color} />
      </View>
      <View style={styles.cardContent}>
        <Text style={[styles.cardTitle, isDark && styles.cardTitleDark]}>{title}</Text>
        <Text style={[styles.cardDescription, isDark && styles.cardDescriptionDark]}>{description}</Text>
      </View>
      <TouchableOpacity
        style={[styles.generateButton, { backgroundColor: color }]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <MaterialIcons name="add" size={24} color="#fff" />
        <Text style={styles.generateButtonText}>Üret</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const SmartTextsScreen = () => {
  const router = useRouter();
  const { theme } = useTheme ? useTheme() : { theme: 'light' };
  const deviceColorScheme = useDeviceColorScheme ? useDeviceColorScheme() : 'light';
  const colorScheme = theme === 'system' ? deviceColorScheme : theme;
  const isDark = colorScheme === 'dark';
  const isWeb = Platform.OS === 'web';

  const handleGenerate = (card) => {
    if (card.title === 'Hikaye Üret') {
      router.push('/texts/StoryGenerate');
    } else {
      console.log('Generating text for:', card.title);
    }
  };

  return (
    <>
      <Navbar />
      <View style={{ flex: 1, backgroundColor: isDark ? '#181825' : '#f8fafc' }}>
        <View style={{ flex: 1, flexDirection: isWeb ? 'row' : 'column', width: '100%', position: 'relative' }}>
          {/* Arka plan daireleri */}
          <View style={[styles.bgCircle1, isDark && styles.bgCircle1Dark]} />
          <View style={[styles.bgCircle2, isDark && styles.bgCircle2Dark]} />
          
          {isWeb && <Sidebar />}
          
          {/* Ana içerik */}
          <ScrollView 
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.cardsContainer}>
              {textCards.map((card) => (
                <TextCard
                  key={card.id}
                  {...card}
                  onPress={() => handleGenerate(card)}
                />
              ))}
            </View>
          </ScrollView>

          {/* Metin Ayarları FAB */}
          <TouchableOpacity
            style={[
              styles.fab,
              isDark && styles.fabDark,
              { backgroundColor: isDark ? '#232136' : '#fff' }
            ]}
            onPress={() => router.push('/texts/TextSetup')}
            activeOpacity={0.9}
          >
            <MaterialIcons name="settings" size={32} color={ACCENT} />
            <Text style={[styles.fabTextLarge, { color: ACCENT }]}>Metin Ayarları</Text>
          </TouchableOpacity>
        </View>
        {!isWeb && <Footer />}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  contentContainer: {
    paddingTop: 20,
    paddingBottom: 100,
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    justifyContent: 'center',
  },
  card: {
    width: 300,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    shadowColor: '#7C3AED',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  cardDark: {
    backgroundColor: '#232136',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  cardContent: {
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  cardTitleDark: {
    color: '#fff',
  },
  cardDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  cardDescriptionDark: {
    color: '#9CA3AF',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bgCircle1: {
    position: 'absolute',
    width: 340,
    height: 340,
    borderRadius: 170,
    top: -80,
    right: 40,
    zIndex: 0,
    backgroundColor: '#a78bfa33',
  },
  bgCircle1Dark: {
    backgroundColor: '#fbbf24aa',
  },
  bgCircle2: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    bottom: -60,
    left: 100,
    zIndex: 0,
    backgroundColor: '#f472b633',
  },
  bgCircle2Dark: {
    backgroundColor: '#fde68aaa',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 18,
    borderRadius: 40,
    shadowColor: '#7C3AED',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 7,
    borderWidth: 2,
    borderColor: '#7C3AED',
    gap: 12,
  },
  fabDark: {
    borderColor: '#a78bfa',
  },
  fabTextLarge: {
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 0.2,
  },
});

export default SmartTextsScreen; 