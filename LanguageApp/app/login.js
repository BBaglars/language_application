import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Platform, StyleSheet, ActivityIndicator, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useUser } from '../context/UserContext';
import api from '../api';
import { Ionicons, AntDesign, MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Animated } from 'react-native';

// LingoSpark yazısı için ayrı bir component
function LingoSparkLogo({ style = {}, showSpark = true }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', position: 'relative' }}>
      <Text style={[{ fontSize: 46, fontWeight: '900', color: '#7C3AED', letterSpacing: 1.5, marginRight: 2 }, style]}>Lingo</Text>
      <Text style={[{ fontSize: 46, fontWeight: '900', color: '#F59E42', letterSpacing: 1.5 }, style]}>Spark</Text>
      {showSpark && (
        <Ionicons name="sparkles" size={32} color="#F59E42" style={{ position: 'absolute', right: -38, top: -10 }} />
      )}
    </View>
  );
}

// Mobil için ayrı bir component
function MobileEmailLoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setUser, saveToken } = useUser();
  const [inputFocus, setInputFocus] = useState(false);
  const [errorAnim] = useState(new Animated.Value(0));

  React.useEffect(() => {
    if (error) {
      Animated.sequence([
        Animated.timing(errorAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(errorAnim, { toValue: 0, duration: 200, useNativeDriver: true })
      ]).start();
    }
  }, [error]);

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
      const response = await api.post('/auth/email-login', { email });
      const data = response.data;
      if (response.status === 200 && data.status === 'success' && data.data && data.data.success) {
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
        <BlurView intensity={60} tint="light" style={styles.glassBoxMobile}>
          <View style={{ alignItems: 'center', marginBottom: 12 }}>
            <LingoSparkLogo showSpark={true} />
          </View>
          <Text style={styles.subtitle}>Mobilde sadece e-posta ile giriş</Text>
          <View style={[styles.inputWrapper, inputFocus && styles.inputWrapperActive]}> 
            <MaterialIcons name="email" size={22} color={inputFocus ? '#7C3AED' : '#aaa'} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.input}
              placeholder="E-posta"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              onFocus={() => setInputFocus(true)}
              onBlur={() => setInputFocus(false)}
              placeholderTextColor="#aaa"
            />
          </View>
          <TouchableOpacity
            style={styles.gradientBtn}
            onPress={handleEmailLogin}
            activeOpacity={0.85}
            disabled={loading}
          >
            <LinearGradient colors={["#7C3AED", "#F59E42"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradientBtnBg}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.gradientBtnText}>Giriş Yap</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
          {error ? (
            <Animated.Text style={[styles.error, { transform: [{ scale: errorAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] }) }] }]}>{error}</Animated.Text>
          ) : null}
        </BlurView>
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
  const [inputFocus, setInputFocus] = useState(false);
  const [errorAnim] = useState(new Animated.Value(0));

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
      const backendResponse = await api.post('/auth/google-login', {
              firebaseId: idToken,
              email: user.email,
              name: user.displayName,
              photoURL: user.photoURL
          });
      const backendJson = backendResponse.data;
      if (backendResponse.status === 200 && backendJson.status === 'success' && backendJson.data && backendJson.data.user) {
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

  React.useEffect(() => {
    if (error) {
      Animated.sequence([
        Animated.timing(errorAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(errorAnim, { toValue: 0, duration: 200, useNativeDriver: true })
      ]).start();
    }
  }, [error]);

  // Web için Google ile giriş ekranı
  return (
    <LinearGradient
      colors={["#7C3AED", "#F59E42"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <BlurView intensity={60} tint="light" style={styles.glassBox}>
        <View style={styles.logoContainer}>
          <LingoSparkLogo showSpark={true} />
          <View style={styles.logoDot} />
        </View>
        <Text style={styles.subtitle}>Dünyanın dillerini eğlenceli şekilde öğren!</Text>
        <TouchableOpacity
          style={styles.gradientBtn}
          onPress={handleGoogleLogin}
          activeOpacity={0.85}
          disabled={loading}
        >
          <LinearGradient colors={["#7C3AED", "#F59E42"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradientBtnBg}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <AntDesign name="google" size={24} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.gradientBtnText}>Google ile Giriş Yap</Text>
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>
        {error ? (
          <Animated.Text style={[styles.error, { transform: [{ scale: errorAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] }) }] }]}>{error}</Animated.Text>
        ) : null}
      </BlurView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glassBox: {
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderRadius: 32,
    padding: 36,
    alignItems: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 32,
    elevation: 12,
    minWidth: Platform.OS === 'web' ? 420 : 300,
    maxWidth: 480,
    margin: 12,
    borderWidth: 1.5,
    borderColor: '#a78bfa33',
    overflow: 'hidden',
    backdropFilter: 'blur(12px)',
  },
  glassBoxMobile: {
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderRadius: 32,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 32,
    elevation: 12,
    width: '90%',
    maxWidth: 420,
    margin: 12,
    borderWidth: 1.5,
    borderColor: '#a78bfa33',
    overflow: 'hidden',
    backdropFilter: 'blur(12px)',
  },
  logoLingoGlow: {
    fontSize: 46,
    fontWeight: '900',
    color: '#7C3AED',
    letterSpacing: 1.5,
    textShadowColor: '#a78bfa',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 16,
    marginBottom: 0,
  },
  logoSparkGlow: {
    fontSize: 46,
    fontWeight: '900',
    color: '#F59E42',
    letterSpacing: 1.5,
    textShadowColor: '#F59E42',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 16,
    marginBottom: 0,
  },
  subtitle: {
    fontSize: 18,
    color: '#F59E42',
    marginTop: 12,
    marginBottom: 24,
    textAlign: 'center',
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#a78bfa55',
    borderRadius: 12,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    marginBottom: 18,
    width: 260,
    shadowColor: '#7C3AED',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    transition: 'border-color 0.2s',
  },
  inputWrapperActive: {
    borderColor: '#7C3AED',
    shadowOpacity: 0.18,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    backgroundColor: 'transparent',
    color: '#232136',
    paddingHorizontal: 0,
  },
  gradientBtn: {
    width: 260,
    borderRadius: 14,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#F59E42',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  gradientBtnBg: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 14,
    width: '100%',
  },
  gradientBtnText: {
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