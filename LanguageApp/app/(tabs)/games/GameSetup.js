import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ActivityIndicator, ScrollView, Modal, FlatList } from 'react-native';
import api from '../../../api';
import Navbar from '../../../components/ui/Navbar';
import Sidebar from '../../../components/ui/Sidebar';
import { MaterialIcons } from '@expo/vector-icons';
import { useGameSettings } from '../../../context/GameSettingsContext';
import { useTheme } from '../../../context/ThemeContext';
import { useColorScheme as useDeviceColorScheme } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const LEVELS = [
  { label: 'A1', value: 'A1' },
  { label: 'A2', value: 'A2' },
  { label: 'B1', value: 'B1' },
  { label: 'B2', value: 'B2' },
  { label: 'C1', value: 'C1' },
  { label: 'C2', value: 'C2' },
];

// Dropdown Bileşeni
const SelectComponent = ({ value, setValue, items, placeholder, open, setOpen, onOpen, zIndex, textColor, borderColor, dropdownBg, placeholderColor, dropdownOverlayBg }) => {
  const selectedObj = items.find(i => i.value === value);
  const selectedLabel = selectedObj ? selectedObj.label : placeholder;
  const isPlaceholder = !selectedObj;
  const maxHeight = Platform.OS === 'web' ? 44 * 7 : 44 * 5;
  return (
    <>
      <TouchableOpacity
        style={[styles.customDropdownButton, { borderColor, backgroundColor: dropdownBg }]}
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
            <View style={[styles.customDropdownModal, { backgroundColor: dropdownBg }]}> 
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
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const SelectRow = ({ label, dropdownOverlayBg, ...props }) => (
  <View style={styles.selectRow}>
    <Text style={styles.selectLabel}>{label}:</Text>
    <SelectComponent {...props} dropdownOverlayBg={dropdownOverlayBg} />
  </View>
);

export default function GameSetup({ onStart = () => {}, onBack }) {
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
  const cardBg = isDark ? '#232136' : '#f3f4fa';
  const textColor = isDark ? '#fff' : '#232136';
  const accent = isDark ? '#fbbf24' : '#7C3AED';
  const borderColor = isDark ? '#fbbf24' : '#a78bfa';
  const dropdownBg = isDark ? '#232136' : '#fff';
  const placeholderColor = isDark ? '#e0e7ff' : '#a78bfa';
  const dropdownOverlayBg = isDark ? 'rgba(35,33,54,0.85)' : 'rgba(124,58,237,0.10)';
  const router = useRouter();

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
    if (router && router.back) router.back();
  };

  const handleBack = () => {
    if (onBack) onBack();
    else if (router && router.back) router.back();
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
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.backButton, { borderColor }]}
            onPress={handleBack}
          >
            <Text style={[styles.buttonText, { color: accent, fontSize: 13 }]}>Geri</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.startButton, { backgroundColor: accent }]}
            onPress={handleStart}
          >
            <Text style={[styles.buttonText, { color: '#fff', fontSize: 13 }]}>Başla</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <>
      <Navbar />
      <LinearGradient
        colors={isDark ? ['#181825', '#232136', '#fbbf2422'] : ['#f8fafc', '#e0e7ff', '#a78bfa11']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1 }}
      >
        <View style={[styles.container, { backgroundColor: 'transparent', position: 'relative' }]}> 
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
      </LinearGradient>
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
    maxWidth: Platform.OS === 'web' ? 600 : 340,
    borderRadius: 14,
    padding: Platform.OS === 'web' ? 28 : 18,
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
    marginBottom: 10,
    width: '100%',
  },
  selectLabel: {
    width: 80,
    fontSize: 13,
    fontWeight: 'bold',
    color: '#a78bfa',
  },
  customDropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minHeight: 40,
    borderWidth: 2,
    borderRadius: 8,
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginLeft: 8,
    fontWeight: 'bold',
  },
  customDropdownButtonText: {
    fontSize: 13,
    flex: 1,
    fontWeight: 'bold',
  },
  customDropdownOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customDropdownModal: {
    width: 240,
    borderRadius: 10,
    paddingVertical: 10,
    elevation: 10,
  },
  customDropdownItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  customDropdownItemText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 18,
    minWidth: 120,
    borderRadius: 8,
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
    fontSize: 13,
    fontWeight: 'bold',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: Platform.OS === 'web' ? 22 : 17,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  desc: {
    fontSize: Platform.OS === 'web' ? 13 : 11,
    color: '#F59E42',
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});