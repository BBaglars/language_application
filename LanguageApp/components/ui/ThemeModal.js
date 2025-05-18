import React, { memo } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';

const ThemeModal = memo(({ visible, onClose, onThemeChange, currentTheme }) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalBg}>
        <View style={styles.modalBox}>
          <Text style={styles.modalTitle}>Tema Seçimi</Text>
          <TouchableOpacity 
            style={[styles.modalBtn, currentTheme === 'light' && styles.activeBtn]} 
            onPress={() => onThemeChange('light')}
          >
            <Text style={styles.modalBtnText}>Açık Mod</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.modalBtn, currentTheme === 'dark' && styles.activeBtn]} 
            onPress={() => onThemeChange('dark')}
          >
            <Text style={styles.modalBtnText}>Karanlık Mod</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.modalBtn, currentTheme === 'system' && styles.activeBtn]} 
            onPress={() => onThemeChange('system')}
          >
            <Text style={styles.modalBtnText}>Sistem Teması</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.modalBtn, styles.closeBtn]} 
            onPress={onClose}
          >
            <Text style={[styles.modalBtnText, styles.closeBtnText]}>Kapat</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalBtn: {
    backgroundColor: '#4F46E5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  activeBtn: {
    backgroundColor: '#4338CA',
  },
  modalBtnText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '500',
  },
  closeBtn: {
    backgroundColor: '#f3f4f6',
    marginTop: 8,
  },
  closeBtnText: {
    color: '#4F46E5',
  },
});

export default ThemeModal; 