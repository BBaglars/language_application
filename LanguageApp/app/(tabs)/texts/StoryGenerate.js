import React, { useState } from 'react';
import { View, StyleSheet, Platform, Text, TouchableOpacity, Modal, FlatList, ScrollView } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import Navbar from '../../../components/ui/Navbar';
import Sidebar from '../../../components/ui/Sidebar';
import Footer from '../../../components/ui/Footer';
import { useTextSettings } from '../../../context/TextSettingsContext';
import api from '../../../api';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

function ReadonlyDropdown({ label, value }) {
  return (
    <View style={styles.readonlyDropdown}>
      <Text style={styles.readonlyLabel}>{label}:</Text>
      <Text style={styles.readonlyValue}>{value || '-'}</Text>
    </View>
  );
}

export default function StoryGenerate() {
  const { theme } = useTheme();
  const isWeb = Platform.OS === 'web';
  const isDark = theme === 'dark';
  const { settings } = useTextSettings();
  const [storyTitle, setStoryTitle] = useState('Bir Günlük Macera');
  const [storyContent, setStoryContent] = useState('Ali sabah erkenden uyandı. Bugün çok heyecanlıydı çünkü okulda hikaye yarışması vardı. Annesi ona güzel bir kahvaltı hazırladı. Ali, en sevdiği kalemini alıp okula koştu...');
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const router = useRouter();

  return (
    <>
      <Navbar />
      <TouchableOpacity
        style={{ position: 'absolute', top: 90, left: 250, zIndex: 10, backgroundColor: isDark ? '#232136' : '#fff', borderRadius: 20, padding: 6, shadowColor: isDark ? '#fbbf24' : '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2, borderWidth: 1, borderColor: isDark ? '#a78bfa' : '#7C3AED' }}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={28} color={isDark ? '#a78bfa' : '#7C3AED'} />
      </TouchableOpacity>
      <View style={{ flex: 1, backgroundColor: isDark ? '#181825' : '#f8fafc' }}>
        <View style={{ flex: 1, position: 'relative' }}>
          {/* Arka plan daireleri */}
          <View style={[styles.bgCircle1, isDark && styles.bgCircle1Dark]} />
          <View style={[styles.bgCircle2, isDark && styles.bgCircle2Dark]} />
          {isWeb && <Sidebar />}
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: isWeb ? 32 : 0 }}>
            {/* Ayarların readonly gösterimi */}
            <View style={[styles.readonlyContainer, { backgroundColor: isDark ? 'rgba(124,58,237,0.13)' : 'rgba(124,58,237,0.06)', borderColor: isDark ? '#a78bfa' : '#7C3AED', shadowColor: isDark ? '#fbbf24' : '#7C3AED' }] }>
              <ReadonlyDropdown label="Dil" value={settings.langLabel} />
              <ReadonlyDropdown label="Seviye" value={settings.levelLabel} />
              <ReadonlyDropdown label="Uzunluk" value={settings.lengthLabel} />
              <ReadonlyDropdown label="Amaç" value={settings.purposeLabel} />
              <ReadonlyDropdown label="Kategori" value={settings.catLabel} />
              <ReadonlyDropdown label="Tür" value="Hikaye" />
              <ReadonlyDropdown label="Hedef Yaş Grubu" value={settings.ageGroupLabel} />
              <ReadonlyDropdown label="Kelime Sayısı" value={settings.wordCountLabel || settings.wordCount} />
            </View>
            {/* Yapay zekadan gelecek metin alanı */}
            <View style={[styles.storyBox, { marginLeft: 500, backgroundColor: isDark ? '#232136' : '#fff', shadowColor: isDark ? '#fbbf24' : '#7C3AED', borderColor: isDark ? '#a78bfa' : '#7C3AED' }]}>
              <Text style={[styles.storyTitle, { color: isDark ? '#a78bfa' : '#7C3AED' }]}>{storyTitle}</Text>
              <ScrollView style={styles.storyScroll} contentContainerStyle={{ paddingBottom: 16 }}>
                <Text style={[styles.storyContent, { color: isDark ? '#fff' : '#222' }]}>{storyContent}</Text>
              </ScrollView>
              {!generated && (
                <TouchableOpacity style={[styles.generateButton, { backgroundColor: isDark ? '#a78bfa' : '#7C3AED' }]} onPress={async () => {
                  setLoading(true);
                  try {
                    const response = await api.post('/generation/generate', {
                      language: settings.langCode,
                      difficultyLevel: settings.level,
                      type: settings.type,
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
                    setGenerated(true);
                  } catch (error) {
                    setStoryTitle('Hata');
                    setStoryContent('Metin üretilemedi.');
                    console.error('Error:', error);
                  } finally {
                    setLoading(false);
                  }
                }} disabled={loading}>
                  <Text style={[styles.generateButtonText, { color: isDark ? '#232136' : '#fff' }]}>{loading ? 'Üretiliyor...' : 'Üret'}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
        {!isWeb && <Footer />}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  bgCircle1: {
    position: 'absolute',
    width: 340,
    height: 340,
    borderRadius: 170,
    top: -80,
    right: 40,
    zIndex: 0,
    backgroundColor: '#a78bfa33',
  },
  bgCircle1Dark: {
    backgroundColor: '#fbbf24aa',
  },
  bgCircle2: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    bottom: -60,
    left: 100,
    zIndex: 0,
    backgroundColor: '#f472b633',
  },
  bgCircle2Dark: {
    backgroundColor: '#fde68aaa',
  },
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
    backgroundColor: '#7C3AED',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  generateButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
}); 