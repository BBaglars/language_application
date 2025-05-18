import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Image, Modal, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

const ThemeModal = React.lazy(() => import('./ThemeModal'));

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  const handleThemeChange = useCallback((newTheme) => {
    setTheme(newTheme);
    setModalVisible(false);
  }, [setTheme]);

  return (
    <View style={styles.navbar}>
      <Text style={styles.logo}>LingoSpark</Text>
      <TouchableOpacity onPress={() => setModalVisible(true)}>
        <Text style={styles.avatar}>👤</Text>
      </TouchableOpacity>
      
      {modalVisible && (
        <React.Suspense fallback={null}>
          <ThemeModal
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
            onThemeChange={handleThemeChange}
            currentTheme={theme}
          />
        </React.Suspense>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  logo: { fontSize: 22, fontWeight: 'bold', color: '#4F46E5' },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#eee', textAlign: 'center', textAlignVertical: 'center', fontSize: 28 },
  modalBg: { flex: 1, backgroundColor: '#0008', justifyContent: 'center', alignItems: 'center' },
  modalBox: { backgroundColor: '#fff', borderRadius: 14, padding: 24, width: 260, alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#4F46E5', marginBottom: 16 },
  modalBtn: { width: '100%', padding: 12, borderRadius: 8, backgroundColor: '#f3f4f6', marginBottom: 10, alignItems: 'center' },
  modalBtnText: { fontSize: 16, color: '#222' },
}); 