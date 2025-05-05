import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import { useRouter } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';

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
      console.log('Login isteği gönderiliyor...');
      const response = await axios.post('http://192.168.70.34:3000/api/auth/login', {
        email,
        password,
      }, { 
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Sunucu yanıtı:', response.data);

      if (response.data && response.data.token) {
        await AsyncStorage.setItem('userToken', response.data.token);
        await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
        Alert.alert('Başarılı', 'Giriş başarılı!');
        router.replace("/home");
      } else {
        Alert.alert('Hata', 'Giriş başarısız: Geçersiz yanıt');
      }
    } catch (error) {
      console.log('Hata detayı:', error);
      if (error.response) {
        console.log('Sunucu yanıtı:', error.response.data);
        const errorMessage = error.response.data?.error || error.response.data?.message || 'Giriş başarısız';
        Alert.alert('Hata', errorMessage);
      } else if (error.request) {
        console.log('İstek hatası:', error.request);
        Alert.alert('Hata', 'Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.');
      } else {
        console.log('Diğer hata:', error.message);
        Alert.alert('Hata', 'Beklenmeyen bir hata oluştu: ' + error.message);
      }
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
});