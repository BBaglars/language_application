import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const BadgePopup = memo(({ visible, onClose, theme }) => {
  if (!visible) return null;

  return (
    <View style={[styles.badgePopup, { backgroundColor: theme.card }]}>
      <Text style={styles.badgeEmoji}>🏅</Text>
      <Text style={[styles.badgeText, { color: theme.accent }]}>
        Lingo Ustası Rozeti Kazandın!
      </Text>
      <TouchableOpacity 
        onPress={onClose} 
        style={[styles.badgeBtn, { backgroundColor: theme.accent }]}
      >
        <Text style={styles.badgeBtnText}>Kapat</Text>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  badgePopup: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    alignItems: 'center',
    borderRadius: 16,
    padding: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  badgeEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  badgeText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  badgeBtn: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 24,
    marginTop: 8,
  },
  badgeBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default BadgePopup; 