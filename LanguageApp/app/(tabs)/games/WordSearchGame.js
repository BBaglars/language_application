import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  useColorScheme,
  Animated,
  Modal,
} from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { useGameSettings } from '../../../context/GameSettingsContext';
import { useUser } from '../../../context/UserContext';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import api from '../../../api';
import * as Animatable from 'react-native-animatable';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { FontAwesome5 } from '@expo/vector-icons';
import ConfettiCannon from 'react-native-confetti-cannon';
import { Easing } from 'react-native-reanimated';

const GRID_SIZE = 8; // 8x8 grid
const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const MOBILE_GRID_MAX = width - 32;
const CELL_SIZE = isWeb
  ? 54
  : Math.max(28, Math.min((MOBILE_GRID_MAX - 2 * 8) / GRID_SIZE, 40));
const GRID_MARGIN = isWeb ? 32 : 8;

// Türkçe ve İngilizce alfabeler
const TR_ALPHABET = 'ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ';
const EN_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// Türkçe büyük harf dönüşümü
function normalizeTR(str, lang) {
  if (lang === 'tr' || lang === 4455 || lang === '4455') {
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

export default function WordSearchGame() {
  const { theme: themeMode } = useTheme();
  const { settings } = useGameSettings();
  const { addPoints } = useUser();
  const systemScheme = useColorScheme();
  const isDark = themeMode === 'dark' || (themeMode === 'system' && systemScheme === 'dark');
  const router = useRouter();
  const isMobile = Platform.OS !== 'web';

  // Settings için varsayılan değerler
  const defaultSettings = {
    lang: 'tr',
    langLabel: 'Türkçe',
    cat: 1,
    catLabel: 'Genel',
    level: 1,
    levelLabel: 'A1'
  };

  // Settings null ise varsayılan değerleri kullan
  const currentSettings = settings || defaultSettings;

  // State'ler
  const [loading, setLoading] = useState(true);
  const [gameStarted, setGameStarted] = useState(true);
  const [grid, setGrid] = useState([]);
  const [words, setWords] = useState([]);
  const [selectedCells, setSelectedCells] = useState([]);
  const [foundWords, setFoundWords] = useState([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [timeUp, setTimeUp] = useState(false);
  const [selectedWord, setSelectedWord] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [startCell, setStartCell] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [hoveredWord, setHoveredWord] = useState(null);
  const [streak, setStreak] = useState(0);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [showCongratsModal, setShowCongratsModal] = useState(false);
  const [congratsPoints, setCongratsPoints] = useState({ points: 0, details: {} });
  const [showTimeUpModal, setShowTimeUpModal] = useState(false);
  const [congratsDuration, setCongratsDuration] = useState(null);
  const [initialTime, setInitialTime] = useState(90);
  const [timerShakeAnim] = useState(new Animated.Value(0));
  const [modalScaleAnim] = useState(new Animated.Value(0.8));
  const [showConfettiAnim, setShowConfettiAnim] = useState(false);

  // Tüm kelimelerin bulunup bulunmadığını kontrol eden değişken
  const allWordsFound = words.length > 0 && words.every(word => word.found);

  // Streak'i AsyncStorage'dan yükle
  useEffect(() => {
    const loadStreak = async () => {
      try {
        const savedStreak = await AsyncStorage.getItem('wordsearch_streak');
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
      await AsyncStorage.setItem('wordsearch_streak', newStreak.toString());
      setStreak(newStreak);
    } catch (error) {
      console.error('Streak kaydedilirken hata:', error);
    }
  };

  // Timer başlangıcını seviyeye göre ayarla
  const getInitialTime = (levelLabel) => {
    const levelMultipliers = { A1: 1, A2: 1, B1: 1.2, B2: 1.2, C1: 1.4, C2: 1.4 };
    const multiplier = levelMultipliers[levelLabel] || 1;
    return Math.round(90 * multiplier);
  };

  // Oyunu başlatma
  const startGame = async () => {
    setLoading(true);
    setTimeUp(false);
    setGameStarted(true);
    // Seviye label'ına göre süreyi belirle (yeni sistem)
    const newInitialTime = getInitialTime(currentSettings.levelLabel);
    setInitialTime(newInitialTime);
    setTimeLeft(newInitialTime);
    try {
      // API'den kelimeleri al
      const response = await api.get('/word-search-words', {
        params: {
          categoryId: currentSettings.cat,
          difficultyLevel: currentSettings.level,
          languageId: currentSettings.lang,
          limit: 10
        }
      });
      const wordList = response.data.data?.words || [];
      // Kelimeleri büyük harfe çevir
      const formattedWordList = wordList.map(word => normalizeTR(word.text, currentSettings.lang));
      // Grid'i oluştur ve kelimeleri yerleştir
      const { grid: newGrid, words: placedWords } = placeWordsInGrid(formattedWordList);
      setGrid(newGrid);
      setWords(placedWords);
      setScore(0);
      setFoundWords([]);
      setSelectedCells([]);
    } catch (error) {
      console.error('Oyun başlatma hatası:', error);
      Alert.alert('Hata', 'Oyun başlatılamadı! Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  // Yeni puan hesaplama fonksiyonu
  const calculatePoints = (foundWordCount, timeLeft) => {
    let points = 0;
    // Her kelime için 12 puan
    points += foundWordCount * 12;
    // Süre bonusu: kalan her saniye için 0.5 puan
    const timeBonus = timeLeft * 0.5;
    points += timeBonus;
    // Tüm kelimeleri bulma bonusu
    let allFoundBonus = 0;
    if (foundWordCount === words.length) {
      allFoundBonus = 40;
      points += allFoundBonus;
    }
    // Streak bonusu
    let streakBonus = 0;
    if (streak >= 10) streakBonus = 50;
    else if (streak >= 5) streakBonus = 25;
    else if (streak >= 3) streakBonus = 10;
    points += streakBonus;
    // Seviye çarpanı
    const levelMultipliers = { A1: 1, A2: 1, B1: 1.2, B2: 1.2, C1: 1.4, C2: 1.4 };
    const multiplier = levelMultipliers[currentSettings.levelLabel] || 1;
    const total = Math.round(points * multiplier);
    return { points: total, details: { base: foundWordCount * 12, timeBonus, allFoundBonus, streakBonus, multiplier } };
  };

  // Kelime bulunduğunda puan ekleme
  const handleWordFound = async (word) => {
    const newFoundWords = [...foundWords, word];
    setFoundWords(newFoundWords);
    // Tüm kelimeler bulunduysa puanları hesapla ve ekle
    if (newFoundWords.length === words.length) {
      const { points, details } = calculatePoints(newFoundWords.length, timeLeft);
      setEarnedPoints(points);
      await addPoints(points);
      await saveStreak(streak + 1);
      setCongratsPoints({ points, details });
      setShowCongratsModal(true);
    }
  };

  // Kelime kontrolü fonksiyonunu güncelle
  const checkWord = (selectedWord, positions) => {
    const foundWord = words.find(
      word => !word.found && word.text.toLowerCase() === selectedWord
    );

    if (foundWord) {
      // Kelimeyi bulundu olarak işaretle
      setWords(prevWords =>
        prevWords.map(word =>
          word.text === foundWord.text ? { ...word, found: true } : word
        )
      );

      // Bulunan kelimenin pozisyonlarını kaydet
      setFoundWords(prev => [...prev, { ...foundWord, positions }]);

      // Puan ve streak işlemlerini burada çağır
      handleWordFound(foundWord);

      setTimeout(() => {
        setSelectedCells([]);
      }, 500);
    } else {
      setTimeout(() => {
        setSelectedCells([]);
      }, 300);
    }
  };

  // Oyunu otomatik başlat
  useEffect(() => {
    startGame();
  }, []); // Component mount olduğunda bir kere çalışsın

  // Timer effect
  useEffect(() => {
    if (!gameStarted || allWordsFound || timeUp || timeLeft === null) return;
    if (timeLeft === 0) {
      setTimeUp(true);
      return;
    }
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [gameStarted, timeLeft, allWordsFound, timeUp]);

  // Timer azaldığında shake animasyonu
  useEffect(() => {
    if (timeLeft !== null && timeLeft <= 7 && !allWordsFound && !timeUp) {
      Animated.sequence([
        Animated.timing(timerShakeAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
        Animated.timing(timerShakeAnim, { toValue: -1, duration: 80, useNativeDriver: true }),
        Animated.timing(timerShakeAnim, { toValue: 0, duration: 80, useNativeDriver: true }),
      ]).start();
    }
  }, [timeLeft, allWordsFound, timeUp]);

  // Modal açılışında scale ve confetti animasyonu
  useEffect(() => {
    if (showCongratsModal || showTimeUpModal) {
      Animated.spring(modalScaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      }).start();
      setShowConfettiAnim(true);
    } else {
      modalScaleAnim.setValue(0.8);
      setShowConfettiAnim(false);
    }
  }, [showCongratsModal, showTimeUpModal]);

  // Grid oluşturma fonksiyonu
  const generateGrid = () => {
    const alphabet = (currentSettings.lang === 'tr' || currentSettings.lang === 4455 || currentSettings.lang === '4455') ? TR_ALPHABET : EN_ALPHABET;
    const newGrid = Array(GRID_SIZE).fill().map(() =>
      Array(GRID_SIZE).fill().map(() =>
        alphabet[Math.floor(Math.random() * alphabet.length)]
      )
    );
    return newGrid;
  };

  // Kelimeleri grid'e yerleştirme fonksiyonu
  const placeWordsInGrid = (wordList) => {
    const newGrid = Array(GRID_SIZE).fill().map(() => 
      Array(GRID_SIZE).fill().map(() => '')
    );
    const placedWords = [];
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1],  [1, 0],  [1, 1]
    ];

    // Kelimeleri uzunluklarına göre sırala (en uzun kelimeler önce)
    const sortedWords = [...wordList].sort((a, b) => b.length - a.length);

    sortedWords.forEach(word => {
      let placed = false;
      let attempts = 0;
      const maxAttempts = 200; // Deneme sayısını artırdık

      while (!placed && attempts < maxAttempts) {
        // Rastgele bir yön seç
        const direction = Math.floor(Math.random() * 8);
        const [rowDir, colDir] = directions[direction];

        // Rastgele bir başlangıç noktası seç
        const startRow = Math.floor(Math.random() * GRID_SIZE);
        const startCol = Math.floor(Math.random() * GRID_SIZE);

        // Kelimeyi yerleştirmeyi dene
        if (canPlaceWord(newGrid, word, startRow, startCol, direction)) {
          placeWord(newGrid, word, startRow, startCol, direction);
          placedWords.push({
            text: word,
            positions: getWordPositions(startRow, startCol, direction, word.length),
            found: false
          });
          placed = true;
        }
        attempts++;
      }
    });

    // Yerleştirilemeyen kelimeleri logla
    const placedWordCount = placedWords.length;
    if (placedWordCount < wordList.length) {
      console.warn(`${wordList.length - placedWordCount} kelime yerleştirilemedi`);
    }

    // Boş hücreleri rastgele harflerle doldur
    const alphabet = (currentSettings.lang === 'tr' || currentSettings.lang === 4455 || currentSettings.lang === '4455') ? TR_ALPHABET : EN_ALPHABET;
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (newGrid[i][j] === '') {
          newGrid[i][j] = alphabet[Math.floor(Math.random() * alphabet.length)];
        }
      }
    }

    return { grid: newGrid, words: placedWords };
  };

  // Kelime yerleştirilebilir mi kontrolü
  const canPlaceWord = (grid, word, startRow, startCol, direction) => {
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1],  [1, 0],  [1, 1]
    ];

    const [rowDir, colDir] = directions[direction];
    const wordLength = word.length;

    // Grid sınırları kontrolü
    if (
      startRow + (wordLength - 1) * rowDir < 0 ||
      startRow + (wordLength - 1) * rowDir >= GRID_SIZE ||
      startCol + (wordLength - 1) * colDir < 0 ||
      startCol + (wordLength - 1) * colDir >= GRID_SIZE
    ) {
      return false;
    }

    for (let i = 0; i < wordLength; i++) {
      const row = startRow + i * rowDir;
      const col = startCol + i * colDir;
      const currentCell = grid[row][col];

      // Eğer hücre boş değilse ve farklı bir harf içeriyorsa
      if (currentCell !== '' && currentCell !== word[i]) {
        return false;
      }

      // İlk veya son harf başka bir kelimenin üstüne geliyorsa (ve hücre doluysa)
      if ((i === 0 || i === wordLength - 1) && currentCell !== '' && currentCell === word[i]) {
        // Eğer bu hücre başka bir kelimenin ortasıysa, izin verme
        // (Yani, sadece kendi kelimesinin başı/sonu olmalı)
        // Bunu anlamak için, griddeki harfin etrafında başka harfler var mı bakılabilir
        // Ancak burada, başka bir kelimenin başı/sonu ile çakışmaya da izin vermiyoruz
        return false;
      }
    }
    return true;
  };

  // Kelimeyi grid'e yerleştirme
  const placeWord = (grid, word, startRow, startCol, direction) => {
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1],  [1, 0],  [1, 1]
    ];

    const [rowDir, colDir] = directions[direction];
    for (let i = 0; i < word.length; i++) {
      const row = startRow + i * rowDir;
      const col = startCol + i * colDir;
      grid[row][col] = word[i];
    }
  };

  // Kelime pozisyonlarını hesaplama
  const getWordPositions = (startRow, startCol, direction, length) => {
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1],  [1, 0],  [1, 1]
    ];

    const [rowDir, colDir] = directions[direction];
    const positions = [];

    for (let i = 0; i < length; i++) {
      positions.push([
        startRow + i * rowDir,
        startCol + i * colDir
      ]);
    }

    return positions;
  };

  // Kelimeleri ikiye böl
  const half = Math.ceil(words.length / 2);
  const leftWords = words.slice(0, half);
  const rightWords = words.slice(half);

  // Tema renkleri
  const theme = {
    bg: isDark ? '#181825' : '#f8fafc',
    card: isDark ? '#232136' : '#ffffff',
    text: isDark ? '#fff' : '#334155',
    border: isDark ? '#232136' : '#e2e8f0',
    header: isDark ? '#a78bfa' : '#7C3AED',
    selected: isDark ? '#a78bfa' : '#7C3AED',
    found: '#FBBF24',
    accent: '#7C3AED',
    success: '#22C55E',
    fail: '#F87171',
  };

  // Süreyi mm:ss formatında gösteren fonksiyon
  function formatTime(sec) {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  // Stiller
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.bg,
      padding: 0,
      position: 'relative',
      overflow: 'hidden',
      minHeight: isWeb ? '100vh' : undefined,
      width: '100vw',
      display: isWeb ? 'flex' : undefined,
    },
    bgCircle1: {
      position: 'absolute',
      width: 300,
      height: 300,
      borderRadius: 150,
      backgroundColor: isDark ? 'rgba(167, 139, 250, 0.1)' : 'rgba(124, 58, 237, 0.1)',
      top: -100,
      left: -100,
      zIndex: 0,
    },
    bgCircle2: {
      position: 'absolute',
      width: 400,
      height: 400,
      borderRadius: 200,
      backgroundColor: isDark ? 'rgba(167, 139, 250, 0.05)' : 'rgba(124, 58, 237, 0.05)',
      bottom: -200,
      right: -200,
      zIndex: 0,
    },
    bgCircle3: {
      position: 'absolute',
      width: 200,
      height: 200,
      borderRadius: 100,
      backgroundColor: isDark ? 'rgba(167, 139, 250, 0.08)' : 'rgba(124, 58, 237, 0.08)',
      top: '40%',
      left: '60%',
      zIndex: 0,
    },
    headerBox: {
      width: '100%',
      alignItems: 'center',
      marginTop: isWeb ? 32 : 16,
      marginBottom: isWeb ? 32 : 16,
    },
    headerBoxRow: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 10,
      position: 'relative',
    },
    title: {
      fontSize: isWeb ? 36 : 28,
      fontWeight: 'bold',
      color: theme.header,
      marginBottom: 10,
      textAlign: 'center',
      letterSpacing: 1,
    },
    selectedInfoBox: {
      flexDirection: 'row',
      gap: 18,
      marginTop: 6,
      backgroundColor: isDark ? '#232136' : '#f3f4f6',
      borderRadius: 8,
      paddingVertical: 6,
      paddingHorizontal: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    selectedInfoText: {
      fontSize: 15,
      color: isDark ? '#cbd5e1' : '#666',
      marginBottom: 0,
    },
    selectedInfoValue: {
      color: isDark ? '#a78bfa' : '#4F46E5',
      fontWeight: 'bold',
    },
    outerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      width: isWeb ? 'auto' : '100%',
      marginLeft: 'auto',
      marginRight: 'auto',
    },
    gameContainer: {
      flexDirection: isWeb ? 'row' : 'column',
      alignItems: 'center',
      justifyContent: 'center',
      width: isWeb ? 'auto' : '100%',
      display: 'flex',
      gap: isWeb ? 64 : 20,
      padding: isWeb ? 32 : 16,
      maxWidth: isWeb ? 1600 : 1200,
      zIndex: 1,
      marginTop: isWeb ? 32 : 0,
      marginLeft: 'auto',
      marginRight: 'auto',
      minHeight: isWeb ? GRID_SIZE * CELL_SIZE + GRID_MARGIN * 2 + 40 : undefined,
      position: isWeb ? 'relative' : undefined,
    },
    grid: {
      width: GRID_SIZE * CELL_SIZE + GRID_MARGIN * 2,
      height: GRID_SIZE * CELL_SIZE + GRID_MARGIN * 2,
      backgroundColor: isDark ? 'rgba(35, 33, 54, 0.95)' : 'rgba(255, 255, 255, 0.95)',
      borderRadius: isWeb ? 28 : 16,
      padding: isWeb ? GRID_MARGIN : 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.13,
      shadowRadius: 24,
      elevation: 8,
      transform: [{ rotate: '0deg' }],
      backdropFilter: 'blur(12px)',
      alignSelf: 'center',
      marginLeft: 'auto',
      marginRight: 'auto',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1.5,
      borderColor: isDark ? '#a78bfa33' : '#7C3AED22',
    },
    gridRow: {
      flexDirection: 'row',
    },
    cell: {
      width: CELL_SIZE,
      height: CELL_SIZE,
      justifyContent: 'center',
      alignItems: 'center',
      display: 'flex',
      textAlign: 'center',
      verticalAlign: 'middle',
      padding: 0,
      borderWidth: 1.5,
      borderColor: isWeb ? theme.border : '#7C3AED',
      margin: 2,
      borderRadius: 12,
      backgroundColor: theme.card,
      transitionProperty: isWeb ? 'background,border' : undefined,
      transitionDuration: isWeb ? '0.2s' : undefined,
      boxShadow: isWeb ? '0 2px 8px 0 rgba(124,58,237,0.04)' : undefined,
    },
    cellInner: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      display: 'flex',
    },
    cellText: {
      fontSize: isWeb ? 28 : 16,
      fontWeight: 'bold',
      color: theme.text,
      letterSpacing: 2,
      textAlign: 'center',
      lineHeight: isWeb ? 28 : 16,
      textAlignVertical: 'center',
      includeFontPadding: false,
    },
    selectedCell: {
      backgroundColor: theme.selected,
      borderColor: theme.accent,
      transform: [{ scale: 1.1 }],
    },
    foundCell: {
      backgroundColor: '#FBBF24',
      borderColor: '#FBBF24',
    },
    wordListContainer: {
      flex: isWeb ? 1 : undefined,
      width: isWeb ? GRID_SIZE * CELL_SIZE + GRID_MARGIN * 2 : '90%',
      maxWidth: isWeb ? GRID_SIZE * CELL_SIZE + GRID_MARGIN * 2 : 400,
      minHeight: isWeb ? GRID_SIZE * CELL_SIZE + GRID_MARGIN * 2 : undefined,
      alignSelf: 'center',
      display: 'flex',
      justifyContent: 'flex-start',
    },
    wordList: {
      padding: isWeb ? 36 : 16,
      backgroundColor: isDark ? 'rgba(35, 33, 54, 0.97)' : 'rgba(255, 255, 255, 0.97)',
      borderRadius: 28,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.13,
      shadowRadius: 24,
      elevation: 8,
      backdropFilter: 'blur(12px)',
      minHeight: isWeb ? GRID_SIZE * CELL_SIZE + GRID_MARGIN * 2 - 64 : undefined,
      display: 'flex',
      justifyContent: 'flex-start',
      borderWidth: 1.5,
      borderColor: isDark ? '#a78bfa33' : '#7C3AED22',
    },
    wordListTitle: {
      fontSize: isWeb ? 28 : 18,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 28,
      textAlign: 'center',
      letterSpacing: 1,
    },
    wordItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: isWeb ? 12 : 10,
      paddingHorizontal: isWeb ? 18 : 12,
      borderBottomWidth: 0,
      marginBottom: 12,
      borderRadius: 16,
      backgroundColor: isDark ? 'rgba(167,139,250,0.07)' : 'rgba(124,58,237,0.06)',
      transitionProperty: isWeb ? 'background' : undefined,
      transitionDuration: isWeb ? '0.2s' : undefined,
      boxShadow: isWeb ? '0 2px 8px 0 rgba(124,58,237,0.04)' : undefined,
    },
    wordItemHover: isWeb ? {
      backgroundColor: isDark ? 'rgba(167,139,250,0.18)' : 'rgba(124,58,237,0.13)',
      cursor: 'pointer',
    } : {},
    wordText: {
      fontSize: isWeb ? 22 : 16,
      color: theme.text,
      flex: 1,
      fontWeight: '600',
      letterSpacing: 1,
    },
    foundWordText: {
      color: theme.found,
      textDecorationLine: 'line-through',
      opacity: 0.9,
      fontWeight: 'bold',
    },
    wordStatus: {
      width: 28,
      height: 28,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 8,
    },
    wordStatusIcon: {
      color: theme.found,
    },
    restartButton: {
      backgroundColor: theme.header,
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 12,
      marginTop: 16,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    restartButtonText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 16,
    },
    backButton: {
      position: 'absolute',
      left: 16,
      top: 16,
      padding: 8,
      zIndex: 1,
    },
    scoreBox: {
      position: 'absolute',
      right: 16,
      top: 16,
      backgroundColor: isDark ? 'rgba(35, 33, 54, 0.9)' : 'rgba(255, 255, 255, 0.9)',
      padding: 8,
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
      zIndex: 1,
      backdropFilter: 'blur(10px)',
    },
    scoreText: {
      color: theme.text,
      fontWeight: 'bold',
    },
    timerBox: {
      position: 'absolute',
      right: 0,
      top: 0,
      backgroundColor: isDark ? '#232136' : '#fff',
      borderRadius: 8,
      paddingVertical: 4,
      paddingHorizontal: 14,
      marginRight: isWeb ? 200 : 12,
      shadowColor: '#F87171',
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
      borderWidth: 2,
      borderColor: '#7C3AED',
    },
    timerText: {
      fontSize: isWeb ? 22 : 18,
      fontWeight: 'bold',
      color: isDark ? '#a78bfa' : '#7C3AED',
      letterSpacing: 1,
    },
    timerTextDanger: {
      color: '#F87171',
    },
    floatingWordsCol: {
      display: isWeb ? 'flex' : 'none',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: isWeb ? 'space-between' : 'center',
      gap: isWeb ? 4 : 0,
      minWidth: 0,
      zIndex: 2,
      height: isWeb ? GRID_SIZE * CELL_SIZE + GRID_MARGIN * 2 : undefined,
      position: 'relative',
      top: undefined,
      left: undefined,
      right: undefined,
    },
    floatingWord: {
      paddingVertical: isWeb ? 10 : 6,
      paddingHorizontal: isWeb ? 18 : 10,
      minWidth: isWeb ? 72 : undefined,
      maxWidth: isWeb ? 105 : undefined,
      height: isWeb ? CELL_SIZE : undefined,
      backgroundColor: isDark ? 'rgba(167,139,250,0.13)' : 'rgba(124,58,237,0.10)',
      borderRadius: 18,
      marginBottom: isWeb ? 0 : 4,
      marginTop: isWeb ? 0 : 4,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.10,
      shadowRadius: 8,
      elevation: 2,
      borderWidth: 1.5,
      borderColor: isDark ? '#a78bfa33' : '#7C3AED22',
      transitionProperty: isWeb ? 'background' : undefined,
      transitionDuration: isWeb ? '0.2s' : undefined,
      position: isWeb ? 'relative' : 'relative',
      left: undefined,
      right: undefined,
    },
    floatingWordText: {
      fontSize: isWeb ? 18 : 13,
      fontWeight: 'bold',
      color: theme.text,
      letterSpacing: 1,
    },
    foundFloatingWord: {
      backgroundColor: '#FBBF24',
      color: '#fff',
      textDecorationLine: 'line-through',
    },
    leftWordsColWeb: {
      alignItems: isWeb ? 'flex-end' : undefined,
      marginRight: isWeb ? 16 : undefined,
      marginLeft: isWeb ? 0 : undefined,
    },
    rightWordsColWeb: {
      alignItems: isWeb ? 'flex-start' : undefined,
      marginLeft: isWeb ? 16 : undefined,
      marginRight: isWeb ? 0 : undefined,
    },
    bottomWordsRow: {
      display: isWeb ? 'none' : 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 24,
      gap: 8,
      width: '100%',
    },
    mobileBackButton: {
      position: 'absolute',
      left: 16,
      top: 0,
      padding: 8,
      zIndex: 10,
      backgroundColor: 'transparent',
    },
    congratsBox: {
      position: 'absolute',
      top: '50%',
      left: 0,
      right: 0,
      alignItems: 'center',
      justifyContent: 'center',
      transform: [{ translateY: -54 }],
      zIndex: 20,
    },
    congratsText: {
      backgroundColor: '#FBBF24',
      color: '#232136',
      fontWeight: 'bold',
      fontSize: isWeb ? 28 : 20,
      paddingVertical: 16,
      paddingHorizontal: 32,
      borderRadius: 16,
      textAlign: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
      elevation: 4,
    },
    webBackButton: {
      position: 'absolute',
      left: 16,
      top: 0,
      padding: 8,
      zIndex: 10,
      backgroundColor: 'transparent',
    },
  });

  // Hücre seçme işlemi
  const handleCellPress = (rowIndex, colIndex) => {
    if (foundWords.some(word =>
      word.positions.some(([r, c]) => r === rowIndex && c === colIndex)
    )) {
      return; // Bulunmuş kelimelerin hücrelerini seçmeyi engelle
    }

    if (!isSelecting) {
      setIsSelecting(true);
      setStartCell([rowIndex, colIndex]);
      setSelectedCells([[rowIndex, colIndex]]);
    } else {
      const endCell = [rowIndex, colIndex];
      handleCellSelection(startCell, endCell);
      setIsSelecting(false);
      setStartCell(null);
    }
  };

  // Seçilen hücreler arasındaki kelimeyi kontrol et
  const handleCellSelection = (start, end) => {
    if (!start || !end) return;

    const [startRow, startCol] = start;
    const [endRow, endCol] = end;

    // Seçilen hücrelerin yönünü belirle
    const rowDiff = endRow - startRow;
    const colDiff = endCol - startCol;

    // Yatay, dikey veya çapraz seçim kontrolü
    if (Math.abs(rowDiff) !== Math.abs(colDiff) && rowDiff !== 0 && colDiff !== 0) {
      setSelectedCells([]);
      return;
    }

    // Seçilen hücreleri topla
    const selected = [];
    const steps = Math.max(Math.abs(rowDiff), Math.abs(colDiff)) + 1;
    const rowStep = rowDiff === 0 ? 0 : rowDiff / (steps - 1);
    const colStep = colDiff === 0 ? 0 : colDiff / (steps - 1);

    for (let i = 0; i < steps; i++) {
      const row = Math.round(startRow + i * rowStep);
      const col = Math.round(startCol + i * colStep);
      selected.push([row, col]);
    }

    setSelectedCells(selected);

    // Seçilen harfleri birleştir
    const selectedWord = selected
      .map(([row, col]) => grid[row][col])
      .join('')
      .toLowerCase();

    // Kelimeyi kontrol et
    checkWord(selectedWord, selected);
  };

  // Oyunu yeniden başlatma fonksiyonu
  const restartGame = () => {
    setLoading(true);
    setScore(0);
    setTimeLeft(null);
    setFoundWords([]);
    setSelectedCells([]);
    setTimeUp(false);
    setGameStarted(true);
    startGame();
  };

  // Süre bittiğinde modalı aç
  useEffect(() => {
    if (timeUp) {
      setShowTimeUpModal(true);
    } else {
      setShowTimeUpModal(false);
    }
  }, [timeUp]);

  // Oyun bittiğinde geçen süreyi hesapla
  useEffect(() => {
    if (allWordsFound && timeLeft !== null) {
      setCongratsDuration(initialTime - timeLeft);
    }
  }, [allWordsFound, timeLeft]);

  if (loading) {
    return <ActivityIndicator size="large" color={theme.header} style={{ marginTop: 40 }} />;
  }

  return (
    <LinearGradient
      colors={isDark ? ['#181825', '#232136', '#fbbf2422'] : ['#f8fafc', '#e0e7ff', '#a78bfa11']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <View style={[styles.container, { backgroundColor: 'transparent' }]}>
        <View style={[styles.bgCircle1, isDark && styles.bgCircle1Dark]} />
        <View style={[styles.bgCircle2, isDark && styles.bgCircle2Dark]} />
        <View style={[styles.bgCircle3, isDark && styles.bgCircle3Dark]} />

        <View style={styles.headerBoxRow}>
          {isWeb ? (
            <View style={{
              width: '100%',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 10,
              position: 'relative',
            }}>
              {/* Web için geri tuşu */}
              <TouchableOpacity
                style={styles.webBackButton}
                onPress={() => {
                  if (window.history.length > 1) {
                    router.back();
                  } else {
                    router.push('/games');
                  }
                }}
              >
                <MaterialIcons name="arrow-back" size={28} color={theme.header} />
              </TouchableOpacity>

              {/* Timer ve puan kutusu ortada */}
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                {/* Timer kutusu */}
                <Animated.View style={[styles.timerBox, {
                  marginRight: isWeb ? 200 : 12,
                  shadowColor: '#F87171',
                  shadowOpacity: timeLeft <= 7 ? 0.5 : 0.15,
                  shadowRadius: timeLeft <= 7 ? 16 : 8,
                  elevation: 4,
                  borderColor: timeLeft <= 7 ? '#F87171' : '#7C3AED',
                  transform: [{ translateX: timerShakeAnim.interpolate({ inputRange: [-1, 1], outputRange: [-6, 6] }) }],
                }]}> 
                  <Text style={[styles.timerText, timeLeft <= 10 && styles.timerTextDanger]}>{formatTime(timeLeft)}</Text>
                </Animated.View>
                {/* Puan kutusu */}
                <View style={{
                  backgroundColor: isDark ? '#232136' : '#fff',
                  borderRadius: 16,
                  paddingTop: 0,
                  paddingBottom: 8,
                  paddingHorizontal: 22,
                  flexDirection: 'row',
                  alignItems: 'center',
                  boxShadow: '0 2px 12px 0 rgba(124,58,237,0.08)',
                  borderWidth: 2,
                  borderColor: isDark ? '#10B981' : '#FBBF24',
                  marginLeft: isWeb ? 200 : 100,
                }}>
                  <MaterialIcons name="emoji-events" size={26} color={isDark ? '#10B981' : '#FBBF24'} style={{marginRight: 6}} />
                  <Text style={{fontWeight:'bold',fontSize:22,color: isDark ? '#10B981' : '#FBBF24',letterSpacing:1}}>{earnedPoints}</Text>
                </View>
              </View>
            </View>
          ) : (
            // Mobilde tüm kutuların üstten boşluğunu eşit olarak artır
            <View style={{
              width: '100%',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 16,
              marginTop: 32,
              marginBottom: 10,
            }}>
              <TouchableOpacity style={styles.mobileBackButton} onPress={() => router.back()}>
                <MaterialIcons name="arrow-back" size={28} color={theme.header} />
              </TouchableOpacity>
              
              {/* Timer kutusu */}
              <View style={[styles.timerBox, {marginLeft: 0}]}> 
                <Text style={[styles.timerText, timeLeft <= 10 && styles.timerTextDanger]}>{formatTime(timeLeft)}</Text>
              </View>
              
              {/* Puan kutusu */}
              <View style={{
                backgroundColor: isDark ? '#232136' : '#fff',
                borderRadius: 16,
                paddingTop: 0,
                paddingBottom: 8,
                paddingHorizontal: 22,
                flexDirection: 'row',
                alignItems: 'center',
                boxShadow: '0 2px 12px 0 rgba(124,58,237,0.08)',
                borderWidth: 2,
                borderColor: isDark ? '#10B981' : '#FBBF24',
                marginLeft: 100,
              }}>
                <MaterialIcons name="emoji-events" size={26} color={isDark ? '#10B981' : '#FBBF24'} style={{marginRight: 6}} />
                <Text style={{fontWeight:'bold',fontSize:22,color: isDark ? '#10B981' : '#FBBF24',letterSpacing:1}}>{earnedPoints}</Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.selectedInfoBox}>
          <Text style={styles.selectedInfoText}>Dil: <Text style={styles.selectedInfoValue}>{currentSettings.langLabel}</Text></Text>
          <Text style={styles.selectedInfoText}>Kategori: <Text style={[styles.selectedInfoValue, { color: '#F59E42' }]}>{currentSettings.catLabel}</Text></Text>
          <Text style={styles.selectedInfoText}>Seviye: <Text style={styles.selectedInfoValue}>{currentSettings.levelLabel}</Text></Text>
        </View>

        <View style={[styles.outerRow, { marginTop: isWeb ? 12 : 32 }, (allWordsFound || timeUp) && { pointerEvents: 'none', opacity: 0.5 }]}>
          <View style={[styles.floatingWordsCol, styles.leftWordsColWeb]}>
            {leftWords.map((word, idx) => (
              <View key={idx} style={[styles.floatingWord, word.found && styles.foundFloatingWord, {height: CELL_SIZE}]}>
                <Text style={[
                  styles.floatingWordText,
                  word.found && {color: '#fff', textDecorationLine: 'line-through', opacity: 0.7, background: 'linear-gradient(90deg,#FBBF24,#7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', transition: 'all 0.3s'}
                ]}>{word.text}</Text>
              </View>
            ))}
          </View>
          <Animatable.View 
            animation="fadeInUp" 
            duration={700} 
            style={[styles.grid, {backdropFilter: 'blur(18px)', shadowColor: '#a78bfa', shadowOpacity: 0.18, shadowRadius: 32, elevation: 12}]}
          >
            {grid.map((row, rowIndex) => (
              <View key={rowIndex} style={styles.gridRow}>
                {row.map((cell, colIndex) => (
                  <TouchableOpacity
                    key={`${rowIndex}-${colIndex}`}
                    style={[
                      styles.cell,
                      selectedCells.some(([r, c]) => r === rowIndex && c === colIndex) && styles.selectedCell,
                      foundWords.some(word =>
                        word.positions.some(([r, c]) => r === rowIndex && c === colIndex)
                      ) && styles.foundCell,
                      {transitionProperty: isWeb ? 'background,border,box-shadow' : undefined, transitionDuration: isWeb ? '0.3s' : undefined},
                    ]}
                    onPress={() => handleCellPress(rowIndex, colIndex)}
                    disabled={allWordsFound || timeUp}
                    activeOpacity={0.7}
                  >
                    <Animatable.View animation={selectedCells.some(([r, c]) => r === rowIndex && c === colIndex) ? 'pulse' : undefined} duration={300} style={styles.cellInner}>
                      <Text style={styles.cellText}>{cell}</Text>
                    </Animatable.View>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </Animatable.View>
          <View style={[styles.floatingWordsCol, styles.rightWordsColWeb]}>
            {rightWords.map((word, idx) => (
              <View key={idx} style={[styles.floatingWord, word.found && styles.foundFloatingWord, {height: CELL_SIZE}]}>
                <Text style={[
                  styles.floatingWordText,
                  word.found && {color: '#fff', textDecorationLine: 'line-through', opacity: 0.7, background: 'linear-gradient(90deg,#FBBF24,#7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', transition: 'all 0.3s'}
                ]}>{word.text}</Text>
              </View>
            ))}
          </View>
        </View>
        {(allWordsFound || timeUp) && (
          <View style={{position:'absolute',top:0,left:0,right:0,height: CELL_SIZE * GRID_SIZE + GRID_MARGIN * 2, zIndex:20, alignSelf:'center'}} pointerEvents="auto" />
        )}
        <View style={styles.bottomWordsRow} pointerEvents={allWordsFound || timeUp ? 'none' : 'auto'}>
          {words.map((word, idx) => (
            <View key={idx} style={[styles.floatingWord, word.found && styles.foundFloatingWord, {position: 'relative'}]}>
              <Text style={[
                styles.floatingWordText,
                word.found && {color: '#fff', textDecorationLine: 'line-through', opacity: 0.7, background: 'linear-gradient(90deg,#FBBF24,#7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', transition: 'all 0.3s'}
              ]}>{word.text}</Text>
            </View>
          ))}
        </View>
        {(allWordsFound || timeUp) && (
          <View style={{position:'absolute',top: styles.outerRow.marginTop + (isWeb ? 0 : 32) + (CELL_SIZE * GRID_SIZE + GRID_MARGIN * 2), left:0, right:0, height: 60, zIndex:20, alignSelf:'center'}} pointerEvents="auto" />
        )}
        <View style={{ width: '100%', alignItems: 'center', marginTop: 32, marginBottom: 16 }}>
          <TouchableOpacity style={styles.restartButton} onPress={restartGame}>
            <MaterialIcons name="refresh" size={24} color="#fff" />
            <Text style={styles.restartButtonText}>Yeniden Başla</Text>
          </TouchableOpacity>
        </View>
        {showCongratsModal && (
          <Modal
            visible={showCongratsModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowCongratsModal(false)}
          >
            <TouchableOpacity style={{flex:1}} activeOpacity={1} onPress={() => setShowCongratsModal(false)}>
              <BlurView intensity={60} tint={isDark ? 'dark' : 'light'} style={{flex:1,justifyContent:'center',alignItems:'center'}}>
                <Animated.View style={{ transform: [{ scale: modalScaleAnim }], backgroundColor: isDark ? '#232136' : '#fff', borderRadius: 20, padding: 32, alignItems: 'center', maxWidth: 360, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 16, elevation: 8 }}>
                  <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#FBBF24', marginBottom: 12 }}>Tebrikler! 🎉</Text>
                  <Text style={{ fontSize: 20, color: isDark ? '#fff' : '#232136', marginBottom: 18, textAlign: 'center' }}>Tüm kelimeleri buldun!</Text>
                  <Text style={{ fontSize: 18, color: isDark ? '#fff' : '#232136', marginBottom: 8 }}>Kazanılan Puan: <Text style={{ color: '#7C3AED', fontWeight: 'bold' }}>{congratsPoints.points}</Text></Text>
                  {congratsDuration !== null && (
                    <Text style={{ fontSize: 16, color: isDark ? '#fff' : '#232136', marginBottom: 8 }}>Geçen Süre: <Text style={{ color: '#7C3AED', fontWeight: 'bold' }}>{congratsDuration} sn</Text></Text>
                  )}
                  <View style={{ flexDirection: 'row', gap: 16, marginTop: 8 }}>
                    <TouchableOpacity onPress={restartGame} style={{ backgroundColor: '#7C3AED', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10, marginRight: 8 }}>
                      <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>Tekrar Oyna</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => { setShowCongratsModal(false); router.back(); }} style={{ backgroundColor: '#FBBF24', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10 }}>
                      <Text style={{ color: isDark ? '#232136' : '#232136', fontWeight: 'bold', fontSize: 18 }}>Ana Menü</Text>
                    </TouchableOpacity>
                  </View>
                </Animated.View>
                {showConfettiAnim && <ConfettiCannon count={120} origin={{x:180,y:0}} fadeOut autoStart explosionSpeed={350} fallSpeed={2500} />}
              </BlurView>
            </TouchableOpacity>
          </Modal>
        )}
        {showTimeUpModal && (
          <Modal
            visible={showTimeUpModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowTimeUpModal(false)}
          >
            <TouchableOpacity style={{flex:1}} activeOpacity={1} onPress={() => setShowTimeUpModal(false)}>
              <BlurView intensity={60} tint={isDark ? 'dark' : 'light'} style={{flex:1,justifyContent:'center',alignItems:'center'}}>
                <Animated.View style={{ transform: [{ scale: modalScaleAnim }], backgroundColor: isDark ? '#232136' : '#fff', borderRadius: 20, padding: 32, alignItems: 'center', maxWidth: 360, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 16, elevation: 8 }}>
                  <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#F87171', marginBottom: 12 }}>Süre Doldu!</Text>
                  <Text style={{ fontSize: 20, color: isDark ? '#fff' : '#232136', marginBottom: 18, textAlign: 'center' }}>Süren doldu. Tekrar deneyebilirsin!</Text>
                  <View style={{ flexDirection: 'row', gap: 16, marginTop: 8 }}>
                    <TouchableOpacity onPress={() => {
                      setShowTimeUpModal(false);
                      setScore(0);
                      setFoundWords([]);
                      setSelectedCells([]);
                      setTimeUp(false);
                      setGameStarted(true);
                      startGame();
                    }} style={{ backgroundColor: '#7C3AED', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10, marginRight: 8 }}>
                      <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>Tekrar Oyna</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => { setShowTimeUpModal(false); router.back(); }} style={{ backgroundColor: '#FBBF24', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10 }}>
                      <Text style={{ color: isDark ? '#232136' : '#232136', fontWeight: 'bold', fontSize: 18 }}>Ana Menü</Text>
                    </TouchableOpacity>
                  </View>
                </Animated.View>
              </BlurView>
            </TouchableOpacity>
          </Modal>
        )}
      </View>
    </LinearGradient>
  );
} 