import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';

const API_URL = 'http://localhost:3000/api';

export default function WordForm() {
  const [text, setText] = useState('');
  const [meaning, setMeaning] = useState('');
  const [difficultyLevel, setDifficultyLevel] = useState('A1');
  const [languageId, setLanguageId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [languages, setLanguages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [langRes, catRes] = await Promise.all([
        axios.get(`${API_URL}/languages`),
        axios.get(`${API_URL}/categories`)
      ]);
      console.log('LANGUAGES API RESPONSE:', JSON.stringify(langRes.data, null, 2));
      console.log('CATEGORIES API RESPONSE:', JSON.stringify(catRes.data, null, 2));
      setLanguages(langRes.data.data?.languages || []);
      setCategories(catRes.data.data?.categories || []);
    } catch (e) {
      Alert.alert('Hata', 'Dil ve kategori listesi alınamadı.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!text || !meaning || !difficultyLevel || !languageId || !categoryId) {
      Alert.alert('Uyarı', 'Tüm alanları doldurun.');
      return;
    }
    try {
      setLoading(true);
      const payload = {
        text,
        meaning,
        difficultyLevel,
        languageId: Number(languageId)
      };
      const wordRes = await axios.post(`${API_URL}/words`, payload);
      const wordId = wordRes.data?.data?.word?.id;
      if (wordId && categoryId) {
        try {
          await axios.post(`${API_URL}/words/${wordId}/categories/${categoryId}`);
        } catch (catErr) {
          Alert.alert('Uyarı', 'Kelime eklendi fakat kategoriye eklenemedi.');
        }
      }
      Alert.alert('Başarılı', 'Kelime ve kategori ilişkisi eklendi!');
      setText('');
      setMeaning('');
      // Seviye, dil ve kategori sabit kalsın
    } catch (e) {
      Alert.alert('Hata', e?.response?.data?.message || 'Kelime eklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.form}>
      <Text style={styles.label}>Kelime</Text>
      <TextInput style={styles.input} value={text} onChangeText={setText} placeholder="Kelime" />
      <Text style={styles.label}>Anlamı</Text>
      <TextInput style={styles.input} value={meaning} onChangeText={setMeaning} placeholder="Anlamı" />
      <Text style={styles.label}>Seviye</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={difficultyLevel}
          onValueChange={setDifficultyLevel}
          style={styles.picker}
        >
          {LEVELS.map(level => (
            <Picker.Item key={level} label={level} value={level} />
          ))}
        </Picker>
      </View>
      <Text style={styles.label}>Dil</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={languageId}
          onValueChange={setLanguageId}
          style={styles.picker}
        >
          <Picker.Item label="Dil seç" value="" />
          {languages.map(lang => (
            <Picker.Item key={lang.id} label={lang.name} value={lang.id.toString()} />
          ))}
        </Picker>
      </View>
      <Text style={styles.label}>Kategori</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={categoryId}
          onValueChange={setCategoryId}
          style={styles.picker}
        >
          <Picker.Item label="Kategori seç" value="" />
          {categories.map(cat => (
            <Picker.Item key={cat.id} label={cat.name} value={cat.id.toString()} />
          ))}
        </Picker>
      </View>
      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Ekleniyor...' : 'Ekle'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  form: { backgroundColor: '#f8f9fb', borderRadius: 12, padding: 18 },
  label: { color: '#4F46E5', fontWeight: 'bold', marginTop: 8 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 8, marginTop: 4 },
  pickerWrapper: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 6, marginTop: 4, marginBottom: 4 },
  picker: { height: 40, width: '100%' },
  button: { backgroundColor: '#4F46E5', borderRadius: 8, padding: 12, marginTop: 16, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' }
}); 