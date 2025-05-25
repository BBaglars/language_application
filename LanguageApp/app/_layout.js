import { Stack } from "expo-router";
import React, { useEffect } from "react";
import { ThemeProvider } from '../context/ThemeContext';
import { StatusBar, useColorScheme, View, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GameSettingsProvider } from '../context/GameSettingsContext';
import { UserProvider, useUser } from '../context/UserContext';
import { useRouter, usePathname } from 'expo-router';
import { PaperProvider } from 'react-native-paper';

function AuthGuard({ children }) {
  const { user, token, loading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && (!user || !token) && pathname !== '/login') {
      router.replace('/login');
    }
  }, [user, token, pathname, loading]);

  if (loading) {
    return (
      <View style={{flex:1,justifyContent:'center',alignItems:'center',height:'100%'}}>
        <ActivityIndicator size="large" color="#7C3AED" />
        <Text style={{marginTop: 12, color: '#7C3AED', fontWeight: 'bold'}}>Yükleniyor...</Text>
      </View>
    );
  }

  if (!user || !token) {
    if (pathname === '/login') {
      return children;
    }
    return null;
  }

  return children;
}

export default function RootLayout({ children }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  return (
    <PaperProvider>
    <ThemeProvider>
      <GameSettingsProvider>
        <UserProvider>
          <AuthGuard>
            <SafeAreaView
              style={{ flex: 1, backgroundColor: isDark ? '#18181b' : '#fff' }}
              edges={['top', 'bottom', 'left', 'right']}
            >
          <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={isDark ? '#18181b' : '#fff'} />
    <Stack
      screenOptions={{
        headerShown: false,
      }}
          >
            {children}
          </Stack>
        </SafeAreaView>
          </AuthGuard>
        </UserProvider>
      </GameSettingsProvider>
    </ThemeProvider>
    </PaperProvider>
  );
} 