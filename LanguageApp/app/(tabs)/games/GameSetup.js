import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ActivityIndicator, ScrollView, Modal, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Navbar from '../../../components/ui/Navbar';
import Sidebar from '../../../components/ui/Sidebar';
import { MaterialIcons } from '@expo/vector-icons';

// Sabitler
const STORAGE_KEY = 'game-setup-selection';
const LANGUAGES = [
  { label: 'İngilizce', value: 'en' },
  { label: 'Türkçe', value: 'tr' },
];
const CATEGORIES = [
  { label: 'Genel', value: '1' },
  { label: 'Hayvanlar', value: '2' },
  { label: 'Yiyecekler', value: '3' },
];
const LEVELS = [
  { label: 'A1', value: 'A1' },
  { label: 'A2', value: 'A2' },
  { label: 'B1', value: 'B1' },
  { label: 'B2', value: 'B2' },
  { label: 'C1', value: 'C1' },
  { label: 'C2', value: 'C2' },
];

// Seçim Dropdown Bileşeni
const SelectComponent = ({ value, setValue, items, placeholder, open, setOpen, onOpen, zIndex }) => {
  if (Platform.OS === 'web') {
    return (
      <select
        value={value}
        onChange={e => setValue(e.target.value)}
        style={styles.webSelect}
      >
        <option value="" disabled>{placeholder}</option>
        {items.map(item => (
          <option key={item.value} value={item.value}>{item.label}</option>
        ))}
      </select>
    );
  }
  const selectedObj = items.find(i => i.value === value);
  const selectedLabel = selectedObj ? selectedObj.label : placeholder;
  const isPlaceholder = !selectedObj;
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
        <Text style={[styles.customDropdownButtonText, isPlaceholder && styles.placeholderText]}>{selectedLabel}</Text>
        <MaterialIcons name="arrow-drop-down" size={22} color="#666" style={{ marginLeft: 4 }} />
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
              style={{ maxHeight: 220 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.customDropdownItem}
                  onPress={() => {
                    setValue(item.value);
                    setOpen(false);
                  }}
                >
                  <Text style={styles.customDropdownItemText}>{item.label}</Text>
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
const SelectRow = ({ label, ...props }) => (
  <View style={styles.selectRow}>
    <Text style={styles.selectLabel}>{label}:</Text>
    <SelectComponent {...props} />
  </View>
);

// Ana Bileşen
export default function GameSetup({ onStart, onBack }) {
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[0].value);
  const [selectedCat, setSelectedCat] = useState(CATEGORIES[0].value);
  const [selectedLevel, setSelectedLevel] = useState(LEVELS[0].value);
  const [loading, setLoading] = useState(true);
  const [langOpen, setLangOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [levelOpen, setLevelOpen] = useState(false);
  const isWeb = Platform.OS === 'web';

  // Seçimleri yükle/kaydet
  useEffect(() => { loadSavedSelections(); }, []);
  useEffect(() => { if (!loading) saveSelections(); }, [selectedLang, selectedCat, selectedLevel, loading]);

  const loadSavedSelections = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed.lang && LANGUAGES.some(l => l.value === parsed.lang)) setSelectedLang(parsed.lang);
        if (parsed.cat && CATEGORIES.some(c => c.value === parsed.cat)) setSelectedCat(parsed.cat);
        if (parsed.level && LEVELS.some(l => l.value === parsed.level)) setSelectedLevel(parsed.level);
      }
    } catch (error) {
      console.error('Seçimler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };
  const saveSelections = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({
        lang: selectedLang,
        cat: selectedCat,
        level: selectedLevel
      }));
    } catch (error) {
      console.error('Seçimler kaydedilirken hata:', error);
    }
  };
  const handleStart = () => {
    onStart({
      lang: selectedLang,
      langLabel: LANGUAGES.find(l => l.value === selectedLang)?.label,
      cat: selectedCat,
      catLabel: CATEGORIES.find(c => c.value === selectedCat)?.label,
      level: selectedLevel,
      levelLabel: LEVELS.find(l => l.value === selectedLevel)?.label
    });
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#4F46E5" style={styles.loader} />;
  }

  const renderContent = () => (
    <View style={styles.centeredContainer}>
      <View style={styles.selectArea}>
        <Text style={styles.title}>Oyun Ayarları</Text>
        <Text style={styles.desc}>Oynamak istediğin dili, kategoriyi ve seviyeyi seç:</Text>
        <SelectRow
          label="Dil"
          value={selectedLang}
          setValue={setSelectedLang}
          items={LANGUAGES}
          placeholder="Dil seç"
          open={langOpen}
          setOpen={setLangOpen}
          onOpen={() => { setCatOpen(false); setLevelOpen(false); }}
          zIndex={3000}
        />
        <SelectRow
          label="Kategori"
          value={selectedCat}
          setValue={setSelectedCat}
          items={CATEGORIES}
          placeholder="Kategori seç"
          open={catOpen}
          setOpen={setCatOpen}
          onOpen={() => { setLangOpen(false); setLevelOpen(false); }}
          zIndex={2000}
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
        />
        <TouchableOpacity style={styles.startBtn} onPress={handleStart}>
          <Text style={styles.startBtnText}>Başla</Text>
        </TouchableOpacity>
        {onBack && (
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Text style={styles.backBtnText}>← Geri Dön</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <>
      <Navbar />
      <View style={styles.container}>
        {isWeb && <Sidebar />}
        {isWeb ? (
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
            {renderContent()}
          </ScrollView>
        ) : (
          <View style={styles.mobileContainer}>
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
    flex: 1
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#fff'
  },
  scrollViewContent: {
    minHeight: '100%',
    alignItems: 'center',
    justifyContent: 'center'
  },
  mobileContainer: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  selectArea: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#f8f9fb',
    borderRadius: 12,
    padding: 20,
    marginBottom: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 }
  },
  selectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    width: '100%'
  },
  selectLabel: {
    width: 70,
    fontSize: 15,
    color: '#4F46E5',
    fontWeight: 'bold'
  },
  webSelect: {
    flex: 1,
    height: 36,
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    fontSize: 15,
    color: '#333',
    outline: 'none'
  },
  customDropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minHeight: 36,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginLeft: 8
  },
  customDropdownButtonText: {
    color: '#333',
    fontSize: 15,
    flex: 1
  },
  placeholderText: {
    color: '#aaa'
  },
  customDropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.15)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  customDropdownModal: {
    width: 220,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 8,
    elevation: 8
  },
  customDropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 16
  },
  customDropdownItemText: {
    fontSize: 15,
    color: '#333'
  },
  startBtn: {
    backgroundColor: '#4F46E5',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginTop: 10
  },
  startBtnText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  backBtn: {
    marginTop: 18,
    padding: 8
  },
  backBtnText: {
    color: '#4F46E5',
    fontWeight: 'bold'
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4F46E5',
    marginBottom: 8
  },
  desc: {
    fontSize: 15,
    color: '#666',
    marginBottom: 18,
    textAlign: 'center'
  },
  loader: {
    marginTop: 40
  }
});