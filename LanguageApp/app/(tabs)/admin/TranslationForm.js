import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, TextInput, FlatList, ScrollView } from 'react-native';
import api from '../../../api';
import { Picker } from '@react-native-picker/picker';

export default function TranslationForm() {
  const [languagePairs, setLanguagePairs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sourceWords, setSourceWords] = useState([]);
  const [targetWords, setTargetWords] = useState([]);
  const [translations, setTranslations] = useState([]);

  const [selectedPairId, setSelectedPairId] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSourceWord, setSelectedSourceWord] = useState('');
  const [selectedTargetWord, setSelectedTargetWord] = useState('');

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Hedef kelime text inputu için state
  const [customTargetText, setCustomTargetText] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('A1');

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 50;

  // Dil çifti veya kategori değişince kelimeleri çek
  useEffect(() => {
    console.log('useEffect bağımlılıkları:', { selectedPairId, selectedCategory, languagePairs });
    const selectedPair = languagePairs.find(p => p.id === Number(selectedPairId));
    const selectedCategoryNum = Number(selectedCategory);
    if (selectedPair && selectedCategoryNum) {
      console.log('fetchWords çağrılacak!', selectedPair, selectedCategoryNum);
      fetchWords('source', selectedPair, selectedCategoryNum);
      fetchWords('target', selectedPair, selectedCategoryNum);
    } else {
      setSourceWords([]);
      setTargetWords([]);
    }
  }, [selectedPairId, selectedCategory, languagePairs]);

  const fetchWords = async (type, selectedPair, selectedCategoryNum) => {
    console.log('fetchWords fonksiyonunun başı:', type, selectedPair, selectedCategoryNum);
    if (!selectedPair || !selectedCategoryNum) return;
    console.log('api.get çağrısı yapılacak:', type, selectedPair, selectedCategoryNum);
    try {
      const res = await api.get('/words', {
        params: {
          languageId: type === 'source' ? selectedPair.sourceLanguageId : selectedPair.targetLanguageId,
          categoryId: selectedCategoryNum
        }
      });
      console.log('API response:', res.data);
      const words = (res.data.data?.words || []).map(w => ({ label: w.text, value: w.id }));
      if (type === 'source') setSourceWords(words);
      else setTargetWords(words);
    } catch (e) {
      console.log('fetchWords hata:', e);
      if (type === 'source') setSourceWords([]);
      else setTargetWords([]);
    }
  };

  const handleAddTranslation = async () => {
    const selectedPair = languagePairs.find(p => p.id === Number(selectedPairId));
    if (selectedTargetWord && customTargetText) {
      Alert.alert('Hata', 'Aynı anda hem hedef kelime seçemez hem de anlamı elle giremezsiniz. Sadece birini doldurun!');
      return;
    }
    if (!selectedPair || !selectedCategory || !selectedSourceWord || (!selectedTargetWord && !customTargetText)) {
      Alert.alert('Hata', 'Tüm alanları doldurun!');
      return;
    }
    setLoading(true);
    try {
      await api.post('/translations', {
        sourceWordId: selectedSourceWord,
        targetWordId: selectedTargetWord || undefined,
        targetText: selectedTargetWord ? undefined : customTargetText,
        languagePairId: selectedPair.id,
        difficultyLevel: selectedDifficulty
      });
      Alert.alert('Başarılı', 'Çeviri eklendi!');
      setSelectedSourceWord('');
      setSelectedTargetWord('');
      setCustomTargetText('');
      fetchTranslations();
    } catch (e) {
      Alert.alert('Hata', 'Çeviri eklenemedi!');
    } finally {
      setLoading(false);
    }
  };

  const fetchTranslations = async (pageNum = 1) => {
    try {
      setFetching(true);
      const params = { limit, page: pageNum };
      if (selectedPairId) params.languagePairId = selectedPairId;
      const res = await api.get('/translations', { params });
      setTranslations(res.data.data?.translations || []);
      setTotalPages(res.data.data?.totalPages || 1);
      setPage(pageNum);
    } catch (e) {}
    finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    const fetchInitial = async () => {
      setFetching(true);
      try {
        const [pairsRes, catsRes] = await Promise.all([
          api.get('/language-pairs'),
          api.get('/categories')
        ]);
        setLanguagePairs(pairsRes.data.data || []);
        setCategories((catsRes.data.data?.categories || []).map(c => ({ label: c.name, value: c.id })));
        fetchTranslations(1);
      } catch (e) {
        Alert.alert('Hata', 'Veriler yüklenemedi!');
      } finally {
        setFetching(false);
      }
    };
    fetchInitial();
  }, []);

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await api.delete(`/translations/${id}`);
      fetchTranslations();
      Alert.alert('Başarılı', 'Çeviri silindi!');
    } catch (e) {
      Alert.alert('Hata', 'Çeviri silinemedi!');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <ActivityIndicator size="large" color="#4F46E5" style={{ marginTop: 40 }} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Admin Translation Formu</Text>
      {/* Dil Çifti Seçimi */}
      <Text style={styles.label}>Dil Çifti:</Text>
      <Picker
        selectedValue={selectedPairId}
        onValueChange={setSelectedPairId}
        style={styles.picker}
      >
        <Picker.Item label="Dil çifti seçin" value="" />
        {languagePairs.map(pair => (
          <Picker.Item key={pair.id} label={`${pair.sourceLanguage?.name} → ${pair.targetLanguage?.name}`} value={pair.id.toString()} />
        ))}
      </Picker>

      {/* Kategori Seçimi */}
      <Text style={styles.label}>Kategori:</Text>
      <Picker
        selectedValue={selectedCategory}
        onValueChange={setSelectedCategory}
        style={styles.picker}
      >
        <Picker.Item label="Kategori seçin" value="" />
        {categories.map(cat => (
          <Picker.Item key={cat.value} label={cat.label} value={cat.value.toString()} />
        ))}
      </Picker>

      {/* Kaynak Kelime Seçimi */}
        <Text style={styles.label}>Kaynak Kelime:</Text>
      <Picker
        selectedValue={selectedSourceWord}
        onValueChange={setSelectedSourceWord}
        style={styles.picker}
        enabled={!!sourceWords.length}
      >
        <Picker.Item label="Kaynak kelime seçin" value="" />
        {sourceWords.map(w => (
          <Picker.Item key={w.value} label={w.label} value={w.value} />
        ))}
      </Picker>

      {/* Hedef Kelime Seçimi */}
        <Text style={styles.label}>Hedef Kelime:</Text>
      <Picker
        selectedValue={selectedTargetWord}
        onValueChange={setSelectedTargetWord}
        style={styles.picker}
        enabled={!!targetWords.length}
      >
        <Picker.Item label="Hedef kelime seçin" value="" />
        {targetWords.map(w => (
          <Picker.Item key={w.value} label={w.label} value={w.value} />
        ))}
      </Picker>
      {/* Hedef kelime yoksa anlamı text olarak gir */}
      <TextInput
        placeholder="Hedef anlamı elle gir (opsiyonel)"
        value={customTargetText}
        onChangeText={setCustomTargetText}
        style={{ width: '100%', backgroundColor: '#f3f4f6', borderRadius: 8, marginBottom: 8, padding: 10 }}
      />
      {/* Seviye seçimi */}
      <Text style={styles.label}>Seviye:</Text>
      <Picker
        selectedValue={selectedDifficulty}
        onValueChange={setSelectedDifficulty}
        style={styles.picker}
            >
        <Picker.Item label="A1" value="A1" />
        <Picker.Item label="A2" value="A2" />
        <Picker.Item label="B1" value="B1" />
        <Picker.Item label="B2" value="B2" />
        <Picker.Item label="C1" value="C1" />
        <Picker.Item label="C2" value="C2" />
      </Picker>

      <TouchableOpacity
        style={styles.addBtn}
        onPress={handleAddTranslation}
        disabled={loading}
      >
        <Text style={styles.addBtnText}>{loading ? 'Ekleniyor...' : 'Çeviri Ekle'}</Text>
      </TouchableOpacity>

      {/* Mevcut Çeviriler */}
      <Text style={[styles.title, { fontSize: 20, marginTop: 32 }]}>Mevcut Çeviriler</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginVertical: 10 }}>
        <TouchableOpacity
          onPress={() => page > 1 && fetchTranslations(page - 1)}
          disabled={page === 1}
          style={{ marginHorizontal: 10, opacity: page === 1 ? 0.5 : 1 }}
        >
          <Text>Önceki</Text>
        </TouchableOpacity>
        <Text>{page} / {totalPages}</Text>
        <TouchableOpacity
          onPress={() => page < totalPages && fetchTranslations(page + 1)}
          disabled={page === totalPages}
          style={{ marginHorizontal: 10, opacity: page === totalPages ? 0.5 : 1 }}
        >
          <Text>Sonraki</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={translations}
        keyExtractor={item => item.id?.toString() || Math.random().toString()}
        renderItem={({ item }) => (
          <View style={styles.translationRow}>
            <Text style={styles.translationText}>
              {(item.sourceWord?.text || '-')} → {(item.targetWord?.text || item.targetText || '-')}
            </Text>
            <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
              <Text style={styles.deleteBtnText}>Sil</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={{ color: '#888', marginTop: 12 }}>Henüz çeviri yok.</Text>}
        style={{ width: '100%', marginTop: 8 }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4F46E5',
    marginBottom: 16,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
    color: '#333',
    alignSelf: 'flex-start',
  },
  picker: {
    width: '100%',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    marginBottom: 8,
  },
  addBtn: {
    backgroundColor: '#4F46E5',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginTop: 18,
    alignItems: 'center',
  },
  addBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  translationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  translationText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  deleteBtn: {
    backgroundColor: '#ef4444',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginLeft: 12,
  },
  deleteBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
}); 