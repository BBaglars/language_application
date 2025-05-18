import React, { useState, useEffect, lazy } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Keyboard, Platform, useColorScheme } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import ConfettiCannon from 'react-native-confetti-cannon';
import * as Animatable from 'react-native-animatable';
import { useTheme } from '../../../context/ThemeContext';

const MOCK_WORDS = {
  en: 'HEIST',
  tr: 'CANİP',
};
const MAX_ATTEMPTS = 5;

const BadgePopup = lazy(() => import('../../../components/ui/BadgePopup'));

function getLocale(lang) {
  return lang === 'tr' ? 'tr-TR' : 'en-US';
}

function normalizeTR(str) {
  return str
    .replace(/i/g, 'İ')
    .replace(/ı/g, 'I')
    .toUpperCase('tr-TR');
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
  const selectedLang = params.lang || 'en';
  const selectedCat = params.cat || 1;
  const selectedLevel = params.level || 'A1';
  const selectedLangLabel = params.langLabel || '';
  const selectedCatLabel = params.catLabel || '';
  const selectedLevelLabel = params.levelLabel || '';
  const [mockWord, setMockWord] = useState(MOCK_WORDS[selectedLang] || MOCK_WORDS['en']);
  const [guess, setGuess] = useState('');
  const [guesses, setGuesses] = useState([]); // [{word: 'APPLE', status: ['absent', ...]}]
  const [message, setMessage] = useState('');
  const [completed, setCompleted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showBadge, setShowBadge] = useState(false);
  const [btnAnim, setBtnAnim] = useState(null);
  const { theme: themeMode } = useTheme();
  const systemScheme = useColorScheme();
  const isDark = themeMode === 'dark' || (themeMode === 'system' && systemScheme === 'dark');
  const theme = {
    background: isDark ? '#18181b' : '#fff',
    card: isDark ? '#27272a' : '#f3f4f6',
    text: isDark ? '#fff' : '#222',
    accent: '#4F46E5',
    correct: '#10B981',
    present: '#FFD600',
    absent: isDark ? '#444' : '#e5e7eb',
    fail: '#FF6F91',
    success: '#10B981',
  };

  useEffect(() => {
    setMockWord(MOCK_WORDS[selectedLang] || MOCK_WORDS['en']);
    setGuess('');
    setGuesses([]);
    setMessage('');
    setCompleted(false);
  }, [selectedLang, selectedCat, selectedLevel]);

  const handleGuess = () => {
    let upperGuess, upperAnswer;
    if (selectedLang === 'tr') {
      upperGuess = normalizeTR(guess);
      upperAnswer = normalizeTR(mockWord);
    } else {
      upperGuess = guess.toUpperCase('en-US');
      upperAnswer = mockWord.toUpperCase('en-US');
    }
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
      setShowBadge(true);
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

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {showConfetti && Platform.OS === 'web' && (
        <ConfettiCannon
          count={80}
          origin={{ x: 0, y: 0 }}
          fadeOut={true}
          explosionSpeed={350}
          fallSpeed={3000}
          onAnimationEnd={() => setShowConfetti(false)}
        />
      )}
      <Text style={[styles.title, { color: theme.accent }]}>Lingo (Wordle) Oyunu</Text>
      <Text style={[styles.desc, { color: theme.text }]}>{mockWord.length} harfli kelimeyi {MAX_ATTEMPTS} denemede bul!</Text>
      <View style={styles.selectedInfo}>
        <Text style={[styles.selectedInfoText, { color: theme.text }]}>Dil: <Text style={styles.selectedInfoValue}>{selectedLangLabel}</Text></Text>
        <Text style={[styles.selectedInfoText, { color: theme.text }]}>Kategori: <Text style={styles.selectedInfoValue}>{selectedCatLabel}</Text></Text>
        <Text style={[styles.selectedInfoText, { color: theme.text }]}>Seviye: <Text style={styles.selectedInfoValue}>{selectedLevelLabel}</Text></Text>
      </View>
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
                    { backgroundColor: status ? theme[status] : theme.card, borderColor: status ? theme[status] : theme.accent },
                  ]}
                >
                  <Text style={[
                    styles.letter,
                    { color: status === 'absent' ? (isDark ? '#888' : '#888') : '#fff' },
                  ]}> {letter || ''} </Text>
                </View>
              );
            })}
          </View>
        ))}
      </View>
      {!completed && (
        <>
          <TextInput
            style={[styles.input, { borderColor: theme.accent, color: theme.text, backgroundColor: isDark ? '#23232b' : '#fff' }]}
            value={guess}
            onChangeText={setGuess}
            maxLength={mockWord.length}
            autoCapitalize="characters"
            editable={!completed}
            placeholder="Tahminini yaz..."
            placeholderTextColor={isDark ? '#aaa' : '#888'}
            onSubmitEditing={handleGuessWithAnim}
          />
          {Platform.OS === 'web' ? (
            <Animatable.View animation={btnAnim} onAnimationEnd={() => setBtnAnim(null)}>
              <TouchableOpacity style={styles.guessBtn} onPress={handleGuessWithAnim}>
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Tahmin Et</Text>
              </TouchableOpacity>
            </Animatable.View>
          ) : (
            <TouchableOpacity style={styles.guessBtn} onPress={handleGuess}>
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Tahmin Et</Text>
            </TouchableOpacity>
          )}
        </>
      )}
      {message ? (
        <Text style={
          message.startsWith('Tebrikler') ? [styles.successMsg, { color: theme.success }] :
          message.startsWith('Bilemedin') ? [styles.failMsg, { color: theme.fail }] :
          [styles.message, { color: theme.fail }]
        }>
          {message.startsWith('Bilemedin')
            ? <>Bilemedin! Doğru kelime: <Text style={styles.revealWord}>{mockWord}</Text></>
            : message}
        </Text>
      ) : null}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={{ color: theme.accent, fontWeight: 'bold' }}>← Ana Sayfa</Text>
      </TouchableOpacity>
      {showBadge && (
        <React.Suspense fallback={null}>
          <BadgePopup
            visible={showBadge}
            onClose={() => setShowBadge(false)}
            theme={theme}
          />
        </React.Suspense>
      )}
    </View>
  );
}

const boxBase = {
  width: 38, height: 38, borderRadius: 8, marginHorizontal: 4, alignItems: 'center', justifyContent: 'center', borderWidth: 2
};
const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  selectedInfo: { flexDirection: 'row', gap: 18, marginBottom: 8, marginTop: 2 },
  selectedInfoText: { fontSize: 15, color: '#666' },
  selectedInfoValue: { color: '#4F46E5', fontWeight: 'bold' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#4F46E5', marginBottom: 8 },
  desc: { fontSize: 16, color: '#666', marginBottom: 18 },
  attempts: { fontSize: 15, color: '#4F46E5', marginBottom: 8, fontWeight: 'bold' },
  guessRows: { marginBottom: 18 },
  wordRow: { flexDirection: 'row', marginBottom: 8 },
  letterBox: { ...boxBase, borderColor: '#4F46E5' },
  letter: { fontSize: 22, fontWeight: 'bold', color: '#4F46E5' },
  input: {
    borderWidth: 1, borderColor: '#4F46E5', borderRadius: 8,
    padding: Platform.OS === 'web' ? 10 : 8, fontSize: 18, width: 180, textAlign: 'center', marginBottom: 10
  },
  guessBtn: {
    backgroundColor: '#4F46E5', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 32, marginBottom: 10
  },
  message: { fontSize: 15, color: '#FF6F91', marginVertical: 6, textAlign: 'center' },
  successMsg: { fontSize: 15, color: '#10B981', marginVertical: 6, textAlign: 'center', fontWeight: 'bold' },
  failMsg: { fontSize: 15, color: '#FF6F91', marginVertical: 6, textAlign: 'center', fontWeight: 'bold' },
  revealWord: { color: '#4F46E5', fontWeight: 'bold', fontSize: 16 },
  backBtn: { marginTop: 24, padding: 8 },
  badgePopup: {
    position: 'absolute', top: '40%', left: 0, right: 0, alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 24, elevation: 8, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 12,
  },
  badgeEmoji: { fontSize: 48, marginBottom: 8 },
  badgeText: { fontSize: 18, fontWeight: 'bold', color: '#4F46E5', marginBottom: 12, textAlign: 'center' },
  badgeBtn: { backgroundColor: '#4F46E5', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 24, marginTop: 8 },
}); 