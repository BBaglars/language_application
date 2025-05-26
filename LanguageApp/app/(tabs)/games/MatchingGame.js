import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Platform, Dimensions, Animated, useColorScheme, Modal, FlatList } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import api from '../../../api';
import { useGameSettings } from '../../../context/GameSettingsContext';
import { useTheme } from '../../../context/ThemeContext';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '../../../context/UserContext';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { FontAwesome5 } from '@expo/vector-icons';

const FLIP_DURATION = 350;

const CARD_FONT_FAMILY =
  Platform.OS === 'android'
    ? 'sans-serif-medium'
    : Platform.OS === 'ios'
    ? 'System'
    : 'sans-serif-medium';

export default function MatchingGame() {
  const { settings } = useGameSettings();
  const { theme: themeMode } = useTheme();
  const systemScheme = useColorScheme();
  const isDark = themeMode === 'dark' || (themeMode === 'system' && systemScheme === 'dark');
  const router = useRouter();
  const { addPoints } = useUser();

  const [languagePairs, setLanguagePairs] = useState([]);
  const [selectedPairId, setSelectedPairId] = useState('');
  const [loading, setLoading] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [cards, setCards] = useState([]);
  const [selectedCards, setSelectedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [score, setScore] = useState(0);
  const [flipAnimations] = useState(() => Array(16).fill(0).map(() => new Animated.Value(0)));
  const [scaleAnimations] = useState(() => Array(16).fill(0).map(() => new Animated.Value(1)));
  const [isFlippedArr, setIsFlippedArr] = useState(Array(16).fill(false));
  const [flipAnimArr, setFlipAnimArr] = useState(Array(16).fill(0));
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [force, setForce] = useState(false);
  const [streak, setStreak] = useState(0);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [showCongratsModal, setShowCongratsModal] = useState(false);
  const [congratsPoints, setCongratsPoints] = useState({ points: 0, newStreak: 0, details: {} });
  const [mistakeCount, setMistakeCount] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [showTimeUpModal, setShowTimeUpModal] = useState(false);

  const { width: screenWidth } = Dimensions.get('window');
  const GRID_SIZE = 4;
  const isMobile = Platform.OS !== 'web';
  const GRID_MARGIN = isMobile ? 8 : 24;
  const CARD_MARGIN = isMobile ? 6 : 12;
  const GRID_WIDTH = isMobile
    ? screenWidth - GRID_MARGIN * 2
    : Math.min(520, screenWidth - GRID_MARGIN * 2);
  const CARD_SIZE = (GRID_WIDTH - (GRID_SIZE + 1) * CARD_MARGIN) / GRID_SIZE;

  // GameSetup ile aynı overlay arka planı
  const dropdownOverlayBg = isDark ? 'rgba(35,33,54,0.85)' : 'rgba(255,255,255,0.85)';

  // SelectComponent'i MatchingGame fonksiyonu içine taşıdım, böylece styles objesine erişebilecek
  const SelectComponent = ({ value, setValue, items, placeholder, open, setOpen, onOpen, zIndex, textColor, borderColor, dropdownBg, placeholderColor, dropdownOverlayBg }) => {
    const selectedObj = items.find(i => i.value === value);
    const selectedLabel = selectedObj ? selectedObj.label : placeholder;
    const isPlaceholder = !selectedObj;
    const maxHeight = Platform.OS === 'web' ? 44 * 7 : 44 * 5;
    return (
      <>
        <TouchableOpacity
          style={styles.customDropdownButton}
          onPress={() => {
            setOpen(true);
            if (onOpen) onOpen();
          }}
          activeOpacity={0.85}
        >
          <Text style={[styles.customDropdownButtonText, isPlaceholder && styles.customDropdownPlaceholder]}>{selectedLabel}</Text>
          <MaterialIcons name="arrow-drop-down" size={22} color="#7C3AED" style={{ marginLeft: 4 }} />
        </TouchableOpacity>
        <Modal
          visible={open}
          transparent
          animationType="fade"
          onRequestClose={() => setOpen(false)}
        >
          <TouchableOpacity
            style={styles.customDropdownOverlay}
            activeOpacity={1}
            onPressOut={() => setOpen(false)}
          >
            <View style={styles.customDropdownModal}>
              <FlatList
                data={items}
                keyExtractor={item => item.value}
                style={{ maxHeight }}
                renderItem={({ item }) => {
                  const isSelected = value === item.value;
                  return (
                    <TouchableOpacity
                      style={[styles.customDropdownItem, isSelected && styles.customDropdownItemSelected]}
                      onPress={() => {
                        setValue(item.value);
                        setOpen(false);
                      }}
                    >
                      <Text style={[styles.customDropdownItemText, isSelected && styles.customDropdownItemTextSelected]}>{item.label}</Text>
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

  useEffect(() => {
    fetchLanguagePairs();
  }, []);

  useEffect(() => {
    // Her kart için animasyon değerini dinle (sadece bir kere ekle)
    flipAnimations.forEach((anim, idx) => {
      anim.removeAllListeners && anim.removeAllListeners();
      anim.addListener(({ value }) => {
        setIsFlippedArr(prev => {
          const updated = [...prev];
          updated[idx] = value >= 0.5;
          return updated;
        });
        setFlipAnimArr(prev => {
          const updated = [...prev];
          updated[idx] = value;
          return updated;
        });
      });
    });
    // Temizlik
    return () => {
      flipAnimations.forEach(anim => anim.removeAllListeners && anim.removeAllListeners());
    };
  }, []);

  const fetchLanguagePairs = async () => {
    try {
      const res = await api.get('/language-pairs');
      setLanguagePairs(res.data.data || []);
    } catch (error) {
      Alert.alert('Hata', 'Dil çiftleri yüklenemedi!');
    }
  };

  const startGame = async () => {
    // Timer'ı seviyeye göre her zaman sıfırla
    const levelMultipliers = { A1: 1, A2: 1, B1: 1.2, B2: 1.2, C1: 1.4, C2: 1.4 };
    const multiplier = levelMultipliers[settings.level] || 1;
    const initialTime = Math.round(90 * multiplier);
    setTimeLeft(initialTime);
    if (!selectedPairId) {
      Alert.alert('Uyarı', 'Lütfen bir dil çifti seçin!');
      return;
    }
    setLoading(true);
    try {
      const res = await api.get('/matching-game-cards', {
        params: {
          languagePairId: selectedPairId,
          categoryId: settings.cat,
          difficultyLevel: settings.level,
          limit: 8
        }
      });
      const pairs = res.data.data?.pairs || [];
      let newCards = [];
      pairs.forEach(pair => {
        newCards.push({ type: 'word', pairId: pair.pairId, text: pair.word.text, id: `w-${pair.word.id}` });
        newCards.push({ type: 'meaning', pairId: pair.pairId, text: pair.meaning.text, id: `m-${pair.meaning.id}` });
      });
      newCards = newCards.sort(() => Math.random() - 0.5);
      
      // Önce tüm state'leri sıfırla
      setMatchedPairs([]);
      setSelectedCards([]);
      setScore(0);
      setIsFlippedArr(Array(16).fill(false));
      setFlipAnimArr(Array(16).fill(0));
      
      // Animasyonları sıfırla
      flipAnimations.forEach(anim => {
        anim.setValue(0);
        anim.stopAnimation();
      });
      scaleAnimations.forEach(anim => {
        anim.setValue(1);
        anim.stopAnimation();
      });
      
      // En son kartları set et
      setCards(newCards);
      setGameStarted(true);
    } catch (error) {
      Alert.alert('Hata', 'Oyun başlatılamadı!');
    } finally {
      setLoading(false);
    }
  };

  const flipCard = (index, callback) => {
    Animated.timing(flipAnimations[index], {
      toValue: 1,
      duration: FLIP_DURATION,
      useNativeDriver: true,
    }).start(() => {
      if (callback) callback();
    });
  };

  const resetCard = (index) => {
    Animated.timing(flipAnimations[index], {
      toValue: 0,
      duration: FLIP_DURATION,
      useNativeDriver: true,
    }).start();
  };

  const handleCardSelect = (card, index) => {
    if (selectedCards.length === 2 || matchedPairs.includes(card.pairId) || selectedCards.find(c => c.id === card.id)) return;
    if (selectedCards.length === 1) {
      const first = selectedCards[0];
      const second = card;
      if (first.pairId === second.pairId && first.type !== second.type) {
        flipCard(index, () => {
          setMatchedPairs(prev => [...prev, first.pairId]);
          setScore(prev => prev + 5);
          setSelectedCards([]);
        });
        setSelectedCards([...selectedCards, card]);
        return;
      } else {
        setMistakeCount(prev => prev + 1);
      }
    }
    flipCard(index);
    const newSelected = [...selectedCards, card];
    setSelectedCards(newSelected);
    if (newSelected.length === 2) {
      const [first, second] = newSelected;
      if (!(first.pairId === second.pairId && first.type !== second.type)) {
        setTimeout(() => {
          setSelectedCards([]);
          resetCard(index);
          resetCard(cards.findIndex(c => c.id === first.id));
        }, 800);
      }
    }
  };

  // Kartları 16'ya tamamla (eksikse boş kart ekle)
  const filledCards = cards.length === 16 ? cards : [
    ...cards,
    ...Array(16 - cards.length).fill(null).map((_, i) => ({ id: `empty-${i}`, empty: true }))
  ];

  // Kartları 4x4 satırlara böl
  const rows = [];
  for (let i = 0; i < 4; i++) {
    rows.push(filledCards.slice(i * 4, i * 4 + 4));
  }

  const theme = {
    bg: isDark ? '#181825' : '#f8fafc',
    card: isDark ? '#232136' : '#ffffff',
    cardBack: '#7c3aed',
    cardText: isDark ? '#fff' : '#334155',
    cardTextBack: '#fff',
    border: isDark ? '#232136' : '#e2e8f0',
    header: isDark ? '#a78bfa' : '#7C3AED',
    infoBg: isDark ? '#232136' : '#fff',
    infoText: isDark ? '#fff' : '#64748b',
    infoValue: isDark ? '#a78bfa' : '#7C3AED',
    grid: isDark ? '#232136' : '#fff',
    pickerBg: isDark ? '#232136' : '#fff',
    pickerText: isDark ? '#fff' : '#222',
    cardOpenBg: isDark ? '#2d2e3e' : '#f3f4f6',
    cardOpenText: isDark ? '#fff' : '#222',
    cardMatched: {
      backgroundColor: '#FBBF24',
      borderColor: '#FBBF24',
    },
  };

  // 1. Arka planı ve kutu renklerini uyumlu yap
  const mainBg = isMobile ? (isDark ? '#181825' : '#f3f4f6') : theme.bg;

  // 2. Bilgi kutusu stilleri
  const infoBoxBg = isMobile ? (isDark ? '#232136' : '#f3f4f6') : theme.infoBg;
  const infoBoxRadius = isMobile ? 8 : 12;
  const infoBoxPaddingV = isMobile ? 4 : 10;
  const infoBoxPaddingH = isMobile ? 10 : 20;
  const infoBoxMarginT = isMobile ? 4 : 12;
  const infoBoxMarginB = isMobile ? 8 : 0;
  const infoBoxShadow = isMobile ? { shadowOpacity: 0, elevation: 0 } : { shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 };

  // 3. Kart stilleri
  const cardRadius = isMobile ? 10 : 16;
  const cardShadow = isMobile ? { shadowOpacity: 0, elevation: 0 } : { shadowOpacity: 0.25, shadowRadius: 24, elevation: 10 };
  const cardBorder = isMobile ? '#7C3AED' : theme.cardBack;
  const cardBg = isMobile ? '#7C3AED' : theme.cardBack;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: mainBg,
      padding: 0,
      position: 'relative',
      overflow: 'hidden',
    },
    bgCircle1: {
      position: 'absolute',
      width: 400,
      height: 400,
      borderRadius: 200,
      backgroundColor: isDark ? '#a78bfa11' : '#a78bfa22',
      top: -120,
      left: -120,
      zIndex: 0,
    },
    bgCircle2: {
      position: 'absolute',
      width: 300,
      height: 300,
      borderRadius: 150,
      backgroundColor: isDark ? '#38bdf811' : '#38bdf822',
      bottom: -80,
      right: -80,
      zIndex: 0,
    },
    bgCircle3: {
      position: 'absolute',
      width: 250,
      height: 250,
      borderRadius: 125,
      backgroundColor: isDark ? '#fbbf2411' : '#fbbf2422',
      top: 150,
      right: -60,
      zIndex: 0,
    },
    headerBox: {
      width: '100%',
      alignItems: 'center',
      marginBottom: 16,
      marginTop: 32,
    },
    selectedInfoBox: {
      flexDirection: isMobile ? 'column' : 'row',
      gap: isMobile ? 4 : 24,
      marginTop: infoBoxMarginT,
      marginBottom: infoBoxMarginB,
      backgroundColor: infoBoxBg,
      borderRadius: infoBoxRadius,
      paddingVertical: infoBoxPaddingV,
      paddingHorizontal: infoBoxPaddingH,
      width: isMobile ? '96%' : undefined,
      alignSelf: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      ...infoBoxShadow,
    },
    selectedInfoText: {
      fontSize: isMobile ? 14 : 16,
      color: isMobile ? (isDark ? '#cbd5e1' : '#334155') : theme.infoText,
      fontWeight: '500',
    },
    selectedInfoValue: {
      color: '#a78bfa',
      fontWeight: '600',
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      color: '#7C3AED',
      marginBottom: 12,
      textAlign: 'center',
      letterSpacing: 0.5,
      textShadowColor: isDark ? '#7C3AED11' : '#7C3AED22',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 4,
    },
    scoreRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 32,
      marginBottom: 24,
      marginTop: 12,
    },
    scoreText: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.header,
      marginRight: 24,
    },
    newGameButton: {
      backgroundColor: isMobile ? '#a78bfa' : theme.header,
      paddingVertical: isMobile ? 10 : 12,
      paddingHorizontal: isMobile ? 18 : 32,
      borderRadius: isMobile ? 8 : 12,
      shadowColor: isMobile ? 'transparent' : theme.header,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isMobile ? 0 : 0.2,
      shadowRadius: isMobile ? 0 : 8,
      elevation: isMobile ? 0 : 4,
    },
    newGameButtonText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: isMobile ? 15 : 16,
      letterSpacing: 0.5,
    },
    grid: {
      width: GRID_WIDTH,
      height: GRID_WIDTH,
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'center',
      backgroundColor: isMobile ? (isDark ? '#232136' : '#fff') : theme.grid,
      borderRadius: isMobile ? 12 : 20,
      padding: CARD_MARGIN,
      marginTop: isMobile ? 8 : 12,
      marginBottom: isMobile ? 16 : 32,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
      overflow: 'visible',
    },
    cardContainer: {
      width: CARD_SIZE,
      height: CARD_SIZE,
      margin: CARD_MARGIN / 2,
      perspective: 1000,
      overflow: 'visible',
    },
    card: {
      width: CARD_SIZE,
      height: CARD_SIZE,
      borderRadius: cardRadius,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      shadowColor: '#7C3AED',
      shadowOffset: { width: 0, height: 10 },
      ...cardShadow,
      position: 'absolute',
      backfaceVisibility: 'hidden',
      transitionProperty: Platform.OS === 'web' ? 'box-shadow, transform' : undefined,
      transitionDuration: Platform.OS === 'web' ? '0.18s' : undefined,
      backgroundColor: isMobile ? '#a78bfa' : 'transparent',
      borderColor: isMobile ? '#7C3AED' : cardBorder,
    },
    cardFront: {
      backgroundColor: 'transparent',
      borderColor: cardBorder,
      transform: [{ rotateY: '180deg' }],
      overflow: 'hidden',
    },
    cardBack: {
      backgroundColor: 'transparent',
      borderColor: cardBorder,
      overflow: 'hidden',
    },
    cardOpen: {
      backgroundColor: isMobile ? '#ede9fe' : '#fffbe6',
      borderColor: isMobile ? '#a78bfa' : '#f59e42',
    },
    cardMatched: {
      backgroundColor: '#FBBF24',
      borderColor: '#FBBF24',
    },
    cardText: {
      fontSize: Platform.OS === 'web' ? 16 : 13,
      fontWeight: '900',
      color: isMobile ? '#fff' : theme.cardText,
      textAlign: 'center',
      userSelect: 'none',
      textShadowColor: '#7C3AED44',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 6,
      fontFamily: CARD_FONT_FAMILY,
      paddingHorizontal: 4,
      paddingVertical: 2,
      flexShrink: 1,
      width: '90%',
      alignSelf: 'center',
    },
    cardTextBack: {
      color: isMobile ? '#fff' : theme.cardTextBack,
      fontSize: Platform.OS === 'web' ? 28 : 20,
      fontWeight: '900',
      letterSpacing: 1,
      fontFamily: CARD_FONT_FAMILY,
    },
    label: {
      fontSize: 18,
      color: theme.infoText,
      marginBottom: 8,
      fontWeight: '500',
    },
    picker: {
      width: '80%',
      height: 50,
      backgroundColor: theme.pickerBg,
      borderRadius: 12,
      marginBottom: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
      color: theme.pickerText,
    },
    startButton: {
      backgroundColor: theme.header,
      paddingVertical: 14,
      paddingHorizontal: 36,
      borderRadius: 12,
      shadowColor: theme.header,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    startButtonText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 18,
      letterSpacing: 0.5,
    },
    backIconBtn: {
      position: 'absolute',
      left: isMobile ? 16 : 12,
      top: isMobile ? 24 : 12,
      padding: 8,
      zIndex: 10,
    },
    customDropdownButton: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '80%',
      minHeight: 44,
      borderWidth: 2,
      borderColor: '#7C3AED',
      borderRadius: 12,
      backgroundColor: '#fff',
      justifyContent: 'space-between',
      paddingHorizontal: 12,
      marginBottom: 24,
      fontWeight: 'bold',
      shadowColor: '#7C3AED',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 2,
    },
    customDropdownButtonText: {
      color: '#7C3AED',
      fontSize: Platform.OS === 'web' ? 16 : 15,
      flex: 1,
      fontWeight: 'bold',
    },
    customDropdownPlaceholder: {
      color: '#7C3AED',
      opacity: 0.7,
    },
    customDropdownOverlay: {
      flex: 1,
      // Arka plan rengi prop ile atanıyor, burada default bırakıldı
      justifyContent: 'center',
      alignItems: 'center',
    },
    customDropdownModal: {
      width: 260,
      backgroundColor: '#fff',
      borderRadius: 16,
      paddingVertical: 10,
      elevation: 10,
      shadowColor: '#7C3AED',
      shadowOpacity: 0.12,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
    },
    customDropdownItem: {
      paddingVertical: 13,
      paddingHorizontal: 18,
      borderRadius: 8,
    },
    customDropdownItemSelected: {
      backgroundColor: '#ede9fe',
    },
    customDropdownItemText: {
      fontSize: Platform.OS === 'web' ? 16 : 15,
      color: '#7C3AED',
      fontWeight: 'bold',
    },
    customDropdownItemTextSelected: {
      color: '#7C3AED',
      fontWeight: 'bold',
    },
  });

  // Oyun bitti mi kontrolü
  const isGameFinished = matchedPairs.length === cards.filter(c => !c.empty).length / 2 && cards.length > 0;

  // Streak'i AsyncStorage'dan yükle
  useEffect(() => {
    const loadStreak = async () => {
      try {
        const savedStreak = await AsyncStorage.getItem('matching_streak');
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
      await AsyncStorage.setItem('matching_streak', newStreak.toString());
      setStreak(newStreak);
    } catch (error) {
      console.error('Streak kaydedilirken hata:', error);
    }
  };

  // Timer'ı seviyeye göre dinamik yap
  useEffect(() => {
    let timer;
    if (gameStarted && !isGameFinished) {
      const levelMultipliers = { A1: 1, A2: 1, B1: 1.2, B2: 1.2, C1: 1.4, C2: 1.4 };
      const multiplier = levelMultipliers[settings.level] || 1;
      const initialTime = Math.round(90 * multiplier);
      setTimeLeft(initialTime);
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev === 1) {
            clearInterval(timer);
            return 0;
          }
          return prev > 0 ? prev - 1 : 0;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameStarted, isGameFinished, settings.level]);

  // Yeni puan hesaplama fonksiyonu
  const calculatePoints = (pairCount, timeLeft, mistakeCount) => {
    let points = 0;
    let details = {};
    // Her doğru eşleşme için 12 puan
    points += pairCount * 12;
    details.pairs = pairCount * 12;
    // Süre bonusu: kalan her saniye için 0.5 puan
    const timeBonus = timeLeft * 0.5;
    points += timeBonus;
    details.timeBonus = timeBonus;
    // Hata yapmadan bitirme bonusu
    if (mistakeCount === 0) {
      points += 40;
      details.noMistake = 40;
    } else {
      details.noMistake = 0;
    }
    // Streak bonusu
    let streakBonus = 0;
    if (streak >= 10) streakBonus = 50;
    else if (streak >= 5) streakBonus = 25;
    else if (streak >= 3) streakBonus = 10;
    points += streakBonus;
    details.streakBonus = streakBonus;
    // Seviye çarpanı
    const levelMultipliers = { A1: 1, A2: 1, B1: 1.2, B2: 1.2, C1: 1.4, C2: 1.4 };
    const multiplier = levelMultipliers[settings.level] || 1;
    details.multiplier = multiplier;
    const total = Math.round(points * multiplier);
    return { points: total, details };
  };

  // Oyun başladığında süreyi başlat
  useEffect(() => {
    if (gameStarted) {
      setStartTime(Date.now());
      setEndTime(null);
      setMistakeCount(0);
    }
  }, [gameStarted]);

  // Oyun bittiğinde puanları hesapla ve modalı aç
  useEffect(() => {
    if (isGameFinished && startTime && !endTime) {
      const finishTime = Date.now();
      setEndTime(finishTime);
      const duration = (finishTime - startTime) / 1000;
      // Kalan süreyi hesapla
      const initialTime = Math.round(90 * (({A1:1,A2:1,B1:1.2,B2:1.2,C1:1.4,C2:1.4})[settings.level] || 1));
      const timeLeft = Math.max(0, initialTime - Math.round(duration));
      const { points, details } = calculatePoints(matchedPairs.length, timeLeft, mistakeCount);
      setEarnedPoints(points);
      addPoints(points);
      setCongratsPoints({ points, details, duration });
      setShowCongratsModal(true);
    }
  }, [isGameFinished]);

  // Süre bittiğinde modalı aç
  useEffect(() => {
    if (timeLeft === 0 && gameStarted && !isGameFinished) {
      setShowTimeUpModal(true);
    } else {
      setShowTimeUpModal(false);
    }
  }, [timeLeft, gameStarted, isGameFinished]);

  // Süreyi mm:ss formatında gösteren fonksiyon
  function formatTime(sec) {
    if (sec === null) return '--:--';
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  if (loading) {
    return <ActivityIndicator size="large" color="#4F46E5" style={{ marginTop: 40 }} />;
  }

  return (
    <LinearGradient
      colors={isDark ? ['#181825', '#232136', '#fbbf2422'] : ['#f8fafc', '#e0e7ff', '#a78bfa11']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <View style={styles.container}>
        <TouchableOpacity style={styles.backIconBtn} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={28} color="#7C3AED" />
        </TouchableOpacity>
        <View style={styles.scoreRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: isDark ? '#232136' : '#fff', borderRadius: 16, paddingVertical: 4, paddingHorizontal: 18, borderWidth: 2, borderColor: '#7C3AED', shadowColor: '#7C3AED', shadowOpacity: 0.08, shadowRadius: 8, elevation: 2, marginRight: 16 }}>
            <MaterialIcons name="timer" size={22} color="#7C3AED" style={{ marginRight: 6 }} />
            <Text style={{ fontWeight: 'bold', fontSize: 18, color: '#7C3AED', letterSpacing: 1 }}>{formatTime(timeLeft)}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: isDark ? '#232136' : '#fff', borderRadius: 16, paddingVertical: 4, paddingHorizontal: 18, borderWidth: 2, borderColor: isDark ? '#10B981' : '#FBBF24', shadowColor: '#7C3AED', shadowOpacity: 0.08, shadowRadius: 8, elevation: 2 }}>
            <FontAwesome5 name="trophy" size={22} color={isDark ? '#10B981' : '#FBBF24'} style={{ marginRight: 6 }} />
            <Text style={{ fontWeight: 'bold', fontSize: 18, color: isDark ? '#10B981' : '#FBBF24', letterSpacing: 1 }}>{score}</Text>
          </View>
        </View>
        <View style={styles.selectedInfoBox}>
          <Text style={styles.selectedInfoText}>
            Dil Çifti: <Text style={styles.selectedInfoValue}>
              {selectedPairId
                ? (isMobile
                    ? `${languagePairs.find(p => p.id?.toString() === selectedPairId)?.sourceLanguage?.name} -> ${languagePairs.find(p => p.id?.toString() === selectedPairId)?.targetLanguage?.name}`
                    : `${languagePairs.find(p => p.id?.toString() === selectedPairId)?.sourceLanguage?.name} → ${languagePairs.find(p => p.id?.toString() === selectedPairId)?.targetLanguage?.name}`)
                : '-'}
          </Text>
          </Text>
          <View style={{ flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 2 : 16 }}>
            <Text style={styles.selectedInfoText}>
              Kategori: <Text style={[styles.selectedInfoValue, { color: '#F59E42' }]}>{settings.catLabel || settings.cat}</Text>
            </Text>
            <Text style={styles.selectedInfoText}>
              Seviye: <Text style={styles.selectedInfoValue}>{settings.levelLabel || settings.level}</Text>
            </Text>
          </View>
        </View>
        {!gameStarted ? (
          <>
            <Text style={styles.label}>Dil Çifti Seçin:</Text>
            <SelectComponent
              value={selectedPairId}
              setValue={setSelectedPairId}
              items={[
                { label: 'Dil çifti seçin', value: '' },
                ...languagePairs.map(pair => ({
                  label: isMobile
                    ? `${pair.sourceLanguage?.name} -> ${pair.targetLanguage?.name}`
                    : `${pair.sourceLanguage?.name} → ${pair.targetLanguage?.name}`,
                  value: pair.id.toString()
                }))
              ]}
              placeholder="Dil çifti seçin"
              open={dropdownOpen}
              setOpen={setDropdownOpen}
              onOpen={undefined}
              zIndex={1000}
              textColor={theme.header}
              borderColor={theme.header}
              dropdownBg={theme.pickerBg}
              placeholderColor={isDark ? '#aaa' : '#aaa'}
              dropdownOverlayBg={dropdownOverlayBg}
            />
            <TouchableOpacity style={styles.startButton} onPress={startGame}>
              <Text style={styles.startButtonText}>Oyunu Başlat</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={styles.grid}>
              {rows.map((row, rowIdx) => (
                <View key={rowIdx} style={{ flexDirection: 'row', width: '100%', justifyContent: 'center' }}>
                  {row.map((card, idx) => {
                    if (card.empty) {
                      return <View key={card.id} style={[styles.cardContainer, { backgroundColor: 'transparent' }]} />;
                    }
                    const cardIndex = rowIdx * 4 + idx;
                    const isOpen = !!selectedCards.find(c => c.id === card.id) || matchedPairs.includes(card.pairId);
                    const flipValue = flipAnimations[cardIndex];
                    const scale = scaleAnimations[cardIndex];
                    const isFullyFlipped = isFlippedArr[cardIndex] && flipAnimArr[cardIndex] === 1;

                    return (
                      <View key={card.id} style={styles.cardContainer}>
                        {/* Arka yüz (soru işareti) */}
                        <Animated.View
                          style={[
                            StyleSheet.absoluteFill,
                            {
                              backfaceVisibility: 'hidden',
                              backgroundColor: Platform.OS === 'web' ? 'transparent' : '#7C3AED',
                              borderRadius: 16,
                              justifyContent: 'center',
                              alignItems: 'center',
                              transform: [
                                {
                                  rotateY: flipValue.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: ['0deg', '180deg']
                                  })
                                }
                              ]
                            }
                          ]}
                        >
                          {Platform.OS === 'web' && (
                            <View
                              style={[
                                StyleSheet.absoluteFill,
                                {
                                  borderRadius: 16,
                                  background: 'linear-gradient(135deg, #a78bfa 0%, #7C3AED 100%)',
                                }
                              ]}
                            />
                          )}
                          <Text style={[styles.cardTextBack, { color: '#fff' }]}>?</Text>
                        </Animated.View>
                        {/* Ön yüz (kelime) */}
                        <Animated.View
                          style={[
                            StyleSheet.absoluteFill,
                            {
                              backfaceVisibility: 'hidden',
                              backgroundColor: matchedPairs.includes(card.pairId) ? '#FBBF24' : theme.cardOpenBg,
                              borderRadius: 16,
                              justifyContent: 'center',
                              alignItems: 'center',
                              transform: [
                                {
                                  rotateY: flipValue.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: ['180deg', '360deg']
                                  })
                                }
                              ]
                            }
                          ]}
                        >
                          <Text
                            style={[
                              styles.cardText,
                              {
                                color: matchedPairs.includes(card.pairId) ? '#fff' : theme.cardOpenText
                              }
                            ]}
                            numberOfLines={2}
                            ellipsizeMode="tail"
                            adjustsFontSizeToFit={true}
                            minimumFontScale={0.6}
                          >
                            {card.text?.toUpperCase()}
                          </Text>
                        </Animated.View>
                        <TouchableOpacity
                          style={StyleSheet.absoluteFill}
                          onPress={() => handleCardSelect(card, cardIndex)}
                          disabled={isOpen}
                        />
                      </View>
                    );
                  })}
                </View>
              ))}
            </View>
            <TouchableOpacity 
              style={[styles.newGameButton, { alignSelf: 'center', marginTop: 0, marginBottom: 0, flexDirection: 'row', alignItems: 'center', gap: 8 }]} 
              onPress={startGame}
            >
              <MaterialIcons name="refresh" size={20} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.newGameButtonText}>Yeniden Başlat</Text>
            </TouchableOpacity>
          </>
        )}
        {showCongratsModal && (
          <Modal
            visible={showCongratsModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowCongratsModal(false)}
          >
            <BlurView intensity={60} tint={isDark ? 'dark' : 'light'} style={{flex:1,justifyContent:'center',alignItems:'center'}}>
              <View style={{ backgroundColor: isDark ? '#232136' : '#fff', borderRadius: 20, padding: 32, alignItems: 'center', maxWidth: 360, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 16, elevation: 8 }}>
                <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#FBBF24', marginBottom: 12 }}>Tebrikler! 🎉</Text>
                <Text style={{ fontSize: 20, color: isDark ? '#fff' : '#232136', marginBottom: 18, textAlign: 'center' }}>Tüm eşleşmeleri buldun!</Text>
                <Text style={{ fontSize: 18, color: isDark ? '#fff' : '#232136', marginBottom: 8 }}>Kazanılan Puan: <Text style={{ color: '#7C3AED', fontWeight: 'bold' }}>{congratsPoints.points}</Text></Text>
                <View style={{ flexDirection: 'row', gap: 16, marginTop: 8 }}>
                  <TouchableOpacity onPress={() => { setShowCongratsModal(false); startGame(); }} style={{ backgroundColor: '#7C3AED', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10, marginRight: 8 }}>
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>Tekrar Oyna</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => { setShowCongratsModal(false); router.back(); }} style={{ backgroundColor: '#FBBF24', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10 }}>
                    <Text style={{ color: isDark ? '#232136' : '#232136', fontWeight: 'bold', fontSize: 18 }}>Ana Menü</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </BlurView>
          </Modal>
        )}
        {showTimeUpModal && (
          <Modal
            visible={showTimeUpModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowTimeUpModal(false)}
          >
            <BlurView intensity={60} tint={isDark ? 'dark' : 'light'} style={{flex:1,justifyContent:'center',alignItems:'center'}}>
              <View style={{ backgroundColor: isDark ? '#232136' : '#fff', borderRadius: 20, padding: 32, alignItems: 'center', maxWidth: 360, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 16, elevation: 8 }}>
                <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#F87171', marginBottom: 12 }}>Süre Doldu!</Text>
                <Text style={{ fontSize: 20, color: isDark ? '#fff' : '#232136', marginBottom: 18, textAlign: 'center' }}>Süren doldu. Tekrar deneyebilirsin!</Text>
                <View style={{ flexDirection: 'row', gap: 16, marginTop: 8 }}>
                  <TouchableOpacity onPress={() => {
                    setShowTimeUpModal(false);
                    // Timer'ı seviyeye göre sıfırla
                    const levelMultipliers = { A1: 1, A2: 1, B1: 1.2, B2: 1.2, C1: 1.4, C2: 1.4 };
                    const multiplier = levelMultipliers[settings.level] || 1;
                    const initialTime = Math.round(90 * multiplier);
                    setTimeLeft(initialTime);
                    setGameStarted(false);
                    setTimeout(() => {
                      setGameStarted(true);
                      startGame();
                    }, 10);
                  }} style={{ backgroundColor: '#7C3AED', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10, marginRight: 8 }}>
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>Tekrar Oyna</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => { setShowTimeUpModal(false); router.back(); }} style={{ backgroundColor: '#FBBF24', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10 }}>
                    <Text style={{ color: isDark ? '#232136' : '#232136', fontWeight: 'bold', fontSize: 18 }}>Ana Menü</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </BlurView>
          </Modal>
        )}
      </View>
    </LinearGradient>
  );
} 