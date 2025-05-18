import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GameSetup from './games/GameSetup';
import Navbar from '../../components/ui/Navbar';
import Sidebar from '../../components/ui/Sidebar';

const mockUser = {
  id: 1,
  name: 'berkay',
};

const gameTypes = [
  {
    type: 'WORD_MATCH',
    title: 'Eşleştirme Oyunu',
    desc: 'Kelimeleri anlamlarıyla eşleştir.',
    color: ['#a1c4fd', '#c2e9fb'],
    icon: '🔗',
  },
  {
    type: 'TRANSLATION',
    title: 'Çeviri Oyunu',
    desc: 'Kelimeleri doğru dile çevir.',
    color: ['#fbc2eb', '#a6c1ee'],
    icon: '🌐',
  },
  {
    type: 'STORY_COMPLETION',
    title: 'Hikaye Tamamlama',
    desc: 'Eksik kelimeleri tamamla.',
    color: ['#fcb69f', '#ffecd2'],
    icon: '📖',
  },
  {
    type: 'LINGO',
    title: 'Lingo Oyunu',
    desc: 'Harfleri tahmin ederek kelimeyi bul.',
    color: ['#ffe259', '#ffa751'],
    icon: '💡',
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

  useEffect(() => {
    // AsyncStorage'dan son seçimleri yükle
    AsyncStorage.getItem(STORAGE_KEY).then(data => {
      if (data) {
        try {
          setGameSetup(JSON.parse(data));
        } catch {}
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#4F46E5" style={{ marginTop: 40 }} />;
  }

  if (showSetup) {
    return <GameSetup onStart={setup => { setGameSetup(setup); setShowSetup(false); }} onBack={() => setShowSetup(false)} />;
  }

  if (!gameSetup) {
    // Hiç seçim yoksa ilk kez göster
    return <GameSetup onStart={setup => { setGameSetup(setup); setShowSetup(false); }} onBack={() => setShowSetup(false)} />;
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
      <View style={{ flexDirection: isWeb ? 'row' : 'column', width: '100%', flex: 1 }}>
        {isWeb && <Sidebar />}
        <ScrollView style={{ flex: 1, backgroundColor: '#fff' }} contentContainerStyle={{ minHeight: '100%', alignItems: 'center', paddingBottom: 40 }}>
          <Text style={styles.welcome}>Merhaba, {mockUser.name}! 🎮</Text>
          <Text style={styles.subtitle}>Bugün hangi oyunla pratik yapmak istersin?</Text>
          <View style={[styles.cardsGrid, { flexDirection: isWeb ? 'row' : 'column', flexWrap: isWeb ? 'wrap' : 'nowrap', justifyContent: 'center' }]}> 
            {gameTypes.map((game, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.card,
                  { backgroundColor: game.color[0], width: isWeb ? 240 : '90%', margin: isWeb ? 16 : 10 },
                ]}
                activeOpacity={0.85}
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
                  } else {
                    setSelectedGame(game);
                  }
                }}
                onMouseEnter={isWeb ? (e) => e.currentTarget.style.boxShadow = '0 8px 32px #0002' : undefined}
                onMouseLeave={isWeb ? (e) => e.currentTarget.style.boxShadow = '0 2px 8px #0001' : undefined}
              >
                <Text style={styles.cardIcon}>{game.icon}</Text>
                <Text style={styles.cardTitle}>{game.title}</Text>
                <Text style={styles.cardDesc}>{game.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.resultsArea}>
            <Text style={styles.resultsTitle}>Son Oynanan Oyunlar</Text>
            {mockGameResults.map((result) => (
              <View key={result.id} style={styles.resultBox}>
                <Text style={styles.resultGame}>{gameTypes.find(g => g.type === result.gameType)?.title || result.gameType}</Text>
                <Text style={styles.resultScore}>Skor: {result.score} | Doğru: {result.correctAnswers} | Yanlış: {result.wrongAnswers}</Text>
                <Text style={styles.resultDate}>{result.date}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity style={styles.mockGameBtn} onPress={() => setShowSetup(true)}>
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Ayarları Değiştir</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  welcome: { fontSize: 26, fontWeight: 'bold', color: '#4F46E5', marginTop: 20, textAlign: 'center' },
  subtitle: { fontSize: 17, color: '#666', marginBottom: 18, textAlign: 'center' },
  cardsGrid: { width: '100%', marginTop: 10, marginBottom: 18, alignItems: 'center' },
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
    minHeight: 140,
    transition: 'box-shadow 0.2s',
  },
  cardIcon: { fontSize: 38, marginBottom: 10 },
  cardTitle: { fontSize: 19, fontWeight: 'bold', color: '#222', textAlign: 'center' },
  cardDesc: { fontSize: 15, color: '#444', marginTop: 6, textAlign: 'center' },
  resultsArea: { width: '100%', marginTop: 18 },
  resultsTitle: { fontSize: 16, fontWeight: 'bold', color: '#4F46E5', marginBottom: 8 },
  resultBox: {
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  resultGame: { fontSize: 15, fontWeight: 'bold', color: '#222' },
  resultScore: { fontSize: 14, color: '#4F46E5', marginTop: 2 },
  resultDate: { fontSize: 13, color: '#888', marginTop: 2 },
  mockGameContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', padding: 24 },
  mockGameTitle: { fontSize: 24, fontWeight: 'bold', color: '#4F46E5', marginBottom: 12 },
  mockGameDesc: { fontSize: 16, color: '#444', marginBottom: 24, textAlign: 'center' },
  mockGameBtn: { backgroundColor: '#4F46E5', paddingVertical: 12, paddingHorizontal: 28, borderRadius: 10 },
}); 