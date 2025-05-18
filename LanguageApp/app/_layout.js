import { Stack } from "expo-router";
import React from "react";
import { ThemeProvider } from '../context/ThemeContext';

export default function RootLayout({ children }) {
  return (
    <ThemeProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        {children}
      </Stack>
    </ThemeProvider>
  );
} 