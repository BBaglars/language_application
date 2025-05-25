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
      <View style={{
        flexDirection: isWeb ? 'row' : 'column',
        width: '100%',
        flex: 1,
        position: 'relative',
        backgroundColor: isDark ? '#181825' : '#f8fafc',
      }}>
        {/* Arka plan daireleri */}
        <View style={[styles.bgCircle1, isDark && styles.bgCircle1Dark]} />
        <View style={[styles.bgCircle2, isDark && styles.bgCircle2Dark]} />
        {isWeb && <Sidebar />}
        <ScrollView
          style={{ flex: 1, backgroundColor: 'transparent' }}
          contentContainerStyle={{ minHeight: '100%', alignItems: 'center', paddingBottom: isWeb ? 100 : 130 }}
        >
          <Text style={isDark ? styles.welcomeDark : styles.welcome}>Merhaba, {user?.name || 'Kullanıcı'}! 🎮</Text>
          <Text style={isDark ? styles.subtitleDark : styles.subtitle}>Bugün hangi oyunla pratik yapmak istersin?</Text>
          <View style={styles.gamesGrid}>
            {gameTypes.map((game, idx) => (
              <TouchableOpacity
                key={game.type}
                style={styles.gameCardWrapper}
                activeOpacity={0.93}
                onPress={() => {
                  if (game.type === 'LINGO') {
                    router.push({ pathname: '/games/lingo', params: {
                      lang: gameSetup.lang,
                      langLabel: gameSetup.langLabel,
                      cat: gameSetup.cat,
                      catLabel: gameSetup.catLabel,
                      level: gameSetup.level,
                      levelLabel: gameSetup.levelLabel
                    }});
                  } else if (game.type === 'WORD_MATCH') {
                    router.push('/games/MatchingGame');
                  } else if (game.type === 'WORD_SEARCH') {
                    router.push('/games/WordSearchGame');
                  } else if (game.type === 'WORD_SCRAMBLE') {
                    router.push('/games/WordScramble');
                  } else {
                    setSelectedGame(game);
                  }
                }}
              >
                <View style={[
                  styles.gameCard,
                  game.highlight && styles.lingoCard,
                  { backgroundColor: game.colors[0] },
                  isDark && styles.gameCardDark
                ]}>
                  <View style={[styles.iconCircle, game.highlight && styles.lingoIconCircle]}>
                    <Text style={styles.gameIcon}>{game.icon}</Text>
                  </View>
                  {game.isNew && <View style={styles.newBadge}><Text style={styles.newBadgeText}>Yeni</Text></View>}
                  <Text style={isDark ? styles.gameTitleDark : styles.gameTitle}>{game.title}</Text>
                  <Text style={isDark ? styles.gameDescDark : styles.gameDesc}>{game.desc}</Text>
                  <TouchableOpacity 
                    style={isDark ? styles.startBtnDark : styles.startBtn}
                    onPress={() => {
                      if (game.type === 'LINGO') {
                        router.push({ pathname: '/games/lingo', params: {
                          lang: gameSetup.lang,
                          langLabel: gameSetup.langLabel,
                          cat: gameSetup.cat,
                          catLabel: gameSetup.catLabel,
                          level: gameSetup.level,
                          levelLabel: gameSetup.levelLabel
                        }});
                      } else if (game.type === 'WORD_MATCH') {
                        router.push('/games/MatchingGame');
                      } else if (game.type === 'WORD_SEARCH') {
                        router.push('/games/WordSearchGame');
                      } else if (game.type === 'WORD_SCRAMBLE') {
                        router.push('/games/WordScramble');
                      } else {
                        setSelectedGame(game);
                      }
                    }}
                  >
                    <Text style={isDark ? styles.startBtnTextDark : styles.startBtnText}>Başla</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        {/* FAB - Ayarları Değiştir */}
        <TouchableOpacity
          style={[styles.fab, !isWeb && styles.fabMobile]}
          onPress={() => setShowSetup(true)}
          activeOpacity={0.85}
        >
          <MaterialIcons name="settings" size={isWeb ? 32 : 28} color="#fff" />
          <Text style={styles.fabLabel}>Oyun Ayarları</Text>
        </TouchableOpacity>
      </View>
      {!isWeb && <Footer />}
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  welcome: { fontSize: 26, fontWeight: 'bold', color: '#4F46E5', marginTop: 20, textAlign: 'center' },
  subtitle: { fontSize: 17, color: '#666', marginBottom: 18, textAlign: 'center' },
  welcomeDark: { fontSize: 26, fontWeight: 'bold', color: '#fff', marginTop: 20, textAlign: 'center' },
  subtitleDark: { fontSize: 17, color: '#cbd5e1', marginBottom: 18, textAlign: 'center' },
  gamesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 28,
    marginTop: 36,
  },
  gameCardWrapper: {
    margin: 0,
  },
  gameCard: {
    width: 260,
    minHeight: 340,
    maxHeight: 340,
    borderRadius: 22,
    padding: 26,
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 8,
    position: 'relative',
    marginBottom: 0,
  },
  lingoCard: {
    borderWidth: 3,
    borderColor: '#f7971e',
    shadowColor: '#f7971e',
    shadowOpacity: 0.25,
    shadowRadius: 24,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
  },
  lingoIconCircle: {
    backgroundColor: '#fffbe6',
    borderWidth: 2,
    borderColor: '#ffd200',
  },
  gameIcon: {
    fontSize: 44,
    marginBottom: 0,
  },
  gameTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
    textShadowColor: '#0002',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  gameDesc: {
    fontSize: 16,
    color: '#f3f4f6',
    textAlign: 'center',
    marginBottom: 18,
  },
  startBtn: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 32,
    marginTop: 10,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  startBtnText: {
    color: '#f7971e',
    fontWeight: 'bold',
    fontSize: 16,
  },
  newBadge: {
    position: 'absolute',
    top: 14,
    right: 18,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    zIndex: 10,
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  newBadgeText: {
    color: '#f7971e',
    fontWeight: 'bold',
    fontSize: 13,
  },
  mockGameContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', padding: 24 },
  mockGameTitle: { fontSize: 24, fontWeight: 'bold', color: '#4F46E5', marginBottom: 12 },
  mockGameDesc: { fontSize: 16, color: '#444', marginBottom: 24, textAlign: 'center' },
  mockGameBtn: { backgroundColor: '#4F46E5', paddingVertical: 12, paddingHorizontal: 28, borderRadius: 10 },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    flexDirection: 'row',
    alignItems: 'center',
    width: undefined,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#7C3AED',
    paddingHorizontal: 24,
    shadowColor: '#7C3AED',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
    zIndex: 100,
  },
  fabMobile: {
    bottom: 90,
    height: 56,
    borderRadius: 28,
    paddingHorizontal: 18,
    right: 8,
  },
  fabLabel: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 14,
    letterSpacing: 0.5,
  },
  bgCircle1: {
    position: 'absolute',
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: '#38bdf833', // mavi-yeşil
    top: -80,
    left: Platform.OS === 'web' ? 60 : -100,
    zIndex: 0,
  },
  bgCircle2: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#60a5fa33', // mavi
    bottom: -60,
    right: Platform.OS === 'web' ? 60 : -60,
    zIndex: 0,
  },
  gameCardDark: {
    borderWidth: 2,
    borderColor: '#232136',
    shadowColor: '#7C3AED',
    shadowOpacity: 0.18,
    shadowRadius: 18,
    backgroundColor: '#232136',
  },
  gameTitleDark: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
    textShadowColor: '#0002',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  gameDescDark: {
    fontSize: 16,
    color: '#cbd5e1',
    textAlign: 'center',
    marginBottom: 18,
  },
  startBtnDark: {
    backgroundColor: '#7C3AED',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 32,
    marginTop: 10,
    alignSelf: 'center',
    shadowColor: '#7C3AED',
    shadowOpacity: 0.18,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  startBtnTextDark: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  bgCircle1Dark: {
    backgroundColor: '#38bdf8aa',
  },
  bgCircle2Dark: {
    backgroundColor: '#60a5faaa',
  },
}); 