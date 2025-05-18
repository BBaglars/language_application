import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import WordForm from './WordForm';
import CategoryForm from './CategoryForm';
import LanguageForm from './LanguageForm';

const TABS = [
  { key: 'word', label: 'Kelime Ekle' },
  { key: 'category', label: 'Kategori Ekle' },
  { key: 'language', label: 'Dil Ekle' },
];

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('word');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Paneli</Text>
      <View style={styles.tabBar}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabBtn, activeTab === tab.key && styles.tabBtnActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabBtnText, activeTab === tab.key && styles.tabBtnTextActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.formArea}>
        {activeTab === 'word' && <WordForm />}
        {activeTab === 'category' && <CategoryForm />}
        {activeTab === 'language' && <LanguageForm />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#4F46E5', marginBottom: 18, textAlign: 'center' },
  tabBar: { flexDirection: 'row', justifyContent: 'center', marginBottom: 18 },
  tabBtn: { paddingVertical: 8, paddingHorizontal: 18, borderRadius: 8, backgroundColor: '#f3f4f6', marginHorizontal: 4 },
  tabBtnActive: { backgroundColor: '#4F46E5' },
  tabBtnText: { color: '#4F46E5', fontWeight: 'bold' },
  tabBtnTextActive: { color: '#fff' },
  formArea: { marginTop: 8 }
}); 