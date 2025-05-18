import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';
import { useRouter } from 'expo-router';

function LoginScreen() {
  const router = useRouter();

  // Farklı redirect URI'ları konsola yazdır
  console.log('Expo AuthSession redirect URI (useProxy: true):', AuthSession.makeRedirectUri({ useProxy: true }));
  console.log('Expo AuthSession redirect URI (useProxy: false):', AuthSession.makeRedirectUri({ useProxy: false }));

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: '749203092396-m7lavindhl4gc1q38389f8c6a58e5big.apps.googleusercontent.com',
    androidClientId: '749203092396-0gfjd8k0fbhc6tt8c2hj80f3k2q310s7.apps.googleusercontent.com',
    iosClientId: '749203092396-m7lavindhl4gc1q38389f8c6a58e5big.apps.googleusercontent.com',
    useProxy: true,
    // redirectUri: AuthSession.makeRedirectUri(), // Elle belirtmiyoruz
  });

  const handleLogin = () => {
    router.replace('/home');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sade Login Ekranı</Text>
      <Button title="Google ile Giriş Yap" onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333'
  }
});

export default LoginScreen;