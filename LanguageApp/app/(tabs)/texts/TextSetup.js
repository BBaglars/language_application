import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ActivityIndicator, ScrollView, Modal, FlatList } from 'react-native';
import api from '../../../api';
import Navbar from '../../../components/ui/Navbar';
import Sidebar from '../../../components/ui/Sidebar';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import { useColorScheme as useDeviceColorScheme } from 'react-native';
import { useTextSettings } from '../../../context/TextSettingsContext';
import { useRouter } from 'expo-router';

const LEVELS = [
  { label: 'A1', value: 'A1' },
  { label: 'A2', value: 'A2' },
  { label: 'B1', value: 'B1' },
  { label: 'B2', value: 'B2' },
  { label: 'C1', value: 'C1' },
  { label: 'C2', value: 'C2' },
];

const LENGTHS = [
  { label: 'Kısa', value: 'short' },
  { label: 'Orta', value: 'medium' },
  { label: 'Uzun', value: 'long' },
];

const STYLES = [
  { label: 'Resmi', value: 'formal' },
  { label: 'Günlük', value: 'casual' },
  { label: 'Yaratıcı', value: 'creative' },
  { label: 'Eğitici', value: 'educational' },
];

const PURPOSES = [
  { label: 'Bilgilendirici', value: 'informative' },
  { label: 'Eğitici', value: 'educational' },
  { label: 'Eğlendirici', value: 'entertaining' },
  { label: 'Motive Edici', value: 'motivational' },
];

const AGE_GROUPS = [
  { label: 'Çocuk', value: 'child' },
  { label: 'Genç', value: 'teen' },
  { label: 'Yetişkin', value: 'adult' },
];

const WORD_COUNTS = [
  { label: '5 kelime', value: 5 },
  { label: '10 kelime', value: 10 },
  { label: '15 kelime', value: 15 },
];

// Seçim Dropdown Bileşeni
const SelectComponent = ({ value, setValue, items, placeholder, open, setOpen, onOpen, zIndex, textColor, borderColor, dropdownBg, placeholderColor, dropdownOverlayBg }) => {
  const selectedObj = items.find(i => i.value === value);
  const selectedLabel = selectedObj ? selectedObj.label : placeholder;
  const isPlaceholder = !selectedObj;
  const maxHeight = Platform.OS === 'web' ? 44 * 7 : 44 * 5;
  
  return (
    <>
      <TouchableOpacity
        style={[styles.customDropdownButton, { borderColor }]}
        onPress={() => {
          setOpen(true);
          if (onOpen) onOpen();
        }}
        activeOpacity={0.85}
      >
        <Text style={[styles.customDropdownButtonText, isPlaceholder && { color: placeholderColor }, { color: textColor }]}>{selectedLabel}</Text>
        <MaterialIcons name="arrow-drop-down" size={22} color="#666" style={{ marginLeft: 4 }} />
      </TouchableOpacity>
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <TouchableOpacity
          style={[styles.customDropdownOverlay, { backgroundColor: dropdownOverlayBg }]}
          activeOpacity={1}
          onPressOut={() => setOpen(false)}
        >
          <View style={styles.customDropdownModal}>
            <FlatList
              data={items}
              keyExtractor={item => item.value}
              style={{ maxHeight }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.customDropdownItem, { borderColor }]}
                  onPress={() => {
                    setValue(item.value);
                    setOpen(false);
                  }}
                >
                  <Text style={[styles.customDropdownItemText, { color: textColor }]}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

// Satır Bileşeni
const SelectRow = ({ label, dropdownOverlayBg, ...props }) => (
  <View style={styles.selectRow}>
    <Text style={styles.selectLabel}>{label}:</Text>
    <SelectComponent {...props} dropdownOverlayBg={dropdownOverlayBg} />
  </View>
);

// Ana Bileşen
export default function TextSetup({ onStart = () => {}, onBack = () => {}, textType }) {
  const { updateSettings } = useTextSettings();
  const router = useRouter();
  const [languages, setLanguages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedLang, setSelectedLang] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [selectedLevel, setSelectedLevel] = useState(LEVELS[0].value);
  const [selectedLength, setSelectedLength] = useState(LENGTHS[0].value);
  const [selectedPurpose, setSelectedPurpose] = useState(PURPOSES[0].value);
  const [selectedAgeGroup, setSelectedAgeGroup] = useState(AGE_GROUPS[0].value);
  const getWordCountByLength = (length) => {
    if (length === 'short') return 5;
    if (length === 'medium') return 10;
    if (length === 'long') return 15;
    return 5;
  };
  const [selectedWordCount, setSelectedWordCount] = useState(getWordCountByLength(LENGTHS[0].value));
  const [loading, setLoading] = useState(true);
  const [langOpen, setLangOpen] = useState(false);
  const [levelOpen, setLevelOpen] = useState(false);
  const [lengthOpen, setLengthOpen] = useState(false);
  const [purposeOpen, setPurposeOpen] = useState(false);
  const [ageGroupOpen, setAgeGroupOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  
  const isWeb = Platform.OS === 'web';
  const { theme } = useTheme();
  const deviceColorScheme = useDeviceColorScheme();
  const colorScheme = theme === 'system' ? deviceColorScheme : theme;
  const isDark = colorScheme === 'dark';
  const mainBg = isDark ? '#181825' : '#f8fafc';
  const cardBg = isDark ? '#232136' : '#fff';
  const textColor = isDark ? '#fff' : '#222';
  const accent = '#7C3AED';
  const borderColor = isDark ? '#a78bfa' : '#7C3AED';
  const dropdownBg = isDark ? '#232136' : '#fff';
  const placeholderColor = isDark ? '#aaa' : '#aaa';
  const dropdownOverlayBg = isDark ? 'rgba(35,33,54,0.85)' : 'rgba(255,255,255,0.85)';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const langRes = await api.get(`/languages`);
      const catRes = await api.get(`/categories`);
      const langs = langRes.data.data?.languages?.map(l => ({ label: l.name, value: l.id.toString(), code: l.code })) || [];
      const cats = catRes.data.data?.categories?.map(c => ({ label: c.name, value: c.id.toString() })) || [];
      setLanguages(langs);
      setCategories(cats);
      setSelectedLang(langs[0]?.value || '');
      setSelectedCat(cats[0]?.value || '');
    } catch (e) {
      // Hata yönetimi
    } finally {
      setLoading(false);
    }
  };

  const handleStart = () => {
    const selectedLangObj = languages.find(l => l.value === selectedLang);
    const newSettings = {
      type: textType,
      lang: selectedLang,
      langCode: selectedLangObj?.code,
      langLabel: selectedLangObj?.label,
      cat: selectedCat,
      catLabel: categories.find(c => c.value === selectedCat)?.label,
      level: selectedLevel,
      levelLabel: LEVELS.find(l => l.value === selectedLevel)?.label,
      length: selectedLength,
      lengthLabel: LENGTHS.find(l => l.value === selectedLength)?.label,
      purpose: selectedPurpose,
      purposeLabel: PURPOSES.find(p => p.value === selectedPurpose)?.label,
      ageGroup: selectedAgeGroup,
      ageGroupLabel: AGE_GROUPS.find(a => a.value === selectedAgeGroup)?.label,
      wordCount: selectedWordCount,
      wordCountLabel: WORD_COUNTS.find(w => w.value === selectedWordCount)?.label,
    };
    updateSettings(newSettings);
    onStart(newSettings);
    router.back();
  };

  const handleBack = () => {
    router.back();
  };

  // Uzunluk değişince kelime sayısını otomatik ayarla
  React.useEffect(() => {
    setSelectedWordCount(getWordCountByLength(selectedLength));
  }, [selectedLength]);

  if (loading) {
    return <ActivityIndicator size="large" color="#4F46E5" style={styles.loader} />;
  }

  const renderContent = () => (
    <View style={[styles.centeredContainer, { backgroundColor: 'transparent' }]}>
      <View style={[styles.selectArea, { backgroundColor: cardBg, shadowColor: accent }]}>
        <Text style={[styles.title, { color: accent }]}>Metin Ayarları</Text>
        <Text style={[styles.desc, { color: '#F59E42' }]}>Metin üretmek için ayarları seç:</Text>
        
        <SelectRow
          label="Dil"
          value={selectedLang}
          setValue={setSelectedLang}
          items={languages}
          placeholder="Dil seç"
          open={langOpen}
          setOpen={setLangOpen}
          onOpen={() => { setLevelOpen(false); setLengthOpen(false); setPurposeOpen(false); setAgeGroupOpen(false); setCatOpen(false); }}
          zIndex={4000}
          textColor={accent}
          borderColor={borderColor}
          dropdownBg={dropdownBg}
          placeholderColor={placeholderColor}
          dropdownOverlayBg={dropdownOverlayBg}
        />
        
        <SelectRow
          label="Kategori"
          value={selectedCat}
          setValue={setSelectedCat}
          items={categories}
          placeholder="Kategori seç"
          open={catOpen}
          setOpen={setCatOpen}
          onOpen={() => { setLangOpen(false); setLevelOpen(false); setLengthOpen(false); setPurposeOpen(false); setAgeGroupOpen(false); }}
          zIndex={2500}
          textColor={accent}
          borderColor={borderColor}
          dropdownBg={dropdownBg}
          placeholderColor={placeholderColor}
          dropdownOverlayBg={dropdownOverlayBg}
        />
        
        <SelectRow
          label="Seviye"
          value={selectedLevel}
          setValue={setSelectedLevel}
          items={LEVELS}
          placeholder="Seviye seç"
          open={levelOpen}
          setOpen={setLevelOpen}
          onOpen={() => { setLangOpen(false); setLengthOpen(false); setPurposeOpen(false); setAgeGroupOpen(false); setCatOpen(false); }}
          zIndex={3000}
          textColor={accent}
          borderColor={borderColor}
          dropdownBg={dropdownBg}
          placeholderColor={placeholderColor}
          dropdownOverlayBg={dropdownOverlayBg}
        />
        
        <SelectRow
          label="Uzunluk"
          value={selectedLength}
          setValue={setSelectedLength}
          items={LENGTHS}
          placeholder="Uzunluk seç"
          open={lengthOpen}
          setOpen={setLengthOpen}
          onOpen={() => { setLangOpen(false); setLevelOpen(false); setPurposeOpen(false); setAgeGroupOpen(false); setCatOpen(false); }}
          zIndex={2000}
          textColor={accent}
          borderColor={borderColor}
          dropdownBg={dropdownBg}
          placeholderColor={placeholderColor}
          dropdownOverlayBg={dropdownOverlayBg}
        />
        
        <SelectRow
          label="Amaç"
          value={selectedPurpose}
          setValue={setSelectedPurpose}
          items={PURPOSES}
          placeholder="Amaç seç"
          open={purposeOpen}
          setOpen={setPurposeOpen}
          onOpen={() => { setLangOpen(false); setLevelOpen(false); setLengthOpen(false); setAgeGroupOpen(false); setCatOpen(false); }}
          zIndex={1500}
          textColor={accent}
          borderColor={borderColor}
          dropdownBg={dropdownBg}
          placeholderColor={placeholderColor}
          dropdownOverlayBg={dropdownOverlayBg}
        />
        
        <SelectRow
          label="Hedef Yaş Grubu"
          value={selectedAgeGroup}
          setValue={setSelectedAgeGroup}
          items={AGE_GROUPS}
          placeholder="Yaş grubu seç"
          open={ageGroupOpen}
          setOpen={setAgeGroupOpen}
          onOpen={() => { setLangOpen(false); setLevelOpen(false); setLengthOpen(false); setPurposeOpen(false); setCatOpen(false); }}
          zIndex={1200}
          textColor={accent}
          borderColor={borderColor}
          dropdownBg={dropdownBg}
          placeholderColor={placeholderColor}
          dropdownOverlayBg={dropdownOverlayBg}
        />

        <View style={{ marginTop: 8, marginBottom: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3f4f6', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 16, borderWidth: 2, borderColor: '#a78bfa', opacity: 0.7 }}>
            <Text style={{ fontWeight: 'bold', color: accent, width: 110, fontSize: 15 }}>Kelime Sayısı:</Text>
            <Text style={{ color: '#222', fontSize: 15, flex: 1 }}>{selectedWordCount}</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.backButton, { borderColor }]}
            onPress={handleBack}
          >
            <Text style={[styles.buttonText, { color: accent }]}>Geri</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.startButton, { backgroundColor: accent }]}
            onPress={handleStart}
          >
            <Text style={[styles.buttonText, { color: '#fff' }]}>Üret</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <>
      <Navbar />
      <View style={[styles.container, { backgroundColor: mainBg }]}>
        <View style={styles.content}>
          {isWeb && <Sidebar />}
          {renderContent()}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  selectArea: {
    width: '100%',
    maxWidth: 500,
    padding: 24,
    borderRadius: 20,
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  desc: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  selectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  selectLabel: {
    width: 80,
    fontSize: 16,
    color: '#666',
  },
  customDropdownButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: '#fff',
  },
  customDropdownButtonText: {
    fontSize: 16,
  },
  customDropdownOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customDropdownModal: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  customDropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  customDropdownItemText: {
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    borderWidth: 2,
  },
  startButton: {
    shadowColor: '#7C3AED',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 