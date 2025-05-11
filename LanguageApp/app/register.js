import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../config/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    // Form validasyonu
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Hata', 'Şifreler eşleşmiyor');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Hata', 'Şifre en az 6 karakter olmalıdır');
      return;
    }

    setLoading(true);
    try {
      // Firebase ile kullanıcı oluştur
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Kullanıcı profilini güncelle
      await updateProfile(user, {
        displayName: name
      });

      // Kullanıcı bilgilerini AsyncStorage'a kaydet
      await AsyncStorage.setItem('userData', JSON.stringify({
        uid: user.uid,
        email: user.email,
        displayName: name
      }));

      Alert.alert('Başarılı', 'Kayıt başarılı!');
      router.replace("/home");
    } catch (error) {
      let errorMessage = 'Kayıt başarısız';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Bu email adresi zaten kullanımda';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Geçersiz email adresi';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Şifre çok zayıf';
      }

      Alert.alert('Hata', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kayıt Ol</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Ad Soyad"
        value={name}
        onChangeText={setName}
        editable={!loading}
      />

      <TextInput
        style={styles.input}
        placeholder="E-posta"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        editable={!loading}
      />

      <TextInput
        style={styles.input}
        placeholder="Şifre"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!loading}
      />

      <TextInput
        style={styles.input}
        placeholder="Şifre Tekrar"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        editable={!loading}
      />

      <Button
        title={loading ? "KAYIT YAPILIYOR..." : "KAYIT OL"}
        onPress={handleRegister}
        disabled={loading}
      />

      <TouchableOpacity 
        style={styles.loginLink}
        onPress={() => router.push("/login")}
      >
        <Text style={styles.loginLinkText}>
          Zaten hesabınız var mı? Giriş yapın
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#333'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    fontSize: 16
  },
  loginLink: {
    marginTop: 15,
    alignItems: 'center'
  },
  loginLinkText: {
    color: '#007AFF',
    fontSize: 16
  }
}); 