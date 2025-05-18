import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export default function LanguageForm() {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name || !code) {
      Alert.alert('Uyarı', 'Tüm alanları doldurun.');
      return;
    }
    try {
      setLoading(true);
      await axios.post(`${API_URL}/languages`, { name, code });
      Alert.alert('Başarılı', 'Dil eklendi!');
      setName(''); setCode('');
    } catch (e) {
      Alert.alert('Hata', 'Dil eklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.form}>
      <Text style={styles.label}>Dil Adı</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Dil Adı" />
      <Text style={styles.label}>Kod</Text>
      <TextInput style={styles.input} value={code} onChangeText={setCode} placeholder="Dil Kodu (ör: en, tr)" />
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
  button: { backgroundColor: '#4F46E5', borderRadius: 8, padding: 12, marginTop: 16, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' }
}); 