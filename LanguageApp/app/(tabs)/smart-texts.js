import React from 'react';
import { View, StyleSheet, Platform, ScrollView, TouchableOpacity, Text, Modal, Animated } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useColorScheme as useDeviceColorScheme } from 'react-native';
import Navbar from '../../components/ui/Navbar';
import Sidebar from '../../components/ui/Sidebar';
import Footer from '../../components/ui/Footer';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useUser } from '../../context/UserContext';

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
        style={[styles.generateButton, { backgroundColor: color, flexDirection: 'row', alignItems: 'center', gap: 8 }]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <MaterialIcons name="add" size={24} color="#fff" />
        <Text style={styles.generateButtonText}>Üret</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: isDark ? '#232136' : '#fff', borderRadius: 10, paddingVertical: 2, paddingHorizontal: 8, marginLeft: 6, gap: 2 }}>
          <FontAwesome5 name="trophy" size={18} color="#FBBF24" style={{ marginRight: 2 }} />
          <Text style={{ color: '#FBBF24', fontWeight: 'bold', fontSize: 15 }}>100</Text>
        </View>
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
  const { points, spendPoints } = useUser();
  const [modalVisible, setModalVisible] = React.useState(false);
  const [insufficientModal, setInsufficientModal] = React.useState(false);
  const [pendingCard, setPendingCard] = React.useState(null);
  const [modalAnim] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    if (modalVisible || insufficientModal) {
      Animated.timing(modalAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(modalAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [modalVisible, insufficientModal]);

  const handleGenerate = async (card) => {
    if (points < 100) {
      setInsufficientModal(true);
      return;
    }
    setPendingCard(card);
    setModalVisible(true);
  };

  const handleConfirm = async () => {
    if (points >= 100 && pendingCard) {
      const success = await spendPoints(100);
      setModalVisible(false);
      if (!success) {
        setInsufficientModal(true);
        return;
      }
      // Yönlendirme
      if (pendingCard.title === 'Hikaye Üret') {
        router.push('/texts/StoryGenerate');
      } else if (pendingCard.title === 'Makale Üret') {
        router.push('/texts/ArticleGenerate');
      } else if (pendingCard.title === 'Diyalog Üret') {
        router.push('/texts/DialogGenerate');
      } else if (pendingCard.title === 'Şiir Üret') {
        router.push('/texts/PoemGenerate');
      } else if (pendingCard.title === 'Blog Yazısı') {
        router.push('/texts/BlogGenerate');
      } else if (pendingCard.title === 'Haber Üret') {
        router.push('/texts/NewsGenerate');
      }
      setPendingCard(null);
    }
  };

  return (
    <>
      <Navbar />
      <LinearGradient
        colors={isDark ? ['#181825', '#232136', '#fbbf2422'] : ['#f8fafc', '#e0e7ff', '#a78bfa11']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1, flexDirection: isWeb ? 'row' : 'column', width: '100%', position: 'relative' }}>
          {isWeb && <Sidebar />}
          
          {/* Ana içerik */}
          <ScrollView 
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            <Text style={[styles.pageTitle, { color: isDark ? '#fbbf24' : '#7C3AED' }]}>Akıllı Metinler</Text>
            <Text style={[styles.pageDesc, { color: isDark ? '#fff' : '#232136' }]}>Yapay zeka ile metin üretmek için bir kart seç!</Text>
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
            <MaterialIcons name="settings" size={28} color={ACCENT} />
            <Text style={[styles.fabTextLarge, { color: ACCENT }]}>Metin Ayarları</Text>
          </TouchableOpacity>
        </View>
        {!isWeb && <Footer />}
      </LinearGradient>
      {/* Onay Modali */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <Animated.View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0008', opacity: modalAnim }}>
          <LinearGradient
            colors={isDark ? ['#232136', '#7C3AEDcc'] : ['#fff', '#a78bfaee']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ padding: 0, borderRadius: 28, minWidth: 320, alignItems: 'center', shadowColor: '#7C3AED', shadowOpacity: 0.18, shadowRadius: 24, elevation: 12 }}
          >
            <View style={{ alignItems: 'center', padding: 32, width: 320 }}>
              <View style={{ backgroundColor: isDark ? '#181825' : '#fff', borderRadius: 100, padding: 18, marginBottom: 12, shadowColor: '#a78bfa', shadowOpacity: 0.18, shadowRadius: 16, elevation: 8 }}>
                <MaterialIcons name="stars" size={48} color={isDark ? '#fbbf24' : '#7C3AED'} />
              </View>
              <Text style={{ fontWeight: 'bold', fontSize: 22, color: isDark ? '#fbbf24' : '#7C3AED', marginBottom: 10, textAlign: 'center', letterSpacing: 0.2 }}>Giriş Ücreti</Text>
              <Text style={{ color: isDark ? '#fff' : '#232136', fontSize: 17, textAlign: 'center', marginBottom: 18, opacity: 0.92 }}>
                Bu bölüme giriş için <Text style={{ color: '#fbbf24', fontWeight: 'bold' }}>100 puan</Text> harcanacak. Devam etmek istiyor musunuz?
              </Text>
              <View style={{ flexDirection: 'row', gap: 18, marginTop: 8 }}>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={{ backgroundColor: '#F87171', paddingVertical: 12, paddingHorizontal: 28, borderRadius: 12, marginRight: 8, shadowColor: '#F87171', shadowOpacity: 0.18, shadowRadius: 8, elevation: 4 }}>
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 17, letterSpacing: 0.2 }}>Vazgeç</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleConfirm} style={{ backgroundColor: '#7C3AED', paddingVertical: 12, paddingHorizontal: 28, borderRadius: 12, shadowColor: '#7C3AED', shadowOpacity: 0.18, shadowRadius: 8, elevation: 4 }}>
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 17, letterSpacing: 0.2 }}>Evet</Text>
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
      </Modal>
      {/* Yetersiz Puan Modali */}
      <Modal visible={insufficientModal} transparent animationType="fade" onRequestClose={() => setInsufficientModal(false)}>
        <Animated.View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0008', opacity: modalAnim }}>
          <LinearGradient
            colors={isDark ? ['#232136', '#F87171cc'] : ['#fff', '#F87171ee']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ padding: 0, borderRadius: 28, minWidth: 320, alignItems: 'center', shadowColor: '#F87171', shadowOpacity: 0.18, shadowRadius: 24, elevation: 12 }}
          >
            <View style={{ alignItems: 'center', padding: 32, width: 320 }}>
              <View style={{ backgroundColor: isDark ? '#181825' : '#fff', borderRadius: 100, padding: 18, marginBottom: 12, shadowColor: '#F87171', shadowOpacity: 0.18, shadowRadius: 16, elevation: 8 }}>
                <MaterialIcons name="block" size={48} color={'#F87171'} />
              </View>
              <Text style={{ fontWeight: 'bold', fontSize: 22, color: '#F87171', marginBottom: 10, textAlign: 'center', letterSpacing: 0.2 }}>Yetersiz Puan</Text>
              <Text style={{ color: isDark ? '#fff' : '#232136', fontSize: 17, textAlign: 'center', marginBottom: 18, opacity: 0.92 }}>
                Üzgünüz, bu bölüme giriş için yeterli puanınız yok.
              </Text>
              <TouchableOpacity onPress={() => setInsufficientModal(false)} style={{ backgroundColor: '#7C3AED', paddingVertical: 12, paddingHorizontal: 28, borderRadius: 12, shadowColor: '#7C3AED', shadowOpacity: 0.18, shadowRadius: 8, elevation: 4 }}>
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 17, letterSpacing: 0.2 }}>Tamam</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>
      </Modal>
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
    width: 260,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    shadowColor: '#7C3AED',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 220,
    marginBottom: 18,
  },
  cardDark: {
    backgroundColor: '#232136',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  cardContent: {
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 6,
  },
  cardTitleDark: {
    color: '#fff',
  },
  cardDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 14,
    minHeight: 36,
  },
  cardDescriptionDark: {
    color: '#9CA3AF',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 22,
    borderRadius: 12,
    gap: 8,
    marginTop: 6,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    right: 8,
    bottom: 90,
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: 18,
    borderRadius: 28,
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
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.2,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 4,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  pageDesc: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 18,
    opacity: 0.85,
  },
});

export default SmartTextsScreen; 