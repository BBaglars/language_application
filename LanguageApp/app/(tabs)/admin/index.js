import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import api from '../../../api';
import WordForm from './WordForm';
import CategoryForm from './CategoryForm';
import LanguageForm from './LanguageForm';
import TranslationForm from './TranslationForm';

const API_URL = 'http://localhost:3000/api';

const TABS = [
  { key: 'word', label: 'Kelime Ekle' },
  { key: 'category', label: 'Kategori Ekle' },
  { key: 'language', label: 'Dil Ekle' },
  { key: 'translation', label: 'Çeviri Ekle' },
];

const StatCard = ({ title, value, icon, color }) => (
  <View style={[styles.statCard, { borderLeftColor: color }]}>
    <View style={styles.statIconContainer}>
      <MaterialIcons name={icon} size={24} color={color} />
    </View>
    <View style={styles.statContent}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  </View>
);

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('word');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get(`/stats`);
      setStats(response.data.data);
    } catch (error) {
      console.error('Stats fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Admin Paneli</Text>
      
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <StatCard
            title="Toplam Kelime"
            value={stats?.totalWords || 0}
            icon="translate"
            color="#4F46E5"
          />
          <StatCard
            title="Toplam Kategori"
            value={stats?.totalCategories || 0}
            icon="category"
            color="#10B981"
          />
          <StatCard
            title="Toplam Dil"
            value={stats?.totalLanguages || 0}
            icon="language"
            color="#F59E0B"
          />
        </View>
        <View style={styles.statsRow}>
          <StatCard
            title="Toplam Kullanıcı"
            value={stats?.totalUsers || 0}
            icon="people"
            color="#EF4444"
          />
          <StatCard
            title="Toplam Çeviri"
            value={stats?.totalTranslations || 0}
            icon="swap-horiz"
            color="#8B5CF6"
          />
          <StatCard
            title="Toplam Hikaye"
            value={stats?.totalStories || 0}
            icon="menu-book"
            color="#EC4899"
          />
        </View>
      </View>

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
        {activeTab === 'translation' && <TranslationForm />}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#4F46E5', marginBottom: 18, textAlign: 'center' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  statsContainer: { 
    marginBottom: 24,
    paddingHorizontal: 2
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    marginHorizontal: 2,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  statContent: { flex: 1 },
  statValue: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#1f2937', 
    marginBottom: 2 
  },
  statTitle: { 
    fontSize: 12, 
    color: '#6b7280' 
  },
  tabBar: { flexDirection: 'row', justifyContent: 'center', marginBottom: 18 },
  tabBtn: { paddingVertical: 8, paddingHorizontal: 18, borderRadius: 8, backgroundColor: '#f3f4f6', marginHorizontal: 4 },
  tabBtnActive: { backgroundColor: '#4F46E5' },
  tabBtnText: { color: '#4F46E5', fontWeight: 'bold' },
  tabBtnTextActive: { color: '#fff' },
  formArea: { marginTop: 8 }
}); 