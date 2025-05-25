import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Keyboard, Platform, useColorScheme, Dimensions, Modal } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import ConfettiCannon from 'react-native-confetti-cannon';
import * as Animatable from 'react-native-animatable';
import { useTheme } from '../../../context/ThemeContext';
import api from '../../../api';
import { MaterialIcons } from '@expo/vector-icons';
import { useGameSettings } from '../../../context/GameSettingsContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '../../../context/UserContext';

const MAX_ATTEMPTS = 5;
const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const LETTER_BOX_SIZE = isWeb ? 60 : Math.min((width - 40) / 5 - 8, 50);

function getLocale(lang) {
  return lang === 'tr' ? 'tr-TR' : 'en-US';
}

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

function displayLetter(letter, lang) {
  if (lang === 'tr') {
    if (letter === 'i') return 'İ';
    if (letter === 'ı') return 'I';
    return letter ? letter.toLocaleUpperCase('tr-TR') : '';
  }
  return letter ? letter.toUpperCase() : '';
}

function getLetterStatuses(guess, answer) {
  // Her harf için: 'correct' (yeşil), 'present' (sarı), 'absent' (gri)
  const result = Array(guess.length).fill('absent');
  const answerArr = answer.split('');
  const guessArr = guess.split('');
  // Önce doğru yerdeki harfleri bul
  for (let i = 0; i < guessArr.length; i++) {
    if (guessArr[i] === answerArr[i]) {
      result[i] = 'correct';
      answerArr[i] = null; // Bu harfi işaretle
    }
  }
  // Sonra doğru harf yanlış yerde olanları bul
  for (let i = 0; i < guessArr.length; i++) {
    if (result[i] === 'correct') continue;
    const idx = answerArr.indexOf(guessArr[i]);
    if (idx !== -1) {
      result[i] = 'present';
      answerArr[idx] = null;
    }
  }
  return result;
}

// Timer hesaplama fonksiyonu (sadece seviye)
const calculateTimer = (level) => {
  const baseTime = 60; // Tüm seviyeler için temel süre 60 sn
  const levelMultipliers = { A1: 1, A2: 1, B1: 1.2, B2: 1.2, C1: 1.4, C2: 1.4 };
  const multiplier = levelMultipliers[level] || 1;
  return Math.round(baseTime * multiplier);
};

export default function LingoGameScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { settings } = useGameSettings();
  const selectedLang = settings.lang;
  const selectedCat = settings.cat;
  const selectedLevel = settings.level;
  const selectedLangLabel = settings.langLabel;
  const selectedCatLabel = settings.catLabel;
  const selectedLevelLabel = settings.levelLabel;
  const [mockWord, setMockWord] = useState('');
  const [wordLoading, setWordLoading] = useState(true);
  const [guess, setGuess] = useState('');
  const [guesses, setGuesses] = useState([]); // [{word: 'APPLE', status: ['absent', ...]}]
  const [message, setMessage] = useState('');
  const [completed, setCompleted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [btnAnim, setBtnAnim] = useState(null);
  const { theme: themeMode } = useTheme();
  const systemScheme = useColorScheme();
  const isDark = themeMode === 'dark' || (themeMode === 'system' && systemScheme === 'dark');
  const theme = {
    background: isDark ? '#181825' : '#f8fafc',
    card: isDark ? '#232136' : '#fff',
    text: isDark ? '#fff' : '#222',
    accent: '#7C3AED',
    correct: '#22C55E',
    present: '#FACC15',
    absent: isDark ? '#444' : '#A3A3A3',
    fail: '#F87171',
    success: '#22C55E',
    inputBg: isDark ? '#232136' : '#fff',
    inputBorder: isDark ? '#a78bfa' : '#7C3AED',
  };
  const { addPoints } = useUser();
  const [streak, setStreak] = useState(0);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [showCongratsModal, setShowCongratsModal] = useState(false);
  const [congratsPoints, setCongratsPoints] = useState({ points: 0, newStreak: 0, details: {} });
  const [timeLeft, setTimeLeft] = useState(60);
  const [showTimeUpModal, setShowTimeUpModal] = useState(false);
  const [showFailModal, setShowFailModal] = useState(false);

  // Streak'i AsyncStorage'dan yükle
  useEffect(() => {
    const loadStreak = async () => {
      try {
        const savedStreak = await AsyncStorage.getItem('lingo_streak');
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
      await AsyncStorage.setItem('lingo_streak', newStreak.toString());
      setStreak(newStreak);
    } catch (error) {
      console.error('Streak kaydedilirken hata:', error);
    }
  };

  // Doğru tahmin sonrası puan ekleme
  useEffect(() => {
    if (completed && message.startsWith('Tebrikler')) {
      const { points, details } = calculatePoints(guesses.length, timeLeft);
      setEarnedPoints(points);
      addPoints(points);
      setCongratsPoints({ points, newStreak: streak, details });
      setShowCongratsModal(true);
    } else if (completed && message.startsWith('Bilemedin')) {
      setShowFailModal(true);
    }
  }, [completed, message]);

  const fetchWord = async () => {
    setWordLoading(true);
    setGuess('');
    setGuesses([]);
    setMessage('');
    setCompleted(false);
    try {
      const res = await api.get('/game-words', {
        params: {
          lang: selectedLang,
          cat: selectedCat,
          level: selectedLevel
        }
      });
      setMockWord(res.data.data.word);
    } catch (e) {
      setMockWord('');
      setMessage('Uygun kelime bulunamadı!');
    } finally {
      setWordLoading(false);
    }
  };

  useEffect(() => {
    fetchWord();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLang, selectedCat, selectedLevel]);

  const handleGuess = () => {
    let upperGuess, upperAnswer;
    upperGuess = normalizeTR(guess, selectedLang);
    upperAnswer = normalizeTR(mockWord, selectedLang);
    if (!guess || guess.length !== mockWord.length) {
      setMessage(`${mockWord.length} harfli bir kelime gir!`);
      return;
    }
    if (!/^[a-zA-ZğüşöçıİĞÜŞÖÇ]+$/.test(guess)) {
      setMessage('Sadece harf kullanabilirsin!');
      return;
    }
    if (guesses.some(g => g.word === upperGuess)) {
      setMessage('Bu tahmini zaten yaptın!');
      return;
    }
    const status = getLetterStatuses(upperGuess, upperAnswer);
    const newGuesses = [...guesses, { word: upperGuess, status }];
    setGuesses(newGuesses);
    if (upperGuess === upperAnswer) {
      setCompleted(true);
      setMessage('Tebrikler! Doğru bildin!');
      setShowConfetti(true);
    } else if (newGuesses.length >= MAX_ATTEMPTS) {
      setCompleted(true);
      setMessage(`Bilemedin! Doğru kelime: ${mockWord}`);
    } else {
      setMessage('');
    }
    setGuess('');
    Keyboard.dismiss();
  };

  const handleGuessWithAnim = () => {
    if (Platform.OS === 'web') {
      setBtnAnim('bounceIn');
    }
    handleGuess();
  };

  const restartGame = () => {
    fetchWord();
  };

  // Oyun bitince tebrik veya bilemedin mesajı
  const renderCongratsOrFail = () => {
    if (!completed) return null;
    if (message.startsWith('Bilemedin')) {
      return (
        <View style={styles.failBox} pointerEvents="none">
          <Text style={styles.failText}>Bilemedin! Doğru kelime: <Text style={styles.revealWord}>{normalizeTR(mockWord, selectedLang)}</Text></Text>
        </View>
      );
    }
    return null;
  };

  // Oyun başladığında timer başlat
  useEffect(() => {
    let timer;
    if (!completed && !wordLoading) {
      const initialTime = calculateTimer(selectedLevel);
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
  }, [wordLoading, completed, selectedLevel]);

  // Süreyi mm:ss formatında gösteren fonksiyon
  function formatTime(sec) {
    if (sec === null) return '--:--';
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  // Süre bittiğinde modalı aç
  useEffect(() => {
    if (timeLeft === 0 && !completed) {
      setShowTimeUpModal(true);
    } else {
      setShowTimeUpModal(false);
    }
  }, [timeLeft, completed]);

  // Puan hesaplama fonksiyonu (artık streak'e doğrudan erişiyor)
  const calculatePoints = (guessCount, timeLeft) => {
    const basePoint = 10;
    const timeBonus = timeLeft * 1; // Her saniye için +1 puan
    const mistakePenalty = (guessCount - 1) * 10; // ilk deneme hariç her yanlış için -10
    let streakBonus = 0;
    if (streak >= 10) streakBonus = 50;
    else if (streak >= 5) streakBonus = 25;
    else if (streak >= 3) streakBonus = 10;
    const levelMultipliers = { A1: 1, A2: 1, B1: 1.2, B2: 1.2, C1: 1.4, C2: 1.4 };
    const multiplier = levelMultipliers[selectedLevel] || 1;
    let firstTryBonus = 0;
    if (guessCount === 1) firstTryBonus = 20; // İlk denemede doğruysa ekstra 20 puan
    const total = Math.round((basePoint + timeBonus + firstTryBonus - mistakePenalty + streakBonus) * multiplier);
    return {
      points: total,
      details: {
        base: basePoint,
        timeBonus,
        firstTryBonus,
        mistakePenalty,
        streakBonus,
        multiplier
      }
    };
  };

  if (wordLoading) {
    return <View style={{flex:1,justifyContent:'center',alignItems:'center'}}><Text>Kelime yükleniyor...</Text></View>;
  }

  if (!mockWord) {
    return (
      <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
        <Text>Uygun kelime bulunamadı!</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {showConfetti && isWeb && (
        <ConfettiCannon
          count={80}
          origin={{ x: 0, y: 0 }}
          fadeOut={true}
          explosionSpeed={350}
          fallSpeed={3000}
          onAnimationEnd={() => setShowConfetti(false)}
        />
      )}
      <View style={{
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginTop: isWeb ? 32 : 32,
        marginBottom: 10,
      }}>
        <View style={{
          position: 'relative',
          backgroundColor: isDark ? '#232136' : '#fff',
          borderRadius: 16,
          paddingVertical: 4,
          paddingHorizontal: 18,
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 2,
          borderColor: '#7C3AED',
          shadowColor: '#7C3AED',
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 2,
          marginLeft: isWeb ? 675 : 24,
        }}>
          <MaterialIcons name="timer" size={22} color="#7C3AED" style={{marginRight: 6}} />
          <Text style={{fontWeight:'bold',fontSize:18,color:'#7C3AED',letterSpacing:1}}>{formatTime(timeLeft)}</Text>
        </View>
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
          marginLeft: isWeb ? 200 : 60,
        }}>
          <MaterialIcons name="star" size={26} color={isDark ? '#10B981' : '#FBBF24'} style={{marginRight: 6}} />
          <Text style={{fontWeight:'bold',fontSize:22,color: isDark ? '#10B981' : '#FBBF24',letterSpacing:1}}>{earnedPoints}</Text>
        </View>
      </View>
      <View style={[styles.bgCircle1, isDark && styles.bgCircle1Dark]} />
      <View style={[styles.bgCircle2, isDark && styles.bgCircle2Dark]} />
      <View style={[styles.bgCircle3, isDark && styles.bgCircle3Dark]} />
      <View style={styles.headerBox}>
        <TouchableOpacity style={styles.backIconBtn} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={28} color={theme.accent} />
        </TouchableOpacity>
        <View style={[styles.selectedInfoBox, { backgroundColor: theme.card }]}> 
          <Text style={[styles.selectedInfoText, { color: theme.text }]}>Dil: <Text style={[styles.selectedInfoValue, { color: theme.accent }]}>{selectedLangLabel}</Text></Text>
          <Text style={[styles.selectedInfoText, { color: theme.text }]}>Kategori: <Text style={[styles.selectedInfoValue, { color: '#F59E42' }]}>{selectedCatLabel}</Text></Text>
          <Text style={[styles.selectedInfoText, { color: theme.text }]}>Seviye: <Text style={[styles.selectedInfoValue, { color: theme.accent }]}>{selectedLevelLabel}</Text></Text>
        </View>
      </View>
      <Text style={[styles.desc, { color: theme.text }]}>{mockWord.length} harfli kelimeyi {MAX_ATTEMPTS} denemede bul!</Text>
      <Text style={[styles.attempts, { color: theme.accent }]}>Kalan deneme hakkı: {MAX_ATTEMPTS - guesses.length}</Text>
      <View style={styles.guessRows}>
        {[...Array(MAX_ATTEMPTS)].map((_, rowIdx) => (
          <View key={rowIdx} style={styles.wordRow}>
            {mockWord.split('').map((_, colIdx) => {
              const guessObj = guesses[rowIdx];
              const letter = guessObj ? guessObj.word[colIdx] : '';
              const status = guessObj ? guessObj.status[colIdx] : '';
              return (
                <View
                  key={colIdx}
                  style={[
                    styles.letterBox,
                    { 
                      backgroundColor: status ? theme[status] : theme.card,
                      borderColor: status ? theme[status] : theme.accent,
                      width: LETTER_BOX_SIZE,
                      height: LETTER_BOX_SIZE,
                    },
                  ]}
                >
                  <Text style={[
                    styles.letter,
                    { color: status === 'absent' ? (isDark ? '#888' : '#888') : '#fff' },
                  ]}>
                    {letter ? displayLetter(letter, selectedLang) : ''}
                  </Text>
                </View>
              );
            })}
          </View>
        ))}
      </View>
        <TextInput
          style={[
            styles.input,
            { 
              borderColor: theme.inputBorder,
              color: theme.text,
              backgroundColor: theme.inputBg
          },
          isWeb && { outlineWidth: 2, outlineColor: theme.accent }
          ]}
          value={guess}
          onChangeText={setGuess}
          maxLength={mockWord.length}
          autoCapitalize="characters"
        editable={true}
          placeholder="Tahminini yaz..."
          placeholderTextColor={isDark ? '#aaa' : '#888'}
          onSubmitEditing={handleGuess}
        autoFocus={isWeb}
        />
      <View style={styles.bottomArea}>
        {message && !(completed && (message.startsWith('Tebrikler') || message.startsWith('Bilemedin'))) ? (
          <Text style={
            message.startsWith('Tebrikler') ? [styles.successMsg, { color: theme.success }] :
            message.startsWith('Bilemedin') ? [styles.failMsg, { color: theme.fail }] :
            [styles.message, { color: theme.fail }]
          }>
            {message.startsWith('Bilemedin')
              ? <Text style={[styles.failMsg, { color: theme.fail }]}>Bilemedin! Doğru kelime: <Text style={styles.revealWord}>{normalizeTR(mockWord, selectedLang)}</Text></Text>
              : message}
          </Text>
        ) : null}
        <View style={styles.buttonContainer}>
          <View style={styles.restartBtnWrapper}>
            <TouchableOpacity 
              style={[styles.restartBtn, { backgroundColor: theme.accent }]} 
              onPress={restartGame}
            >
              <MaterialIcons name="refresh" size={20} color="#fff" />
              <Text style={styles.restartBtnText}>Yeniden Başlat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      {/* Tebrikler yazısı tamamen kaldırıldı */}
      {/* Oyun bitince grid ve inputun üstüne tıklamaları engelleyen overlay */}
      {completed && (
        <View style={{position:'absolute',top:0,left:0,right:0,bottom:0,zIndex:20}} pointerEvents="auto" />
      )}
      {/* Oyun bitince puan modalı */}
      {showCongratsModal && (
        <Modal
          visible={showCongratsModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowCongratsModal(false)}
        >
          <View style={{flex:1,justifyContent:'center',alignItems:'center',backgroundColor:'rgba(0,0,0,0.45)',zIndex:100}}>
            <View style={{
              backgroundColor: isDark ? '#232136' : '#fff',
              borderRadius:20,
              padding:32,
              alignItems:'center',
              maxWidth:360,
              shadowColor:'#000',
              shadowOpacity:0.15,
              shadowRadius:16,
              elevation:8
            }}>
              <Text style={{fontSize:24,fontWeight:'bold',color:'#FBBF24',marginBottom:12}}>Tebrikler! 🎉</Text>
              <Text style={{fontSize:18,color: isDark ? '#fff' : '#232136',marginBottom:18,textAlign:'center'}}>Doğru kelimeyi buldun!</Text>
              <Text style={{fontSize:16,color: isDark ? '#fff' : '#232136',marginBottom:8}}>Kazanılan Puanlar:</Text>
              <Text style={{fontSize:15,color: isDark ? '#fff' : '#232136',marginBottom:2}}>• Doğru Tahmin: {congratsPoints.details?.base || 0}</Text>
              <Text style={{fontSize:15,color: isDark ? '#fff' : '#232136',marginBottom:2}}>• Süre Bonusu: {congratsPoints.details?.timeBonus || 0}</Text>
              <Text style={{fontSize:15,color: isDark ? '#fff' : '#232136',marginBottom:10}}>• Streak Bonusu: {congratsPoints.details?.streakBonus || 0}</Text>
              <Text style={{fontSize:15,color: isDark ? '#fff' : '#232136',marginBottom:10}}>• Seviye Çarpanı: {congratsPoints.details?.multiplier || 1}</Text>
              <Text style={{fontSize:17,fontWeight:'bold',color: isDark ? '#a78bfa' : '#7C3AED',marginBottom:18}}>Toplam: {congratsPoints.points} puan</Text>
              <View style={{flexDirection:'row',gap:16,marginTop:8}}>
                <TouchableOpacity onPress={() => { setShowCongratsModal(false); restartGame(); }} style={{backgroundColor:'#7C3AED',paddingVertical:10,paddingHorizontal:22,borderRadius:10,marginRight:8}}>
                  <Text style={{color:'#fff',fontWeight:'bold',fontSize:16}}>Yeniden Başla</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setShowCongratsModal(false); router.back(); }} style={{backgroundColor:'#FBBF24',paddingVertical:10,paddingHorizontal:22,borderRadius:10}}>
                  <Text style={{color: isDark ? '#232136' : '#232136',fontWeight:'bold',fontSize:16}}>Ana Menü</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
      {/* Süre doldu modalı */}
      {showTimeUpModal && (
        <Modal
          visible={showTimeUpModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowTimeUpModal(false)}
        >
          <View style={{flex:1,justifyContent:'center',alignItems:'center',backgroundColor:'rgba(0,0,0,0.45)',zIndex:100}}>
            <View style={{
              backgroundColor: isDark ? '#232136' : '#fff',
              borderRadius:20,
              padding:32,
              alignItems:'center',
              maxWidth:360,
              shadowColor:'#000',
              shadowOpacity:0.15,
              shadowRadius:16,
              elevation:8
            }}>
              <Text style={{fontSize:24,fontWeight:'bold',color:'#F87171',marginBottom:12}}>Süre Doldu!</Text>
              <Text style={{fontSize:18,color: isDark ? '#fff' : '#232136',marginBottom:18,textAlign:'center'}}>Maalesef, süren doldu. Tekrar deneyebilirsin!</Text>
              <Text style={{fontSize:18,color: isDark ? '#fff' : '#232136',marginBottom:18,textAlign:'center'}}>Doğru kelime: <Text style={{color:'#7C3AED',fontWeight:'bold'}}>{normalizeTR(mockWord, selectedLang)}</Text></Text>
              <View style={{flexDirection:'row',gap:16,marginTop:8}}>
                <TouchableOpacity onPress={() => { setShowTimeUpModal(false); restartGame(); }} style={{backgroundColor:'#7C3AED',paddingVertical:10,paddingHorizontal:22,borderRadius:10,marginRight:8}}>
                  <Text style={{color:'#fff',fontWeight:'bold',fontSize:16}}>Yeniden Başla</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setShowTimeUpModal(false); router.back(); }} style={{backgroundColor:'#FBBF24',paddingVertical:10,paddingHorizontal:22,borderRadius:10}}>
                  <Text style={{color: isDark ? '#232136' : '#232136',fontWeight:'bold',fontSize:16}}>Ana Menü</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
      {/* Bilemedin modalı */}
      {showFailModal && (
        <Modal
          visible={showFailModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowFailModal(false)}
        >
          <View style={{flex:1,justifyContent:'center',alignItems:'center',backgroundColor:'rgba(0,0,0,0.45)',zIndex:100}}>
            <View style={{
              backgroundColor: isDark ? '#232136' : '#fff',
              borderRadius:20,
              padding:32,
              alignItems:'center',
              maxWidth:360,
              shadowColor:'#000',
              shadowOpacity:0.15,
              shadowRadius:16,
              elevation:8
            }}>
              <Text style={{fontSize:24,fontWeight:'bold',color:'#F87171',marginBottom:12}}>Bilemedin!</Text>
              <Text style={{fontSize:18,color: isDark ? '#fff' : '#232136',marginBottom:18,textAlign:'center'}}>Doğru kelime: <Text style={{color:'#7C3AED',fontWeight:'bold'}}>{normalizeTR(mockWord, selectedLang)}</Text></Text>
              <View style={{flexDirection:'row',gap:16,marginTop:8}}>
                <TouchableOpacity onPress={() => { setShowFailModal(false); restartGame(); }} style={{backgroundColor:'#7C3AED',paddingVertical:10,paddingHorizontal:22,borderRadius:10,marginRight:8}}>
                  <Text style={{color:'#fff',fontWeight:'bold',fontSize:16}}>Yeniden Başla</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setShowFailModal(false); router.back(); }} style={{backgroundColor:'#FBBF24',paddingVertical:10,paddingHorizontal:22,borderRadius:10}}>
                  <Text style={{color: isDark ? '#232136' : '#232136',fontWeight:'bold',fontSize:16}}>Ana Menü</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const boxBase = {
  width: 38, height: 38, borderRadius: 8, marginHorizontal: 4, alignItems: 'center', justifyContent: 'center', borderWidth: 2
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    ...(isWeb ? {} : { paddingTop: 24 }),
    position: 'relative',
    overflow: 'hidden',
  },
  bgCircle1: {
    position: 'absolute',
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: '#a78bfa33', // mor
    top: -80,
    left: -100,
    zIndex: 0,
  },
  bgCircle2: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#38bdf833', // mavi
    bottom: -60,
    right: -60,
    zIndex: 0,
  },
  bgCircle3: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#fbbf2433', // turuncu
    top: 120,
    right: -40,
    zIndex: 0,
  },
  bgCircle1Dark: {
    backgroundColor: '#7c3aed55',
  },
  bgCircle2Dark: {
    backgroundColor: '#2563eb55',
  },
  bgCircle3Dark: {
    backgroundColor: '#f59e4255',
  },
  headerBox: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
    ...(isWeb ? {} : { marginTop: 24 }),
  },
  headerBoxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  selectedInfoBox: {
    flexDirection: 'row',
    gap: 18,
    marginTop: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  selectedInfo: { flexDirection: 'row', gap: 18, marginBottom: 8, marginTop: 2 },
  selectedInfoText: { fontSize: 15, color: '#666' },
  selectedInfoValue: { color: '#4F46E5', fontWeight: 'bold' },
  title: {
    fontSize: isWeb ? 36 : 28,
    fontWeight: 'bold',
    color: '#7C3AED',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 1,
  },
  titleWithBack: {
    marginLeft: 8,
  },
  desc: {
    fontSize: isWeb ? 18 : 16,
    textAlign: 'center',
    marginBottom: 15,
    color: '#7C3AED',
    fontWeight: 'bold',
  },
  attempts: {
    fontSize: isWeb ? 16 : 14,
    textAlign: 'center',
    marginBottom: 25,
    fontWeight: 'bold',
    color: '#F59E42',
  },
  guessRows: { marginBottom: 18 },
  wordRow: { flexDirection: 'row', marginBottom: 14, justifyContent: 'center' },
  letterBox: {
    borderWidth: 2,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
    marginHorizontal: 8,
    marginVertical: 2,
    backgroundColor: '#fff',
  },
  letter: {
    fontSize: isWeb ? 28 : 24,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: '#0002',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  input: {
    borderWidth: 1, borderColor: '#4F46E5', borderRadius: 8,
    padding: Platform.OS === 'web' ? 10 : 8, fontSize: 18, width: 180, textAlign: 'center', marginBottom: 10
  },
  bottomArea: { marginTop: 24, alignItems: 'center', width: '100%' },
  guessBtn: {
    backgroundColor: '#4F46E5', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 32, marginBottom: 10
  },
  message: { fontSize: 15, color: '#FF6F91', marginVertical: 10, textAlign: 'center' },
  successMsg: { fontSize: 15, color: '#10B981', marginVertical: 10, textAlign: 'center', fontWeight: 'bold' },
  failMsg: { fontSize: 15, color: '#FF6F91', marginVertical: 10, textAlign: 'center', fontWeight: 'bold' },
  revealWord: { color: '#3B82F6', fontWeight: 'bold', fontSize: 20, marginLeft: 4 },
  backIconBtn: {
    position: 'absolute',
    left: isWeb ? 0 : -15,
    top: isWeb ? -16 : -75,
    padding: 8,
    zIndex: 10,
  },
  restartBtnWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  restartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4F46E5',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginRight: 0,
    borderWidth: 0,
    alignSelf: 'center',
  },
  restartBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 6
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 28,
    backgroundColor: '#7C3AED',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
    marginTop: 10,
  },
  retryBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 8,
  },
  congratsBox: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateY: -54 }],
    zIndex: 30,
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
  failBox: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateY: -54 }],
    zIndex: 30,
  },
  failText: {
    backgroundColor: '#F87171',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: isWeb ? 24 : 18,
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
}); 