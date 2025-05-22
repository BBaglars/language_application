import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import api from '../../../api';

export default function CategoryForm() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name) {
      Alert.alert('Uyarı', 'Kategori adı zorunlu.');
      return;
    }
    try {
      setLoading(true);
      await api.post('/categories', { name, description });
      Alert.alert('Başarılı', 'Kategori eklendi!');
      setName(''); setDescription('');
    } catch (e) {
      Alert.alert('Hata', e?.response?.data?.message || 'Kategori eklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.form}>
      <Text style={styles.label}>Kategori Adı</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Kategori Adı" />
      <Text style={styles.label}>Açıklama</Text>
      <TextInput style={styles.input} value={description} onChangeText={setDescription} placeholder="Açıklama (opsiyonel)" />
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