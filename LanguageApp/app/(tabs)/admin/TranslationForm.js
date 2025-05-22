import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, TextInput, FlatList } from 'react-native';
import api from '../../../api';
import { Picker } from '@react-native-picker/picker';

const API_URL = 'http://192.168.102.34:3000/api';

export default function TranslationForm() {
  const [languages, setLanguages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sourceLang, setSourceLang] = useState('');
  const [targetLang, setTargetLang] = useState('');
  const [category, setCategory] = useState('');
  const [sourceWords, setSourceWords] = useState([]);
  const [targetWords, setTargetWords] = useState([]);
  const [sourceWord, setSourceWord] = useState('');
  const [targetWord, setTargetWord] = useState('');
  const [loading, setLoading] = useState(false);
  const [langLoading, setLangLoading] = useState(true);
  const [catLoading, setCatLoading] = useState(true);
  const [wordsLoading, setWordsLoading] = useState(false);
  const [sourceText, setSourceText] = useState('');
  const [targetText, setTargetText] = useState('');
  const [languagePairs, setLanguagePairs] = useState([]);
  const [selectedPair, setSelectedPair] = useState(null);
  const [translations, setTranslations] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSourceWord, setSelectedSourceWord] = useState(null);
  const [selectedTargetWord, setSelectedTargetWord] = useState(null);

  useEffect(() => {
    fetchLanguages();
    fetchCategories();
    fetchLanguagePairs();
    fetchTranslations();
  }, []);

  useEffect(() => {
    if (selectedPair && selectedCategory) {
      fetchSourceWords();
      fetchTargetWords();
    }
  }, [selectedPair, selectedCategory]);

  const fetchLanguages = async () => {
    try {
      setLangLoading(true);
      const res = await api.get(`/languages`);
      const langs = res.data.data?.languages?.map(l => ({ label: l.name, value: l.id.toString() })) || [];
      setLanguages(langs);
      setSourceLang(langs[0]?.value || '');
      setTargetLang(langs[1]?.value || '');
    } catch (e) {
      Alert.alert('Hata', 'Dilleri yüklerken hata oluştu.');
    } finally {
      setLangLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setCatLoading(true);
      const res = await api.get(`/categories`);
      const cats = res.data.data?.categories?.map(c => ({ label: c.name, value: c.id.toString() })) || [];
      setCategories(cats);
      setCategory(cats[0]?.value || '');
    } catch (e) {
      Alert.alert('Hata', 'Kategoriler yüklenemedi.');
    } finally {
      setCatLoading(false);
    }
  };

  // Kategori, kaynak dil veya hedef dil değişince kelimeleri çek
  useEffect(() => {
    if (category && sourceLang) fetchWords('source');
  }, [category, sourceLang]);
  useEffect(() => {
    if (category && targetLang) fetchWords('target');
  }, [category, targetLang]);

  const fetchWords = async (type) => {
    setWordsLoading(true);
    try {
      const res = await api.get(`/words`, {
        params: {
          languageId: type === 'source' ? sourceLang : targetLang,
          categoryId: category
        }
      });
      const words = res.data.data?.words?.map(w => ({ label: w.text, value: w.text })) || [];
      if (type === 'source') {
        setSourceWords(words);
        setSourceWord(words[0]?.value || '');
      } else {
        setTargetWords(words);
        setTargetWord(words[0]?.value || '');
      }
    } catch (e) {
      if (type === 'source') setSourceWords([]);
      else setTargetWords([]);
    } finally {
      setWordsLoading(false);
    }
  };

  const fetchLanguagePairs = async () => {
    try {
      const res = await api.get(`/language-pairs`);
      setLanguagePairs(res.data.data || []);
    } catch (e) {
      Alert.alert('Hata', 'Dil çiftleri yüklenemedi!');
    }
  };

  const fetchTranslations = async () => {
    try {
      const res = await api.get(`/translations`);
      setTranslations(res.data.data || []);
    } catch (e) {
      Alert.alert('Hata', 'Translationlar yüklenemedi!');
    }
  };

  const fetchSourceWords = async () => {
    try {
      const res = await api.get(`/words`, {
        params: {
          languageId: selectedPair.sourceLanguageId,
          categoryId: selectedCategory
        }
      });
      setSourceWords(res.data.data || []);
    } catch (e) {
      Alert.alert('Hata', 'Kaynak kelimeler yüklenemedi!');
    }
  };

  const fetchTargetWords = async () => {
    try {
      const res = await api.get(`/words`, {
        params: {
          languageId: selectedPair.targetLanguageId,
          categoryId: selectedCategory
        }
      });
      setTargetWords(res.data.data || []);
    } catch (e) {
      Alert.alert('Hata', 'Hedef kelimeler yüklenemedi!');
    }
  };

  const handleSubmit = async () => {
    if (!selectedSourceWord || !selectedTargetWord || !selectedPair) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun!');
      return;
    }
    setLoading(true);
    try {
      await api.post(`/translations`, {
        sourceText: selectedSourceWord.text,
        targetText: selectedTargetWord.text,
        languagePairId: selectedPair.id
      });
      Alert.alert('Başarılı', 'Translation eklendi!');
      setSelectedSourceWord(null);
      setSelectedTargetWord(null);
      setSelectedPair(null);
      fetchTranslations();
    } catch (e) {
      Alert.alert('Hata', 'Translation eklenemedi!');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/translations/${id}`);
      Alert.alert('Başarılı', 'Translation silindi!');
      fetchTranslations();
    } catch (e) {
      Alert.alert('Hata', 'Translation silinemedi!');
    }
  };

  if (langLoading || catLoading) {
    return <ActivityIndicator size="large" color="#4F46E5" style={{ marginTop: 40 }} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Translation Ekle</Text>
      <View style={styles.dropdownContainer}>
        <Text style={styles.label}>Kategori Seçin:</Text>
        <FlatList
          data={categories}
          keyExtractor={(item, idx) => (item?.id ? item.id.toString() : idx.toString())}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.dropdownItem, selectedCategory === item.value && styles.selectedItem]}
              onPress={() => setSelectedCategory(item.value)}
            >
              <Text>{item.label}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
      <View style={styles.dropdownContainer}>
        <Text style={styles.label}>Dil Çifti Seçin:</Text>
        <FlatList
          data={languagePairs}
          keyExtractor={(item, idx) => (item?.id ? item.id.toString() : idx.toString())}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.dropdownItem, selectedPair?.id === item.id && styles.selectedItem]}
              onPress={() => setSelectedPair(item)}
            >
              <Text>{item.sourceLanguage.name} - {item.targetLanguage.name}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
      <View style={styles.dropdownContainer}>
        <Text style={styles.label}>Kaynak Kelime:</Text>
        <FlatList
          data={sourceWords}
          keyExtractor={(item, idx) => (item?.id ? item.id.toString() : idx.toString())}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.dropdownItem, selectedSourceWord?.id === item.id && styles.selectedItem]}
              onPress={() => setSelectedSourceWord(item)}
            >
              <Text>{item.text}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
      <View style={styles.dropdownContainer}>
        <Text style={styles.label}>Hedef Kelime:</Text>
        <FlatList
          data={targetWords}
          keyExtractor={(item, idx) => (item?.id ? item.id.toString() : idx.toString())}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.dropdownItem, selectedTargetWord?.id === item.id && styles.selectedItem]}
              onPress={() => setSelectedTargetWord(item)}
            >
              <Text>{item.text}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Ekleniyor...' : 'Ekle'}</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Mevcut Translationlar</Text>
      <FlatList
        data={translations}
        keyExtractor={(item, idx) => (item?.id ? item.id.toString() : idx.toString())}
        renderItem={({ item }) => (
          <View style={styles.translationItem}>
            <Text>{item.sourceText} - {item.targetText}</Text>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDelete(item.id)}
            >
              <Text style={styles.deleteButtonText}>Sil</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8fafc',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  dropdownContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  dropdownItem: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 5,
    backgroundColor: '#fff',
  },
  selectedItem: {
    backgroundColor: '#e0e7ff',
    borderColor: '#7C3AED',
  },
  button: {
    backgroundColor: '#7C3AED',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#a78bfa',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  translationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    padding: 8,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
}); 