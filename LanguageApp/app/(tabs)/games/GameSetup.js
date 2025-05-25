import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ActivityIndicator, ScrollView, Modal, FlatList } from 'react-native';
import api from '../../../api';
import Navbar from '../../../components/ui/Navbar';
import Sidebar from '../../../components/ui/Sidebar';
import { MaterialIcons } from '@expo/vector-icons';
import { useGameSettings } from '../../../context/GameSettingsContext';
import { useTheme } from '../../../context/ThemeContext';
import { useColorScheme as useDeviceColorScheme } from 'react-native';

const LEVELS = [
  { label: 'A1', value: 'A1' },
  { label: 'A2', value: 'A2' },
  { label: 'B1', value: 'B1' },
  { label: 'B2', value: 'B2' },
  { label: 'C1', value: 'C1' },
  { label: 'C2', value: 'C2' },
];

// Seçim Dropdown Bileşeni
const SelectComponent = ({ value, setValue, items, placeholder, open, setOpen, onOpen, zIndex, textColor, borderColor, dropdownBg, placeholderColor, dropdownOverlayBg }) => {
  const selectedObj = items.find(i => i.value === value);
  const selectedLabel = selectedObj ? selectedObj.label : placeholder;
  const isPlaceholder = !selectedObj;
  // Webde 7, mobilde 5 seçenek kadar yükseklik
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
export default function GameSetup({ onStart, onBack }) {
  const [languages, setLanguages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedLang, setSelectedLang] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [selectedLevel, setSelectedLevel] = useState(LEVELS[0].value);
  const [loading, setLoading] = useState(true);
  const [langOpen, setLangOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [levelOpen, setLevelOpen] = useState(false);
  const isWeb = Platform.OS === 'web';
  const { updateSettings } = useGameSettings();
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
      const [langRes, catRes] = await Promise.all([
        api.get(`/languages`),
        api.get(`/categories`)
      ]);
      const langs = langRes.data.data?.languages?.map(l => ({ label: l.name, value: l.id.toString() })) || [];
      const catsFromDb = catRes.data.data?.categories?.map(c => ({ label: c.name, value: c.id.toString() })) || [];
      const allCategoryOption = { label: 'Genel', value: 'all' };
      const cats = [allCategoryOption, ...catsFromDb];
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
    const newSettings = {
      lang: selectedLang,
      langLabel: languages.find(l => l.value === selectedLang)?.label,
      cat: selectedCat,
      catLabel: categories.find(c => c.value === selectedCat)?.label,
      level: selectedLevel,
      levelLabel: LEVELS.find(l => l.value === selectedLevel)?.label
    };
    updateSettings(newSettings);
    onStart(newSettings);
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#4F46E5" style={styles.loader} />;
  }

  const renderContent = () => (
    <View style={[styles.centeredContainer, { backgroundColor: 'transparent' }]}>
      <View style={[styles.selectArea, { backgroundColor: cardBg, shadowColor: accent }]}>
        <Text style={[styles.title, { color: accent }]}>Oyun Ayarları</Text>
        <Text style={[styles.desc, { color: '#F59E42' }]}>Oynamak istediğin dili, kategoriyi ve seviyeyi seç:</Text>
        <SelectRow
          label="Dil"
          value={selectedLang}
          setValue={setSelectedLang}
          items={languages}
          placeholder="Dil seç"
          open={langOpen}
          setOpen={setLangOpen}
          onOpen={() => { setCatOpen(false); setLevelOpen(false); }}
          zIndex={3000}
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
          onOpen={() => { setLangOpen(false); setLevelOpen(false); }}
          zIndex={2000}
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
          onOpen={() => { setLangOpen(false); setCatOpen(false); }}
          zIndex={1000}
          textColor={accent}
          borderColor={borderColor}
          dropdownBg={dropdownBg}
          placeholderColor={placeholderColor}
          dropdownOverlayBg={dropdownOverlayBg}
        />
        <TouchableOpacity style={[styles.startBtn, { backgroundColor: accent }]} onPress={handleStart}>
          <Text style={styles.startBtnText}>Başla</Text>
        </TouchableOpacity>
        {onBack && (
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <MaterialIcons name="arrow-back" size={22} color={accent} style={{ marginRight: 4 }} />
            <Text style={[styles.backBtnText, { color: accent }]}>Geri Dön</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <>
      <Navbar />
      <View style={[styles.container, { backgroundColor: mainBg, position: 'relative' }]}>
        {/* Arka plan daireleri */}
        <View style={[styles.bgCircle1, isDark && styles.bgCircle1Dark]} />
        <View style={[styles.bgCircle2, isDark && styles.bgCircle2Dark]} />
        {isWeb && <Sidebar />}
        {isWeb ? (
          <ScrollView style={[styles.scrollView, { backgroundColor: 'transparent' }]} contentContainerStyle={styles.scrollViewContent}>
            {renderContent()}
          </ScrollView>
        ) : (
          <View style={[styles.mobileContainer, { backgroundColor: 'transparent' }]}>
            {renderContent()}
          </View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    width: '100%',
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollViewContent: {
    minHeight: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  selectArea: {
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 360 : 300,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: Platform.OS === 'web' ? 28 : 16,
    marginBottom: 18,
    alignItems: 'center',
    shadowColor: '#7C3AED',
    shadowOpacity: 0.10,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  selectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },
  selectLabel: {
    width: 80,
    fontSize: 16,
    color: '#7C3AED',
    fontWeight: 'bold',
  },
  webSelect: {
    flex: 1,
    height: 40,
    padding: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#7C3AED',
    backgroundColor: '#f8fafc',
    fontSize: 16,
    color: '#222',
    outline: 'none',
    fontWeight: 'bold',
  },
  customDropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minHeight: 40,
    borderWidth: 2,
    borderColor: '#7C3AED',
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginLeft: 8,
    fontWeight: 'bold',
  },
  customDropdownButtonText: {
    color: '#7C3AED',
    fontSize: Platform.OS === 'web' ? 16 : 14,
    flex: 1,
    fontWeight: 'bold',
  },
  placeholderText: {
    color: '#aaa',
    fontWeight: 'normal',
  },
  customDropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  customDropdownModal: {
    width: 240,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 10,
    elevation: 10,
  },
  customDropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  customDropdownItemText: {
    fontSize: Platform.OS === 'web' ? 16 : 14,
    color: '#7C3AED',
    fontWeight: 'bold',
  },
  startBtn: {
    backgroundColor: '#7C3AED',
    borderRadius: 10,
    paddingVertical: Platform.OS === 'web' ? 14 : 10,
    paddingHorizontal: Platform.OS === 'web' ? 38 : 24,
    marginTop: 16,
    alignSelf: 'center',
    shadowColor: '#7C3AED',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  startBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: Platform.OS === 'web' ? 18 : 15,
  },
  backBtn: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 0,
    backgroundColor: 'transparent',
    borderRadius: 0,
  },
  backBtnText: {
    color: '#7C3AED',
    fontWeight: 'bold',
    fontSize: Platform.OS === 'web' ? 16 : 13,
  },
  title: {
    fontSize: Platform.OS === 'web' ? 28 : 22,
    fontWeight: 'bold',
    color: '#7C3AED',
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: 1,
  },
  desc: {
    fontSize: Platform.OS === 'web' ? 17 : 14,
    color: '#F59E42',
    marginBottom: 18,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  loader: {
    marginTop: 40,
  },
  bgCircle1: {
    position: 'absolute',
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: '#fde68a55', // sarı
    top: -80,
    left: Platform.OS === 'web' ? 60 : -100,
    zIndex: 0,
  },
  bgCircle2: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#fbbf2433', // turuncu
    bottom: -60,
    right: Platform.OS === 'web' ? 60 : -60,
    zIndex: 0,
  },
  bgCircle1Dark: {
    backgroundColor: '#fbbf24aa', // koyu temada canlı turuncu-sarı
  },
  bgCircle2Dark: {
    backgroundColor: '#fde68aaa', // koyu temada canlı sarı-turuncu
  },
});