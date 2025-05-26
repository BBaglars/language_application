import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform, Text, TouchableOpacity, Modal, FlatList, ScrollView, TouchableWithoutFeedback } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { useColorScheme } from 'react-native';
import Navbar from '../../../components/ui/Navbar';
import Sidebar from '../../../components/ui/Sidebar';
import Footer from '../../../components/ui/Footer';
import { useTextSettings } from '../../../context/TextSettingsContext';
import api from '../../../api';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

function ReadonlyDropdown({ label, value }) {
  return (
    <View style={styles.readonlyDropdown}>
      <Text style={styles.readonlyLabel}>{label}:</Text>
      <Text style={styles.readonlyValue}>{value || '-'}</Text>
    </View>
  );
}

// Kelimeyi normalize eden fonksiyon
function normalizeWord(word) {
  return word?.toLowerCase().replace(/[^a-zA-ZğüşöçıİĞÜŞÖÇ0-9]/g, '').trim();
}

export default function NewsGenerate() {
  const { theme } = useTheme();
  const deviceColorScheme = useColorScheme();
  const colorScheme = theme === 'system' ? deviceColorScheme : theme;
  const isDark = colorScheme === 'dark';
  const isWeb = Platform.OS === 'web';
  const { settings } = useTextSettings();
  const [storyTitle, setStoryTitle] = useState('Bir Haber');
  const [storyContent, setStoryContent] = useState('Bugün şehirde önemli bir etkinlik gerçekleşti. Birçok insan bu etkinliğe katıldı ve büyük ilgi gösterdi.');
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [showSettings, setShowSettings] = useState(true);
  const [meanings, setMeanings] = useState({});
  const [selectedWord, setSelectedWord] = useState(null);
  const [storyUsedWords, setStoryUsedWords] = useState([]);
  const router = useRouter();

  useEffect(() => {
    if (storyUsedWords && storyUsedWords.length > 0) {
      const ids = storyUsedWords.map(w => w.id);
      api.post('/words/meanings', { ids })
        .then(res => {
          const meaningsArr = res.data.data?.meanings || [];
          const map = {};
          meaningsArr.forEach(m => { map[normalizeWord(m.text)] = m.meaning; });
          setMeanings(map);
        })
        .catch(() => {
          setMeanings({});
        });
    }
  }, [storyUsedWords]);

  return (
    <>
      <Navbar />
      <TouchableOpacity
        style={[
          styles.backButton,
          isWeb ? styles.webBackButton : styles.mobileBackButton,
          { backgroundColor: isDark ? '#232136' : '#fff', borderColor: isDark ? '#a78bfa' : '#7C3AED' }
        ]}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={28} color={isDark ? '#a78bfa' : '#7C3AED'} />
      </TouchableOpacity>
      <LinearGradient
        colors={isDark ? ['#181825', '#232136', '#a78bfa22'] : ['#f8fafc', '#e0e7ff', '#a78bfa11']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1, position: 'relative' }}>
          {/* Arka plan daireleri */}
          {isWeb && <Sidebar />}
          <View style={[styles.mainContainer, { paddingTop: isWeb ? 32 : 0 }]}>
            {/* Ayarların readonly gösterimi */}
            {(showSettings || isWeb) && (
              <View style={[styles.readonlyContainer, isWeb ? styles.webReadonlyContainer : styles.mobileReadonlyContainer, { backgroundColor: isDark ? 'rgba(124,58,237,0.13)' : 'rgba(124,58,237,0.06)', borderColor: isDark ? '#a78bfa' : '#7C3AED', shadowColor: isDark ? '#fbbf24' : '#7C3AED' }]}>
                <ReadonlyDropdown label="Dil" value={settings.langLabel} />
                <ReadonlyDropdown label="Seviye" value={settings.levelLabel} />
                <ReadonlyDropdown label="Uzunluk" value={settings.lengthLabel} />
                <ReadonlyDropdown label="Amaç" value={settings.purposeLabel} />
                <ReadonlyDropdown label="Kategori" value={settings.catLabel} />
                <ReadonlyDropdown label="Tür" value="Haber" />
                <ReadonlyDropdown label="Hedef Yaş Grubu" value={settings.ageGroupLabel} />
                <ReadonlyDropdown label="Kelime Sayısı" value={settings.wordCountLabel || settings.wordCount} />
                {!isWeb && showSettings && (
                  <TouchableOpacity 
                    style={[styles.continueButton, { backgroundColor: isDark ? '#a78bfa' : '#7C3AED' }]}
                    onPress={() => setShowSettings(false)}
                  >
                    <Text style={[styles.continueButtonText, { color: isDark ? '#232136' : '#fff' }]}>Devam Et</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
            {/* Yapay zekadan gelecek metin alanı */}
            <View style={[
              styles.storyBox, 
              isWeb ? styles.webStoryBox : styles.mobileStoryBox, 
              { 
                backgroundColor: isDark ? '#232136' : '#fff', 
                shadowColor: isDark ? '#fbbf24' : '#7C3AED', 
                borderColor: isDark ? '#a78bfa' : '#7C3AED',
                ...(!showSettings && !isWeb && { position: 'absolute', top: '50%', left: '50%', transform: [{ translateX: -160 }, { translateY: -250 }] })
              }
            ]}>
              <Text style={[styles.storyTitle, { color: isDark ? '#a78bfa' : '#7C3AED' }]}>{storyTitle}</Text>
              <ScrollView style={styles.storyScroll} contentContainerStyle={{ paddingBottom: 16 }}>
                <Text style={[styles.storyContent, { 
                  color: isDark ? '#fff' : '#222', 
                  flexWrap: 'wrap',
                  fontSize: isWeb ? 16 : 18,
                  lineHeight: isWeb ? 24 : 28
                }]}>
                  {renderStoryContent(storyContent.replace(/\*\*/g, ''), storyUsedWords, meanings, setSelectedWord)}
                </Text>
              </ScrollView>
              {!generated && (
                <TouchableOpacity 
                  style={[styles.generateButton, { backgroundColor: isDark ? '#a78bfa' : '#7C3AED' }]} 
                  onPress={async () => {
                    setLoading(true);
                    try {
                      const response = await api.post('/generation/generate', {
                        language: settings.langCode,
                        difficultyLevel: settings.level,
                        type: 'news',
                        length: settings.length,
                        purpose: settings.purpose,
                        categoryId: Number(settings.cat),
                        wordCount: settings.wordCount,
                        ageGroup: settings.ageGroup
                      });
                      const data = response.data;
                      console.log('API yanıtı:', data);
                      setStoryTitle(data.data?.story?.title || 'Başlık');
                      setStoryContent(data.data?.story?.content || '');
                      setStoryUsedWords(data.data?.story?.usedWords || []);
                      setGenerated(true);
                    } catch (error) {
                      setStoryTitle('Hata');
                      setStoryContent('Metin üretilemedi.');
                      console.error('Error:', error);
                    } finally {
                      setLoading(false);
                    }
                  }} 
                  disabled={loading}
                >
                  <Text style={[styles.generateButtonText, { color: isDark ? '#232136' : '#fff' }]}>
                    {loading ? 'Üretiliyor...' : 'Üret'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
        {!isWeb && <Footer />}
      </LinearGradient>
      {/* Anlam modalı */}
      <Modal visible={!!selectedWord} transparent animationType="fade" onRequestClose={() => setSelectedWord(null)}>
        <TouchableWithoutFeedback onPress={() => setSelectedWord(null)}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0008' }}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={{ 
                backgroundColor: isDark ? '#232136' : '#fff', 
                padding: isWeb ? 24 : 32, 
                borderRadius: 12, 
                minWidth: isWeb ? 220 : 280 
              }}>
                <Text style={{ 
                  fontWeight: 'bold', 
                  fontSize: isWeb ? 18 : 22, 
                  color: isDark ? '#a78bfa' : '#7C3AED', 
                  textAlign: 'center' 
                }}>{selectedWord}</Text>
                {(() => {
                  const wordKey = normalizeWord(selectedWord);
                  const meaning = meanings[wordKey] || 'Anlamı bulunamadı.';
                  return (
                    <Text style={{ 
                      marginTop: 8, 
                      color: isDark ? '#fff' : '#222', 
                      textAlign: 'center',
                      fontSize: isWeb ? 16 : 18
                    }}>{meaning}</Text>
                  );
                })()}
                <TouchableOpacity onPress={() => setSelectedWord(null)} style={{ marginTop: 16, alignSelf: 'center' }}>
                  <Text style={{ 
                    color: isDark ? '#a78bfa' : '#7C3AED', 
                    fontWeight: 'bold',
                    fontSize: isWeb ? 16 : 18
                  }}>Kapat</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  readonlyContainer: {
    position: 'absolute',
    top: -600,
    left: 250,
    width: 320,
    backgroundColor: 'rgba(124,58,237,0.06)',
    borderRadius: 18,
    padding: 24,
    shadowColor: '#7C3AED',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    gap: 14,
  },
  readonlyDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 6,
    opacity: 0.7,
  },
  readonlyLabel: {
    fontWeight: 'bold',
    color: '#7C3AED',
    width: 90,
    fontSize: 15,
  },
  readonlyValue: {
    color: '#222',
    fontSize: 15,
    flex: 1,
  },
  selectContainer: {
    marginTop: 32,
    alignSelf: 'center',
    width: 320,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    shadowColor: '#7C3AED',
    shadowOpacity: 0.10,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    gap: 16,
  },
  selectDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#a78bfa',
  },
  selectLabel: {
    fontWeight: 'bold',
    color: '#7C3AED',
    width: 110,
    fontSize: 15,
  },
  selectValue: {
    color: '#222',
    fontSize: 15,
    flex: 1,
  },
  dropdownOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  dropdownModal: {
    width: 260,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  dropdownItem: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#7C3AED',
  },
  storyBox: {
    position: 'absolute',
    top: -600,
    left: 300,
    width: 360,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 24,
    shadowColor: '#7C3AED',
    shadowOpacity: 0.10,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    marginBottom: 12,
    height: 500,
  },
  storyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#7C3AED',
    marginBottom: 16,
    textAlign: 'center',
    alignSelf: 'center',
  },
  storyScroll: {
    maxHeight: 500,
    minHeight: 200,
    alignSelf: 'center',
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  storyContent: {
    fontSize: 16,
    color: '#222',
    lineHeight: 24,
    textAlign: 'center',
    alignSelf: 'center',
    paddingHorizontal: 8,
  },
  generateButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    width: '100%',
  },
  generateButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  mainContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  webReadonlyContainer: {
    position: 'absolute',
    top: -680,
    left: 300,
    width: 320,
  },
  mobileReadonlyContainer: {
    width: '90%',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -160 }, { translateY: -300 }],
    marginTop: 0,
    marginBottom: 0,
  },
  webStoryBox: {
    position: 'absolute',
    top: -680,
    left: 350,
    width: 360,
    marginLeft: 500,
  },
  mobileStoryBox: {
    width: '90%',
    marginBottom: 20,
  },
  backButton: {
    position: 'absolute',
    zIndex: 10,
    borderRadius: 20,
    padding: 6,
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
  },
  webBackButton: {
    top: 120,
    left: 280,
  },
  mobileBackButton: {
    top: 110,
    left: 20,
  },
  continueButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    width: '100%',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

// Metni parçalayıp tıklanabilir kelimeler oluşturan fonksiyon
function renderStoryContent(content, usedWords, meanings, onWordPress) {
  if (!content || !usedWords || usedWords.length === 0) return content;
  const wordList = usedWords.map(w => w.text);
  const normalizedWordList = usedWords.map(w => normalizeWord(w.text));
  const regex = new RegExp(`(${wordList.join('|')})`, 'gi');
  const parts = content.split(regex);
  const isWeb = Platform.OS === 'web';
  const fontSize = isWeb ? 16 : 18;
  const lineHeight = isWeb ? 24 : 28;
  return parts.map((part, i) => {
    if (normalizedWordList.includes(normalizeWord(part))) {
      return (
        <Text
          key={i}
          onPress={() => onWordPress(part)}
          style={{ fontWeight: 'bold', color: '#7C3AED', textDecorationLine: 'underline', fontSize, lineHeight }}
        >
          {part}
        </Text>
      );
    }
    return <Text key={i} style={{ fontSize, lineHeight }}>{part}</Text>;
  });
} 