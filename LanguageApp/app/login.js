import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../config/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

Alert.alert('app/login.js', 'Bu dosya render edildi!');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Hata', 'Lütfen email ve şifre alanlarını doldurun');
      return;
    }

    setLoading(true);
    try {
      // Sadece Firebase Authentication ile giriş yap
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Kullanıcı bilgilerini AsyncStorage'a kaydet
      await AsyncStorage.setItem('userData', JSON.stringify({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName
      }));

      Alert.alert('Başarılı', 'Giriş başarılı!');
      router.replace("/home");
    } catch (error) {
      let errorMessage = 'Giriş başarısız';
      
      if (error.code === 'auth/invalid-email') {
        errorMessage = 'Geçersiz email adresi';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'Kullanıcı bulunamadı';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Hatalı şifre';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Çok fazla başarısız deneme. Lütfen daha sonra tekrar deneyin';
      }

      Alert.alert('Hata', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Giriş Yap</Text>
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
      <Button
        title={loading ? "GİRİŞ YAPILIYOR..." : "GİRİŞ YAP"}
        onPress={handleLogin}
        disabled={loading}
      />

      <TouchableOpacity 
        style={styles.registerLink}
        onPress={() => router.push("/register")}
      >
        <Text style={styles.registerLinkText}>
          Hesabınız yok mu? Kayıt olun
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
  registerLink: {
    marginTop: 15,
    alignItems: 'center'
  },
  registerLinkText: {
    color: '#007AFF',
    fontSize: 16
  }
});