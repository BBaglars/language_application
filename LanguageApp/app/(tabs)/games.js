import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GameSetup from './games/GameSetup';
import Navbar from '../../components/ui/Navbar';
import Sidebar from '../../components/ui/Sidebar';
import Footer from '../../components/ui/Footer';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useColorScheme as useDeviceColorScheme } from 'react-native';
import { useUser } from '../../context/UserContext';
import { LinearGradient } from 'expo-linear-gradient';

const mockUser = {
  id: 1,
  name: 'berkay',
};

const gameTypes = [
  {
    type: 'LINGO',
    title: 'Lingo Oyunu',
    desc: 'Harfleri tahmin ederek kelimeyi bul.',
    colors: ['#f7971e', '#ffd200'],
    icon: '💡',
    highlight: true,
    isNew: true,
  },
  {
    type: 'WORD_MATCH',
    title: 'Eşleştirme Oyunu',
    desc: 'Kelimeleri anlamlarıyla eşleştir.',
    colors: ['#43e97b', '#38f9d7'],
    icon: '🧩',
    isNew: true,
  },
  {
    type: 'WORD_SEARCH',
    title: 'Kelime Bulmaca',
    desc: 'Gizlenmiş kelimeleri bul.',
    colors: ['#6a11cb', '#2575fc'],
    icon: '🔍',
    isNew: true,
  },
  {
    type: 'WORD_SCRAMBLE',
    title: 'Kelime Karıştırma',
    desc: 'Karışık harfleri doğru sıraya diz!',
    colors: ['#f43f5e', '#fbbf24'],
    icon: '🔀',
    isNew: true,
  },
  {
    type: 'TRANSLATION',
    title: 'Çeviri Oyunu',
    desc: 'Kelimeleri doğru dile çevir.',
    colors: ['#fa709a', '#fee140'],
    icon: '🌐',
  },
  {
    type: 'STORY_COMPLETION',
    title: 'Hikaye Tamamlama',
    desc: 'Eksik kelimeleri tamamla.',
    colors: ['#30cfd0', '#330867'],
    icon: '📖',
  },
];

const mockGameResults = [
  {
    id: 1,
    gameType: 'WORD_MATCH',
    score: 85,
    correctAnswers: 17,
    wrongAnswers: 3,
    timeSpent: 120,
    date: '2024-06-10',
  },
  {
    id: 2,
    gameType: 'TRANSLATION',
    score: 70,
    correctAnswers: 14,
    wrongAnswers: 6,
    timeSpent: 150,
    date: '2024-06-09',
  },
];

const STORAGE_KEY = 'game-setup-selection';

const GAMES = [
  {
    type: 'LINGO',
    title: 'Lingo Oyunu',
    desc: 'Harfleri tahmin ederek kelimeyi bul.',
    icon: 'lightbulb',
    color: '#7C3AED',
    accent: ['#f7971e', '#ffd200'],
  },
  {
    type: 'WORD_MATCH',
    title: 'Eşleştirme Oyunu',
    desc: 'Kelimeleri anlamlarıyla eşleştir.',
    icon: 'extension',
    color: '#EC4899',
    accent: ['#43e97b', '#38f9d7'],
  },
  {
    type: 'WORD_SEARCH',
    title: 'Kelime Bulmaca',
    desc: 'Gizlenmiş kelimeleri bul.',
    icon: 'search',
    color: '#3B82F6',
    accent: ['#6a11cb', '#2575fc'],
  },
  {
    type: 'WORD_SCRAMBLE',
    title: 'Kelime Karıştırma',
    desc: 'Karışık harfleri doğru sıraya diz!',
    icon: 'shuffle',
    color: '#f43f5e',
    accent: ['#f43f5e', '#fbbf24'],
  },
  {
    type: 'TRANSLATION',
    title: 'Çeviri Oyunu',
    desc: 'Kelimeleri doğru dile çevir.',
    icon: 'translate',
    color: '#10B981',
    accent: ['#fa709a', '#fee140'],
  },
  {
    type: 'STORY_COMPLETION',
    title: 'Hikaye Tamamlama',
    desc: 'Eksik kelimeleri tamamla.',
    icon: 'menu-book',
    color: '#F59E0B',
    accent: ['#30cfd0', '#330867'],
  },
];

const GameCard = ({ game, onPress, isDark }) => (
  <TouchableOpacity
    style={[
      styles.card,
      { borderColor: game.color, backgroundColor: isDark ? '#232136' : '#fff', shadowColor: game.color + '55' }
    ]}
    onPress={onPress}
    activeOpacity={0.92}
  >
    <View style={[styles.iconCircle, { backgroundColor: game.color + '15' }]}> 
      <MaterialIcons name={game.icon} size={36} color={game.color} />
    </View>
    <Text style={[styles.cardTitle, isDark && { color: '#fff' }]}>{game.title}</Text>
    <Text style={[styles.cardDesc, isDark && { color: '#cbd5e1' }]}>{game.desc}</Text>
    <TouchableOpacity
      style={[styles.playButton, { backgroundColor: game.color }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <MaterialIcons name="play-arrow" size={22} color="#fff" />
      <Text style={styles.playButtonText}>Oyna</Text>
    </TouchableOpacity>
  </TouchableOpacity>
);

export default function GamesScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [gameSetup, setGameSetup] = useState(null);
  const [showSetup, setShowSetup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState(null);
  const isWeb = Platform.OS === 'web';
  const { theme } = useTheme();
  const deviceColorScheme = useDeviceColorScheme();
  const colorScheme = theme === 'system' ? deviceColorScheme : theme;
  const isDark = colorScheme === 'dark';
  const { user } = useUser ? useUser() : { user: null };

  useEffect(() => {
    // AsyncStorage'dan son seçimleri yükle
    const loadGameSetup = async () => {
      try {
        const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
          setGameSetup(JSON.parse(data));
        }
      } catch (error) {
        console.error('Game setup yüklenirken hata:', error);
      } finally {
      setLoading(false);
      }
    };
    loadGameSetup();
  }, []);

  const handleGameSetup = async (setup) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(setup));
      setGameSetup(setup);
      setShowSetup(false);
    } catch (error) {
      console.error('Game setup kaydedilirken hata:', error);
    }
  };

  const handleGamePress = (game) => {
    if (game.type === 'TRANSLATION' || game.type === 'STORY_COMPLETION') {
      // Hiçbir şey yapma
      return;
    }
    if (game.type === 'LINGO') router.push('/games/lingo');
    else if (game.type === 'WORD_MATCH') router.push('/games/MatchingGame');
    else if (game.type === 'WORD_SEARCH') router.push('/games/WordSearchGame');
    else if (game.type === 'WORD_SCRAMBLE') router.push('/games/WordScramble');
    else if (game.type === 'TRANSLATION') router.push('/games/TranslationGame');
    else if (game.type === 'STORY_COMPLETION') router.push('/games/StoryCompletion');
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#4F46E5" style={{ marginTop: 40 }} />;
  }

  if (showSetup) {
    return <GameSetup onStart={handleGameSetup} onBack={() => setShowSetup(false)} />;
  }

  if (!gameSetup) {
    return <GameSetup onStart={handleGameSetup} onBack={() => setShowSetup(false)} />;
  }

  if (selectedGame && selectedGame.type !== 'LINGO') {
    // Mock oyun ekranı
    return (
      <View style={styles.mockGameContainer}>
        <Text style={styles.mockGameTitle}>{selectedGame.title}</Text>
        <Text style={styles.mockGameDesc}>Bu bir mock oyun ekranıdır. Gerçek oyun yakında!</Text>
        <TouchableOpacity style={styles.mockGameBtn} onPress={() => setSelectedGame(null)}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Geri Dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
        >
            <Text style={[styles.pageTitle, { color: isDark ? '#fbbf24' : '#7C3AED' }]}>Oyunlar</Text>
            <Text style={[styles.pageDesc, { color: isDark ? '#fff' : '#232136' }]}>Pratik yapmak için bir oyun seç!</Text>
            <View style={styles.cardsGrid}>
              {GAMES.map((game) => (
                <GameCard
                key={game.type}
                  game={game}
                  onPress={() => handleGamePress(game)}
                  isDark={isDark}
                />
            ))}
          </View>
        </ScrollView>
          {/* Oyun Ayarları FAB */}
        <TouchableOpacity
            style={[
              styles.fab,
              isDark && styles.fabDark,
              { backgroundColor: isDark ? '#232136' : '#fff' }
            ]}
            onPress={() => router.push('/games/GameSetup')}
            activeOpacity={0.9}
        >
            <MaterialIcons name="settings" size={28} color={isDark ? '#fbbf24' : '#7C3AED'} />
            <Text style={[styles.fabLabel, { color: isDark ? '#fbbf24' : '#7C3AED' }]}>Oyun Ayarları</Text>
        </TouchableOpacity>
      </View>
      {!isWeb && <Footer />}
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  contentContainer: {
    paddingTop: 20,
    paddingBottom: 100,
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
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    justifyContent: 'center',
    marginTop: 10,
  },
  card: {
    width: 260,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    shadowOpacity: 0.10,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    marginBottom: 18,
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 220,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7C3AED',
    marginBottom: 6,
    textAlign: 'center',
  },
  cardDesc: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 14,
    minHeight: 36,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 22,
    borderRadius: 12,
    gap: 8,
    marginTop: 6,
  },
  playButtonText: {
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
    borderColor: '#fbbf24',
  },
  fabLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.2,
  },
  mockGameContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', padding: 24 },
  mockGameTitle: { fontSize: 24, fontWeight: 'bold', color: '#4F46E5', marginBottom: 12 },
  mockGameDesc: { fontSize: 16, color: '#444', marginBottom: 24, textAlign: 'center' },
  mockGameBtn: { backgroundColor: '#4F46E5', paddingVertical: 12, paddingHorizontal: 28, borderRadius: 10 },
}); 