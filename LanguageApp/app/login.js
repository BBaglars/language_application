import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Platform, StyleSheet, ActivityIndicator, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useUser } from '../context/UserContext';

// Mobil için ayrı bir component
function MobileEmailLoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setUser, saveToken } = useUser();

  /**
   * GEÇİCİ ÇÖZÜM: Sadece mobilde, e-posta ile girişte backend'e istek atılır.
   * Backend, e-posta ile kullanıcıyı veritabanında arar ve Google ile girişteki gibi
   * firebaseId, email, name, photoURL bilgilerini döner. Bu bilgilerle uygulama açılır.
   * İLERİDE GOOGLE İLE GİRİŞ TAMAMEN ENTEGRE EDİLDİĞİNDE BU BLOK KALDIRILACAKTIR!
   */
  const handleEmailLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const response = await fetch('http://192.168.102.34:3000/api/auth/email-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok && data.status === 'success' && data.data && data.data.success) {
        // Kullanıcı bulundu, giriş başarılı
        setUser(data.data.user);
        await saveToken(data.data.token);
        router.replace('/home');
      } else {
        setError((data.data && data.data.message) || data.message || 'Kullanıcı bulunamadı!');
      }
    } catch (e) {
      setError('Sunucuya bağlanılamadı!');
    }
    setLoading(false);
  };

  return (
    <LinearGradient colors={["#7C3AED", "#F59E42"]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <View style={styles.centerBoxMobile}>
          <Text style={styles.logoLingo}>LingoSpark</Text>
          <Text style={styles.subtitle}>Mobilde sadece e-posta ile giriş</Text>
          <TextInput
            style={styles.input}
            placeholder="E-posta"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TouchableOpacity
            style={styles.googleBtn}
            onPress={handleEmailLogin}
            activeOpacity={0.85}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.googleBtnText}>Giriş Yap</Text>
            )}
          </TouchableOpacity>
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

// Ana login ekranı
export default function LoginScreen() {
  if (Platform.OS !== 'web') {
    return <MobileEmailLoginScreen />;
  }

  // Web için Google ile giriş kodlarını sadece burada import et!
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { setUser, saveUser, saveToken } = useUser();

  // Web'e özel importlar
  const { GoogleAuthProvider, signInWithPopup } = require('firebase/auth');
  const { auth } = require('../config/firebase');
  const Google = require('expo-auth-session/providers/google');
  const { AntDesign, Ionicons } = require('@expo/vector-icons');

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: '749203092396-m7lavindhl4gc1q38389f8c6a58e5big.apps.googleusercontent.com',
    androidClientId: '749203092396-n10bvlbmt2re2c25ui4n4rnrub4nre6u.apps.googleusercontent.com',
    iosClientId: '',
    useProxy: false,
  });

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const idToken = await user.getIdToken();
      // Backend'e gönder
      const backendResponse = await fetch('http://192.168.102.34:3000/api/auth/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firebaseId: idToken,
          email: user.email,
          name: user.displayName,
          photoURL: user.photoURL
        })
      });
      const backendJson = await backendResponse.json();
      if (backendResponse.ok && backendJson.status === 'success' && backendJson.data && backendJson.data.user) {
        await saveUser(backendJson.data.user);
        await saveToken(backendJson.data.token);
        setTimeout(() => {
          router.replace('/home');
        }, 200);
      } else {
        setError((backendJson.data && backendJson.data.message) || backendJson.message || 'Giriş başarısız!');
      }
      setLoading(false);
    } catch (e) {
      setError('Giriş başarısız!');
      setLoading(false);
    }
  };

  // Web için Google ile giriş ekranı
  return (
    <LinearGradient
      colors={["#7C3AED", "#F59E42"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <View style={styles.centerBox}>
        <View style={styles.logoContainer}>
          <View style={styles.logoWrapper}>
            <Text style={styles.logoLingo}>Lingo</Text>
            <Text style={styles.logoSpark}>Spark</Text>
            <Ionicons.name name="sparkles" size={32} color="#F59E42" style={styles.sparkIcon} />
          </View>
          <View style={styles.logoDot} />
        </View>
        <Text style={styles.subtitle}>Dünyanın dillerini eğlenceli şekilde öğren!</Text>
        <TouchableOpacity
          style={styles.googleBtn}
          onPress={handleGoogleLogin}
          activeOpacity={0.85}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <AntDesign.name name="google" size={24} color="#fff" style={{ marginRight: 10 }} />
              <Text style={styles.googleBtnText}>Google ile Giriş Yap</Text>
            </>
          )}
        </TouchableOpacity>
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerBox: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 8,
    minWidth: Platform.OS === 'web' ? 400 : 280,
    maxWidth: 420,
  },
  centerBoxMobile: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 8,
    width: '90%',
    maxWidth: 400,
  },
  logoLingo: {
    fontSize: 42,
    fontWeight: '900',
    color: '#7C3AED',
    letterSpacing: 1.5,
    textShadowColor: 'rgba(124, 58, 237, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#F59E42',
    marginTop: 12,
    marginBottom: 24,
    textAlign: 'center',
    fontWeight: '600',
  },
  input: {
    width: 240,
    height: 48,
    borderColor: '#7C3AED',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7C3AED',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#F59E42',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  googleBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 0.5,
  },
  error: {
    color: '#ef4444',
    marginTop: 10,
    fontWeight: 'bold',
    fontSize: 16,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logoWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  logoSpark: {
    fontSize: 42,
    fontWeight: '900',
    color: '#F59E42',
    letterSpacing: 1.5,
    textShadowColor: 'rgba(245, 158, 66, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  sparkIcon: {
    position: 'absolute',
    right: -28,
    top: -8,
    transform: [{ rotate: '15deg' }],
  },
  logoDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#7C3AED',
    marginTop: 4,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});