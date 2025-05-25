import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Dimensions,
  useColorScheme,
  Modal,
  Animated,
  Alert,
  ActivityIndicator,
  ScrollView,
  FlatList,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useGameSettings } from '../../../context/GameSettingsContext';
import { useUser } from '../../../context/UserContext';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import api from '../../../api';
import * as Animatable from 'react-native-animatable';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { Picker } from '@react-native-picker/picker';
import { useState as useStateReact } from 'react';
import { useTheme as useThemeContext } from '../../../context/ThemeContext';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const LETTER_BOX_SIZE = isWeb ? 50 : Math.min((width - 40) / 6 - 8, 45);
const CARD_WIDTH = width * 0.9;
const CARD_HEIGHT = CARD_WIDTH * 0.6;

// Türkçe karakterleri normalize et (Lingo ile aynı)
function normalizeWord(str, lang) {
  if (lang === 'tr' || lang === 4455 || lang === '4455' || String(lang) === '4455') {
    let result = '';
    for (let ch of str) {
      if (ch === 'i') result += 'İ';
      else if (ch === 'ı') result += 'I';
      else if (ch === 'ğ') result += 'Ğ';
      else if (ch === 'ü') result += 'Ü';
      else if (ch === 'ş') result += 'Ş';
      else if (ch === 'ö') result += 'Ö';
      else if (ch === 'ç') result += 'Ç';
      else result += ch.toUpperCase();
    }
    return result;
  }
  return str.toUpperCase();
}

// Kelimeyi karıştır
const shuffleWord = (word) => {
  const chars = word.split('');
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
};

// MatchingGame'den SelectComponent'i ekliyorum
const SelectComponent = ({ value, setValue, items, placeholder, open, setOpen, onOpen, zIndex, textColor, borderColor, dropdownBg, placeholderColor, dropdownOverlayBg }) => {
  const selectedObj = items.find(i => i.value === value);
  const selectedLabel = selectedObj ? selectedObj.label : placeholder;
  const isPlaceholder = !selectedObj;
  const maxHeight = Platform.OS === 'web' ? 44 * 7 : 44 * 5;
  return (
    <>
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          width: 260,
          minHeight: 44,
          borderWidth: 2,
          borderColor: borderColor,
          borderRadius: 12,
          backgroundColor: dropdownBg,
          justifyContent: 'space-between',
          paddingHorizontal: 12,
          marginBottom: 24,
          fontWeight: 'bold',
          shadowColor: '#7C3AED',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 2,
        }}
        onPress={() => {
          setOpen(true);
          if (onOpen) onOpen();
        }}
        activeOpacity={0.85}
      >
        <Text style={{ color: isPlaceholder ? placeholderColor : textColor, fontWeight: 'bold', flex: 1 }}>{selectedLabel}</Text>
        <MaterialIcons name="arrow-drop-down" size={22} color="#7C3AED" style={{ marginLeft: 4 }} />
      </TouchableOpacity>
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: dropdownOverlayBg, justifyContent: 'center', alignItems: 'center' }}
          activeOpacity={1}
          onPressOut={() => setOpen(false)}
        >
          <View style={{ width: 260, backgroundColor: dropdownBg, borderRadius: 16, paddingVertical: 10, elevation: 10, shadowColor: '#7C3AED', shadowOpacity: 0.12, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } }}>
            <FlatList
              data={items}
              keyExtractor={item => item.value}
              style={{ maxHeight }}
              renderItem={({ item }) => {
                const isSelected = value === item.value;
                return (
                  <TouchableOpacity
                    style={{ paddingVertical: 13, paddingHorizontal: 18, borderRadius: 8, backgroundColor: isSelected ? '#ede9fe' : 'transparent' }}
                    onPress={() => {
                      setValue(item.value);
                      setOpen(false);
                    }}
                  >
                    <Text style={{ color: isSelected ? '#7C3AED' : textColor, fontWeight: 'bold' }}>{item.label}</Text>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

export default function WordScramble() {
  const { theme: themeMode } = useThemeContext();
  const systemScheme = useColorScheme();
  const isDark = themeMode === 'dark' || (themeMode === 'system' && systemScheme === 'dark');
  const { settings } = useGameSettings();
  const { user, addPoints } = useUser();
  const router = useRouter();

  // Tema renkleri (diğer oyunlardaki gibi)
  const theme = {
    bg: isDark ? '#181825' : '#f8fafc',
    card: isDark ? '#232136' : '#fff',
    text: isDark ? '#fff' : '#232136',
    border: isDark ? '#a78bfa' : '#7C3AED',
    header: isDark ? '#a78bfa' : '#7C3AED',
    accent: '#7C3AED',
    infoBg: isDark ? '#232136' : '#fff',
    infoText: isDark ? '#fff' : '#64748b',
    infoValue: isDark ? '#a78bfa' : '#7C3AED',
    cardOpenBg: isDark ? '#2d2e3e' : '#f3f4f6',
    cardOpenText: isDark ? '#fff' : '#222',
    found: '#FBBF24',
    success: '#10B981',
    fail: '#F87171',
  };

  // State'ler
  const [loading, setLoading] = useState(true);
  const [currentWord, setCurrentWord] = useState(null);
  const [scrambledLetters, setScrambledLetters] = useState('');
  const [selectedLetterIndices, setSelectedLetterIndices] = useState([]);
  const [streak, setStreak] = useState(0);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [showCongratsModal, setShowCongratsModal] = useState(false);
  const [congratsPoints, setCongratsPoints] = useState({ points: 0, newStreak: 0, details: {} });
  const [timeLeft, setTimeLeft] = useState(60);
  const [showTimeUpModal, setShowTimeUpModal] = useState(false);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [hintUsed, setHintUsed] = useState(false);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [hintsLeft, setHintsLeft] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [languagePairs, setLanguagePairs] = useState([]);
  const [selectedPairId, setSelectedPairId] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [lives, setLives] = useState(3);
  const [showFailModal, setShowFailModal] = useState(false);
  const [backButtonMarginTop, setBackButtonMarginTop] = useStateReact(isWeb ? 18 : 8);

  // Animasyon değerleri
  const [shakeAnim] = useState(new Animated.Value(0));
  const [successAnim] = useState(new Animated.Value(0));

  // Dinamik kutu boyutu ve aralığı (sadece mobil için)
  const maxLetters = currentWord?.word?.length || 8;
  const containerPadding = isWeb ? 24 : 16;
  const maxContainerWidth = width - 2 * containerPadding;
  let dynamicBoxSize = 44;
  let dynamicGap = 12;
  if (!isWeb && maxLetters > 0) {
    const maxW = maxContainerWidth;
    let box = 44;
    let gap = 12;
    while ((box * maxLetters + gap * (maxLetters - 1)) > maxW && box > 8) {
      box -= 1;
      gap = Math.max(0, Math.floor((maxW - box * maxLetters) / (maxLetters - 1)));
    }
    dynamicBoxSize = box;
    dynamicGap = gap;
  }

  // Mobilde karışık harf kutuları için dinamik boyut ve gap
  const scrambledLettersCount = scrambledLetters.length;
  let scrambledBoxSize = 44;
  let scrambledGap = 12;
  if (!isWeb && scrambledLettersCount > 5) {
    const maxW = maxContainerWidth;
    let box = 44;
    let gap = 12;
    while ((box * scrambledLettersCount + gap * (scrambledLettersCount - 1)) > maxW && box > 8) {
      box -= 1;
      gap = Math.max(0, Math.floor((maxW - box * scrambledLettersCount) / (scrambledLettersCount - 1)));
    }
    scrambledBoxSize = box;
    scrambledGap = gap;
  }

  // Streak'i AsyncStorage'dan yükle
  useEffect(() => {
    const loadStreak = async () => {
      try {
        const savedStreak = await AsyncStorage.getItem('wordscramble_streak');
        if (savedStreak) {
          setStreak(parseInt(savedStreak));
        }
      } catch (error) {
        console.error('Streak yüklenirken hata:', error);
      }
    };
    loadStreak();
  }, []);

  // Streak'i kaydet
  const saveStreak = async (newStreak) => {
    try {
      await AsyncStorage.setItem('wordscramble_streak', newStreak.toString());
      setStreak(newStreak);
    } catch (error) {
      console.error('Streak kaydedilirken hata:', error);
    }
  };

  // Dil çiftlerini çek
  useEffect(() => {
    const fetchLanguagePairs = async () => {
      try {
        const res = await api.get('/language-pairs');
        setLanguagePairs(res.data.data || []);
      } catch (error) {
        Alert.alert('Hata', 'Dil çiftleri yüklenemedi!');
      }
    };
    fetchLanguagePairs();
  }, []);

  // fetchWord fonksiyonunu component içinde ayrı tanımla
  const fetchWord = async () => {
    if (!selectedPairId) return;
    setLoading(true);
    try {
      const response = await api.get('/game-words/scramble-word', {
        params: {
          languagePairId: selectedPairId,
          categoryId: settings.cat,
          difficultyLevel: settings.level
        }
      });
      if (response.data.status === 'success') {
        const word = response.data.data;
        setCurrentWord(word);
        setScrambledLetters(shuffleWord(normalizeWord(word.word, word.wordLang)));

        // Timer süresini seviye ve kelime uzunluğuna göre ayarla
        const baseTimes = { A1: 30, A2: 28, B1: 25, B2: 22, C1: 20, C2: 18 };
        const selectedLevel = settings.level;
        const baseTime = baseTimes[selectedLevel] || 25;
        const kelimeUzunlugu = word.word.length;
        const extraTime = Math.max(0, (kelimeUzunlugu - 5) * 2);
        let totalTime = baseTime + extraTime;
        totalTime = Math.max(10, Math.min(60, totalTime));
        setTimeLeft(totalTime);
      }
    } catch (error) {
      Alert.alert('Hata', 'Kelime alınırken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  // Süre sayacı
  useEffect(() => {
    if (timeLeft > 0 && !gameOver) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      handleGameOver();
    }
  }, [timeLeft, gameOver]);

  // Harf seçme (index bazlı)
  const handleLetterSelect = (letter, index) => {
    if (selectedLetterIndices.length < currentWord.word.length) {
      setSelectedLetterIndices(prev => [...prev, index]);
    }
  };

  // Harf kaldırma (geri alma)
  const handleLetterDeselect = () => {
    setSelectedLetterIndices(prev => prev.slice(0, -1));
  };

  // İpucu kullanma
  const handleHint = () => {
    if (hintsLeft > 0) {
      setHintsLeft(prev => prev - 1);
      setShowHint(true);
      setTimeout(() => setShowHint(false), 2000);
    }
  };

  // Cevabı kontrol et (index bazlı)
  const checkAnswer = () => {
    const userAnswer = selectedLetterIndices.map(idx => scrambledLetters[idx]).join('');
    if (userAnswer === normalizeWord(currentWord.word, currentWord.wordLang)) {
      setGameOver(true);
      setShowCongratsModal(true);
      const scoreObj = calculateScore();
      setScore(prev => prev + scoreObj.points);
      addPoints(scoreObj.points);
      setStreak(prev => prev + 1);
      saveStreak(prev => prev + 1);
      setCongratsPoints({ points: scoreObj.points, newStreak: prev => prev + 1, details: scoreObj.details, duration: 60 - timeLeft });
    } else {
      setMistakes(prev => prev + 1);
      setStreak(0);
      saveStreak(0);
      setMistakeCount(prev => prev + 1);
      setSelectedLetterIndices([]);
      setLives(prev => prev - 1);
      if (lives - 1 <= 0) {
        setGameOver(true);
        setShowFailModal(true);
      }
      // Titreşim animasyonu
      Animated.sequence([
        Animated.timing(shakeAnim, {
          toValue: 10,
          duration: 100,
          useNativeDriver: true
        }),
        Animated.timing(shakeAnim, {
          toValue: -10,
          duration: 100,
          useNativeDriver: true
        }),
        Animated.timing(shakeAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true
        })
      ]).start();
    }
  };

  // Turu sıfırla
  const resetRound = () => {
    setSelectedLetterIndices([]);
    setMistakes(0);
    setTimeLeft(60);
    setHintsLeft(3);
    setShowHint(false);
  };

  // Oyunu bitir
  const handleGameOver = async () => {
    setGameOver(true);
    setShowTimeUpModal(true);
    // Artık backend'e sonuç gönderilmeyecek, sadece local işlemler yapılacak
  };

  // Oyunu yeniden başlat
  const restartGame = () => {
    setShowCongratsModal(false);
    setShowTimeUpModal(false);
    setShowFailModal(false);
    setScore(0);
    setStreak(0);
    setMistakes(0);
    setTimeLeft(60);
    setHintsLeft(3);
    setGameOver(false);
    setShowHint(false);
    setSelectedLetterIndices([]);
    setLives(3);
    resetRound();
    fetchWord();
  };

  // Profesyonel puan hesaplama
  const calculateScore = () => {
    const basePoint = 10;
    const timeBonus = timeLeft * 2;
    const mistakePenalty = mistakes * 10;
    const hintPenalty = (3 - hintsLeft) * 10;
    let streakBonus = 0;
    if (streak >= 10) streakBonus = 50;
    else if (streak >= 5) streakBonus = 25;
    else if (streak >= 3) streakBonus = 10;
    const levelMultipliers = { A1: 1, A2: 1, B1: 1.2, B2: 1.2, C1: 1.4, C2: 1.4 };
    const multiplier = levelMultipliers[settings.level] || 1;
    const total = Math.round((basePoint + timeBonus - mistakePenalty - hintPenalty + streakBonus) * multiplier);
    return {
      points: total,
      details: {
        base: basePoint,
        timeBonus,
        mistakePenalty,
        hintPenalty,
        streakBonus,
        multiplier
      }
    };
  };

  // Süreyi mm:ss formatında gösteren fonksiyon (Lingo ile aynı)
  function formatTime(sec) {
    if (sec === null) return '--:--';
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  // Oyun başlatma fonksiyonu
  const startGame = () => {
    if (!selectedPairId) {
      Alert.alert('Uyarı', 'Lütfen bir dil çifti seçin!');
      return;
    }
    setGameStarted(true);
    fetchWord(); // Başla'ya basınca da yeni kelime çek
  };

  if (!gameStarted) {
    // Tema ve renkler
    const accent = '#7C3AED';
    const borderColor = accent;
    const dropdownBg = isDark ? '#232136' : '#fff';
    const placeholderColor = isDark ? '#aaa' : '#aaa';
    const dropdownOverlayBg = isDark ? 'rgba(35,33,54,0.85)' : 'rgba(255,255,255,0.85)';
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.bg }}>
        {/* Arka plan daireleri */}
        <View style={{
          position: 'absolute',
          width: 340,
          height: 340,
          borderRadius: 170,
          backgroundColor: isDark ? '#a78bfa33' : '#a78bfa22',
          top: -80,
          left: -100,
          zIndex: 0,
        }} />
        <View style={{
          position: 'absolute',
          width: 220,
          height: 220,
          borderRadius: 110,
          backgroundColor: isDark ? '#38bdf833' : '#38bdf822',
          bottom: -60,
          right: -60,
          zIndex: 0,
        }} />
        <View style={{
          position: 'absolute',
          width: 180,
          height: 180,
          borderRadius: 90,
          backgroundColor: isDark ? '#fbbf2433' : '#fbbf2422',
          top: 120,
          right: -40,
          zIndex: 0,
        }} />
        {/* Geri tuşu */}
        <TouchableOpacity
          style={{ position: 'absolute', left: 16, top: 32, padding: 8, zIndex: 10 }}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={28} color={accent} />
        </TouchableOpacity>
        <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 24, color: theme.text, marginTop: 32 }}>Dil Çifti Seç</Text>
        <SelectComponent
          value={selectedPairId}
          setValue={setSelectedPairId}
          items={[
            { label: 'Dil çifti seçin', value: '' },
            ...languagePairs.map(pair => ({
              label: isWeb
                ? `${pair.sourceLanguage?.name} → ${pair.targetLanguage?.name}`
                : `${pair.sourceLanguage?.name} -> ${pair.targetLanguage?.name}`,
              value: pair.id.toString()
            }))
          ]}
          placeholder="Dil çifti seçin"
          open={dropdownOpen}
          setOpen={setDropdownOpen}
          onOpen={undefined}
          zIndex={1000}
          textColor={accent}
          borderColor={borderColor}
          dropdownBg={dropdownBg}
          placeholderColor={placeholderColor}
          dropdownOverlayBg={dropdownOverlayBg}
        />
        <TouchableOpacity style={{ backgroundColor: '#7C3AED', paddingVertical: 14, paddingHorizontal: 44, borderRadius: 8 }} onPress={startGame}>
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>Başla</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.header} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Arka plan daireleri */}
      <View style={{
        position: 'absolute',
        width: 340,
        height: 340,
        borderRadius: 170,
        backgroundColor: isDark ? '#a78bfa33' : '#a78bfa22', // mor
        top: -80,
        left: -100,
        zIndex: 0,
      }} />
      <View style={{
        position: 'absolute',
        width: 220,
        height: 220,
        borderRadius: 110,
        backgroundColor: isDark ? '#38bdf833' : '#38bdf822', // mavi
        bottom: -60,
        right: -60,
        zIndex: 0,
      }} />
      <View style={{
        position: 'absolute',
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: isDark ? '#fbbf2433' : '#fbbf2422', // turuncu
        top: 120,
        right: -40,
        zIndex: 0,
      }} />
      {/* En üstte timer ve puan kutusu yan yana */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 24,
        marginTop: isWeb ? 18 : 8,
        marginBottom: isWeb ? 8 : 2,
        width: '100%',
      }}>
        {/* Timer kutusu */}
        <View style={{
          backgroundColor: theme.card,
          borderRadius: 16,
          paddingVertical: 6,
          paddingHorizontal: isWeb ? 22 : 14,
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 2,
          borderColor: theme.border,
          shadowColor: theme.border,
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 2,
          marginRight: isWeb ? 550 : 32,
        }}>
          <MaterialIcons name="timer" size={22} color={theme.border} style={{marginRight: 8}} />
          <Text style={{fontWeight:'bold',fontSize:18,color:theme.border,letterSpacing:1}}>{formatTime(timeLeft)}</Text>
        </View>
        {/* Puan kutusu */}
        <View style={{
          backgroundColor: theme.card,
          borderRadius: 16,
          paddingVertical: 6,
          paddingHorizontal: 22,
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 2,
          borderColor: isDark ? '#10B981' : '#FBBF24',
          shadowColor: isDark ? '#10B981' : '#FBBF24',
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 2,
        }}>
          <MaterialIcons name="star" size={22} color={isDark ? '#10B981' : '#FBBF24'} style={{marginRight: 8}} />
          <Text style={{fontWeight:'bold',fontSize:18,color: isDark ? '#10B981' : '#FBBF24',letterSpacing:1}}>{score}</Text>
        </View>
      </View>
      {/* Üstte Bilgilendirme Kutusu (MatchingGame tarzı) */}
      <View style={{
        backgroundColor: theme.card,
        borderRadius: 12,
        paddingVertical: isWeb ? 16 : 14,
        paddingHorizontal: isWeb ? 32 : 20,
        marginTop: isWeb ? 32 : 16,
        marginBottom: 14,
        alignSelf: 'center',
        shadowColor: theme.border,
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
        flexDirection: isWeb ? 'row' : 'column',
        gap: isWeb ? 32 : 10,
        alignItems: isWeb ? 'center' : 'flex-start',
        minWidth: isWeb ? 520 : undefined,
        maxWidth: isWeb ? 700 : '95%'
      }}>
        <Text style={{ fontSize: 15, color: theme.text, marginBottom: isWeb ? 0 : 8 }}>
          Dil Çifti: <Text style={{ fontWeight: 'bold', color: theme.border }}>{(() => {
            const pair = languagePairs.find(p => p.id?.toString() === selectedPairId);
            if (!pair) return '';
            return isWeb
              ? `${pair.sourceLanguage?.name || ''} → ${pair.targetLanguage?.name || ''}`
              : `${pair.sourceLanguage?.name || ''} -> ${pair.targetLanguage?.name || ''}`;
          })()}</Text>
        </Text>
        <Text style={{ color: theme.text, fontSize: 15, marginBottom: isWeb ? 0 : 8 }}>
          Kategori: <Text style={{ color: '#F59E42', fontWeight: 'bold' }}>{settings.catLabel || settings.cat}</Text>
        </Text>
        <Text style={{ color: theme.text, fontSize: 15 }}>
          Seviye: <Text style={{ color: theme.border, fontWeight: 'bold' }}>{settings.levelLabel || settings.level}</Text>
        </Text>
      </View>
      {/* Açıklama yazısı */}
      <Text style={{ textAlign: 'center', color: theme.text, fontSize: 15, fontWeight: 'bold', marginBottom: 6 }}>
        {isWeb ? 'Harfleri doğru sıraya dizerek kelimeyi bul! 3 hakkın var.' : 'Harfleri doğru sıraya dizerek kelimeyi bul!'}
      </Text>
      {/* Canlar (kalp ikonları) */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 16, marginBottom: 8 }}>
        {[...Array(3)].map((_, i) => (
          <MaterialIcons
            key={i}
            name="favorite"
            size={28}
            color={i < lives ? '#F87171' : '#ddd'}
            style={{ marginHorizontal: 2 }}
          />
        ))}
      </View>
      {/* Anlamı Göster */}
      <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 18, marginBottom: 50 }}>
        <Text style={[styles.wordText, { color: theme.text }]}> 
          {currentWord
            ? normalizeWord(currentWord.meaning, currentWord.meaningLang)
            : ''}
        </Text>
      </View>

      {/* Bağımsız geri tuşu */}
      <TouchableOpacity
        style={{ position: 'absolute', left: isWeb ? 24 : 12, top: isWeb ? 24 : 18, padding: 10, zIndex: 100 }}
        onPress={() => router.back()}
      >
        <MaterialIcons
          name="arrow-back"
          size={28}
          color={theme.text}
        />
      </TouchableOpacity>

      {/* Seçili Harfler */}
      {(!isWeb && maxLetters > 5) ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ alignSelf: 'center', marginBottom: 24 }}
          contentContainerStyle={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', minWidth: maxContainerWidth }}
        >
          {selectedLetterIndices.map((idx, i) => (
            <View
              key={i}
              style={[
                styles.letterBox,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                  width: dynamicBoxSize,
                  height: dynamicBoxSize,
                  marginHorizontal: dynamicGap / 2,
                  borderWidth: 1,
                }
              ]}
            >
              <Text style={[styles.letterText, { color: theme.text, fontSize: Math.max(8, dynamicBoxSize * 0.6) }]}> 
                {scrambledLetters[idx]}
              </Text>
            </View>
          ))}
        </ScrollView>
      ) : (
        <View style={[
          styles.selectedLettersContainer,
          !isWeb && {
            width: maxContainerWidth,
            maxWidth: maxContainerWidth,
            alignSelf: 'center',
            paddingHorizontal: 0,
            justifyContent: 'center',
            overflow: 'hidden',
            boxSizing: 'border-box',
          }
        ]}>
          {selectedLetterIndices.map((idx, i) => (
            <View
              key={i}
              style={[
                styles.letterBox,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                  width: !isWeb ? dynamicBoxSize : undefined,
                  height: !isWeb ? dynamicBoxSize : undefined,
                  marginHorizontal: !isWeb ? dynamicGap / 2 : undefined,
                  borderWidth: !isWeb ? 1 : 2,
                }
              ]}
            >
              <Text style={[styles.letterText, { color: theme.text, fontSize: !isWeb ? Math.max(8, dynamicBoxSize * 0.6) : 28 }]}> 
                {scrambledLetters[idx]}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Karışık Harfler */}
      <View style={[
        styles.scrambledLettersContainer,
        !isWeb && {
          maxWidth: maxContainerWidth,
          alignSelf: 'center',
          paddingHorizontal: 0,
          justifyContent: 'center',
        }
      ]}>
        {scrambledLetters.split('').map((letter, index) => {
          const isSelected = selectedLetterIndices.includes(index);
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.letterBox,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                  opacity: isSelected ? 0.5 : 1,
                  width: !isWeb ? scrambledBoxSize : undefined,
                  height: !isWeb ? scrambledBoxSize : undefined,
                  marginHorizontal: !isWeb ? scrambledGap / 2 : undefined,
                  borderWidth: !isWeb ? 1 : 2,
                }
              ]}
              onPress={() => !isSelected && handleLetterSelect(letter, index)}
              disabled={isSelected}
            >
              <Text style={[styles.letterText, { color: theme.text, fontSize: !isWeb ? Math.max(8, scrambledBoxSize * 0.6) : 28 }]}> 
                {letter}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Alt Butonlar ve Kontrol Et */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.card }]}
          onPress={restartGame}
        >
          <MaterialIcons name="refresh" size={24} color={theme.border} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.card }]}
          onPress={handleHint}
          disabled={hintsLeft === 0}
        >
          <MaterialIcons
            name="lightbulb"
            size={24}
            color={hintsLeft === 0 ? '#666' : theme.border}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.card, borderColor: isDark ? '#10B981' : '#FBBF24', justifyContent: 'center', alignItems: 'center', padding: 0 }]}
          onPress={checkAnswer}
        >
          <Text style={{ color: isDark ? '#10B981' : '#FBBF24', fontWeight: 'bold', fontSize: isWeb ? 15 : 13, textAlign: 'center' }}>Kontrol{isWeb ? '\n' : ' '}Et</Text>
        </TouchableOpacity>
      </View>

      {/* Tebrikler Modalı */}
      {showCongratsModal && (
        <Modal
          visible={showCongratsModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowCongratsModal(false)}
        >
          <View style={{flex:1,justifyContent:'center',alignItems:'center',backgroundColor:'rgba(0,0,0,0.45)',zIndex:100}}>
            <View style={{
              backgroundColor: theme.card,
              borderRadius:20,
              padding:32,
              alignItems:'center',
              maxWidth:360,
              shadowColor:'#000',
              shadowOpacity:0.15,
              shadowRadius:16,
              elevation:8
            }}>
              <Text style={{fontSize:24,fontWeight:'bold',color:theme.found,marginBottom:12}}>Tebrikler! 🎉</Text>
              <Text style={{fontSize:18,color: theme.text,marginBottom:18,textAlign:'center'}}>Tüm harfleri doğru sıraladın!</Text>
              <Text style={{fontSize:16,color: theme.text,marginBottom:8}}>Kazanılan Puanlar:</Text>
              <Text style={{fontSize:15,color: theme.text,marginBottom:2}}>• Temel Puan: {congratsPoints.details?.base || 0}</Text>
              <Text style={{fontSize:15,color: theme.text,marginBottom:2}}>• Süre Bonusu: {congratsPoints.details?.timeBonus || 0}</Text>
              <Text style={{fontSize:15,color: theme.text,marginBottom:2}}>• Hata Cezası: -{congratsPoints.details?.mistakePenalty || 0}</Text>
              <Text style={{fontSize:15,color: theme.text,marginBottom:10}}>• Streak Bonusu: {congratsPoints.details?.streakBonus || 0}</Text>
              <Text style={{fontSize:15,color: theme.text,marginBottom:10}}>Süre: {congratsPoints.duration !== undefined ? (congratsPoints.duration).toFixed(1) : '-'} sn</Text>
              <Text style={{fontSize:17,fontWeight:'bold',color: theme.found,marginBottom:18}}>Toplam: {congratsPoints.points} puan</Text>
              <View style={{flexDirection:'row',gap:16,marginTop:8}}>
                <TouchableOpacity onPress={() => { setShowCongratsModal(false); restartGame(); }} style={{backgroundColor:theme.border,paddingVertical:10,paddingHorizontal:22,borderRadius:10,marginRight:8}}>
                  <Text style={{color:'#fff',fontWeight:'bold',fontSize:16}}>Yeniden Başla</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setShowCongratsModal(false); router.back(); }} style={{backgroundColor:theme.found,paddingVertical:10,paddingHorizontal:22,borderRadius:10}}>
                  <Text style={{color: theme.text,fontWeight:'bold',fontSize:16}}>Ana Menü</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
      {/* Süre Doldu Modalı */}
      {showTimeUpModal && (
        <Modal
          visible={showTimeUpModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowTimeUpModal(false)}
        >
          <View style={{flex:1,justifyContent:'center',alignItems:'center',backgroundColor:'rgba(0,0,0,0.45)',zIndex:100}}>
            <View style={{
              backgroundColor: theme.card,
              borderRadius:20,
              padding:32,
              alignItems:'center',
              maxWidth:360,
              shadowColor:'#000',
              shadowOpacity:0.15,
              shadowRadius:16,
              elevation:8
            }}>
              <Text style={{fontSize:24,fontWeight:'bold',color:theme.fail,marginBottom:12}}>Süre Doldu!</Text>
              <Text style={{fontSize:18,color: theme.text,marginBottom:18,textAlign:'center'}}>Maalesef, süren doldu. Tekrar deneyebilirsin!</Text>
              <Text style={{fontSize:18,color: theme.text,marginBottom:18,textAlign:'center'}}>Doğru kelime: <Text style={{color:theme.border,fontWeight:'bold'}}>{currentWord ? normalizeWord(currentWord.word, currentWord.wordLang) : ''}</Text></Text>
              <View style={{flexDirection:'row',gap:16,marginTop:8}}>
                <TouchableOpacity onPress={() => { setShowTimeUpModal(false); restartGame(); }} style={{backgroundColor:theme.border,paddingVertical:10,paddingHorizontal:22,borderRadius:10,marginRight:8}}>
                  <Text style={{color:'#fff',fontWeight:'bold',fontSize:16}}>Yeniden Başla</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setShowTimeUpModal(false); router.back(); }} style={{backgroundColor:theme.found,paddingVertical:10,paddingHorizontal:22,borderRadius:10}}>
                  <Text style={{color: theme.text,fontWeight:'bold',fontSize:16}}>Ana Menü</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {showHint && (
        <View style={{
          alignSelf: 'center',
          backgroundColor: 'rgba(0,0,0,0.92)',
          paddingVertical: 14,
          paddingHorizontal: 28,
          borderRadius: 16,
          marginBottom: 12,
          zIndex: 20,
        }}>
          <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold', letterSpacing: 1 }}>
            İlk harf: {currentWord ? normalizeWord(currentWord.word[0], currentWord.wordLang) : ''}
          </Text>
        </View>
      )}

      {/* Bilemedin Modalı */}
      {showFailModal && (
        <Modal
          visible={showFailModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowFailModal(false)}
        >
          <View style={{flex:1,justifyContent:'center',alignItems:'center',backgroundColor:'rgba(0,0,0,0.45)',zIndex:100}}>
            <View style={{
              backgroundColor: theme.card,
              borderRadius:20,
              padding:32,
              alignItems:'center',
              maxWidth:360,
              shadowColor:'#000',
              shadowOpacity:0.15,
              shadowRadius:16,
              elevation:8
            }}>
              <Text style={{fontSize:24,fontWeight:'bold',color:theme.fail,marginBottom:12}}>Bilemedin!</Text>
              <Text style={{fontSize:18,color: theme.text,marginBottom:18,textAlign:'center'}}>Hakların bitti! Doğru kelime: <Text style={{color:theme.border,fontWeight:'bold'}}>{currentWord ? normalizeWord(currentWord.word, currentWord.wordLang) : ''}</Text></Text>
              <View style={{flexDirection:'row',gap:16,marginTop:8}}>
                <TouchableOpacity onPress={() => { setShowFailModal(false); restartGame(); }} style={{backgroundColor:theme.border,paddingVertical:10,paddingHorizontal:22,borderRadius:10,marginRight:8}}>
                  <Text style={{color:'#fff',fontWeight:'bold',fontSize:16}}>Yeniden Başla</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setShowFailModal(false); router.back(); }} style={{backgroundColor:theme.found,paddingVertical:10,paddingHorizontal:22,borderRadius:10}}>
                  <Text style={{color: theme.text,fontWeight:'bold',fontSize:16}}>Ana Menü</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: isWeb ? 24 : 16,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
  },
  timerBox: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 14,
    marginRight: isWeb ? 24 : 12,
    shadowColor: '#7C3AED',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 2,
    borderColor: '#7C3AED',
  },
  timerText: {
    fontSize: isWeb ? 22 : 18,
    fontWeight: 'bold',
    color: '#7C3AED',
    letterSpacing: 1,
  },
  wordContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    marginTop: 24,
  },
  wordText: {
    fontSize: isWeb ? 32 : 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  selectedLettersContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: isWeb ? 'wrap' : 'nowrap',
    overflow: isWeb ? undefined : 'scroll',
    marginBottom: 24,
    gap: 12,
    minHeight: 60,
  },
  scrambledLettersContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 32,
    gap: 12,
    minHeight: 60,
  },
  letterBox: {
    width: isWeb ? 56 : 44,
    height: isWeb ? 56 : 44,
    borderRadius: isWeb ? 10 : 8,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 6,
    marginVertical: 4,
    shadowColor: '#7C3AED',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  letterText: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  bottomButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    marginTop: 16,
  },
  button: {
    width: isWeb ? 68 : 52,
    height: isWeb ? 68 : 52,
    borderRadius: isWeb ? 34 : 26,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#7C3AED',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 2,
    borderColor: '#7C3AED',
    marginHorizontal: 8,
  },
  hintOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -100 }, { translateY: -20 }],
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 20,
    borderRadius: 10
  },
  hintText: {
    color: 'white',
    fontSize: 18
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
}); 