import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Redirect, Stack, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, Platform, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

SplashScreen.preventAutoHideAsync();

if (Platform.OS === "web" && typeof window !== "undefined" && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { user, isLoading } = useAuth();
  const { colors: c, isDark } = useTheme();
  const segments = useSegments();

  const isOnLoginPage = segments[0] === "login";

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: c.background, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={c.tint} />
      </View>
    );
  }

  if (!user && !isOnLoginPage) {
    return <Redirect href="/login" />;
  }

  if (user && isOnLoginPage) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack
      screenOptions={{
        headerBackTitle: "Back",
        headerStyle: { backgroundColor: c.background },
        headerTintColor: c.text,
        contentStyle: { backgroundColor: c.background },
      }}
    >
      <Stack.Screen
        name="login"
        options={{
          headerShown: false,
          animation: "none",
        }}
      />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="create-content"
        options={{
          title: "New Content",
          presentation: "modal",
          headerStyle: { backgroundColor: c.surface },
        }}
      />
      <Stack.Screen
        name="create-storyboard"
        options={{
          title: "New Storyboard",
          presentation: "modal",
          headerStyle: { backgroundColor: c.surface },
        }}
      />
      <Stack.Screen
        name="create-post"
        options={{
          title: "Schedule Post",
          presentation: "modal",
          headerStyle: { backgroundColor: c.surface },
        }}
      />
      <Stack.Screen
        name="podcast-generator"
        options={{
          title: "Podcast Generator",
          presentation: "modal",
          headerStyle: { backgroundColor: c.surface },
        }}
      />
      <Stack.Screen
        name="interview-prep"
        options={{
          title: "Interview Prep",
          presentation: "modal",
          headerStyle: { backgroundColor: c.surface },
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          title: "Settings",
          presentation: "modal",
          headerStyle: { backgroundColor: c.background },
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <AuthProvider>
              <GestureHandlerRootView>
                <KeyboardProvider>
                  <ThemedStatusBar />
                  <RootLayoutNav />
                </KeyboardProvider>
              </GestureHandlerRootView>
            </AuthProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

function ThemedStatusBar() {
  const { isDark } = useTheme();
  return <StatusBar style={isDark ? "light" : "dark"} />;
}
