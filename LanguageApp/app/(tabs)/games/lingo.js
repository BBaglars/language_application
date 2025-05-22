import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Keyboard, Platform, useColorScheme, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import ConfettiCannon from 'react-native-confetti-cannon';
import * as Animatable from 'react-native-animatable';
import { useTheme } from '../../../context/ThemeContext';
import api from '../../../api';
import { MaterialIcons } from '@expo/vector-icons';
import { useGameSettings } from '../../../context/GameSettingsContext';

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
      <View style={[styles.bgCircle1, isDark && styles.bgCircle1Dark]} />
      <View style={[styles.bgCircle2, isDark && styles.bgCircle2Dark]} />
      <View style={[styles.bgCircle3, isDark && styles.bgCircle3Dark]} />
      <View style={styles.headerBox}>
        <TouchableOpacity style={styles.backIconBtn} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={28} color={theme.accent} />
        </TouchableOpacity>
        <Text style={[styles.title, !isWeb && styles.titleWithBack]}>
          Lingo Oyunu
        </Text>
        <View style={[styles.selectedInfoBox, { backgroundColor: theme.card }]}> 
          <Text style={[styles.selectedInfoText, { color: theme.text }]}>Dil: <Text style={[styles.selectedInfoValue, { color: theme.accent }]}>{selectedLangLabel}</Text></Text>
          <Text style={[styles.selectedInfoText, { color: theme.text }]}>Kategori: <Text style={[styles.selectedInfoValue, { color: theme.accent }]}>{selectedCatLabel}</Text></Text>
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
      {!completed && (
        <TextInput
          style={[
            styles.input,
            { 
              borderColor: theme.inputBorder,
              color: theme.text,
              backgroundColor: theme.inputBg
            }
          ]}
          value={guess}
          onChangeText={setGuess}
          maxLength={mockWord.length}
          autoCapitalize="characters"
          editable={!completed}
          placeholder="Tahminini yaz..."
          placeholderTextColor={isDark ? '#aaa' : '#888'}
          onSubmitEditing={handleGuess}
        />
      )}
      <View style={styles.bottomArea}>
        {message ? (
          <Text style={
            message.startsWith('Tebrikler') ? [styles.successMsg, { color: theme.success }] :
            message.startsWith('Bilemedin') ? [styles.failMsg, { color: theme.fail }] :
            [styles.message, { color: theme.fail }]
          }>
            {message.startsWith('Bilemedin')
              ? <Text style={[styles.failMsg, { color: theme.fail }]}>Bilemedin! Doğru kelime: <Text style={styles.revealWord}>{selectedLang === 'tr' ? mockWord.toLocaleUpperCase('tr-TR') : mockWord.toUpperCase()}</Text></Text>
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
    left: 0,
    top: 0,
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
}); 