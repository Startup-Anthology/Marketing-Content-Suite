import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import Colors from "@/constants/colors";
import { fonts, spacing, radius } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";

const c = Colors.light;

export default function LoginScreen() {
  const { login, signup } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    if (isSignup && password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    try {
      if (isSignup) {
        await signup(email.trim(), password, displayName.trim());
      } else {
        await login(email.trim(), password);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      Alert.alert("Error", message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.iconWrap}>
            <MaterialCommunityIcons name="book-open-variant" size={40} color={c.tint} />
          </View>
          <Text style={styles.appName}>Marketing Studio</Text>
          <Text style={styles.tagline}>Build. Ship. Grow. Repeat.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{isSignup ? "Create Account" : "Welcome Back"}</Text>
          <Text style={styles.cardSubtitle}>
            {isSignup ? "Sign up to get started" : "Sign in to your account"}
          </Text>

          {isSignup && (
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Display Name</Text>
              <View style={styles.inputWrap}>
                <Feather name="user" size={16} color={c.textMuted} />
                <TextInput
                  style={styles.input}
                  value={displayName}
                  onChangeText={setDisplayName}
                  placeholder="Your name"
                  placeholderTextColor={c.textMuted}
                  autoCapitalize="words"
                />
              </View>
            </View>
          )}

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrap}>
              <Feather name="mail" size={16} color={c.textMuted} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor={c.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrap}>
              <Feather name="lock" size={16} color={c.textMuted} />
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder={isSignup ? "Min. 6 characters" : "Your password"}
                placeholderTextColor={c.textMuted}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <Pressable onPress={() => setShowPassword(!showPassword)}>
                <Feather name={showPassword ? "eye-off" : "eye"} size={16} color={c.textMuted} />
              </Pressable>
            </View>
          </View>

          <Pressable
            style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.submitBtnText}>
                {isSignup ? "Create Account" : "Sign In"}
              </Text>
            )}
          </Pressable>

          <View style={styles.switchRow}>
            <Text style={styles.switchText}>
              {isSignup ? "Already have an account?" : "Don't have an account?"}
            </Text>
            <Pressable onPress={() => setIsSignup(!isSignup)}>
              <Text style={styles.switchLink}>
                {isSignup ? "Sign In" : "Sign Up"}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxxl,
  },
  header: {
    alignItems: "center",
    marginBottom: spacing.xxxl,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: radius.xl,
    backgroundColor: c.tint + "15",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  appName: {
    fontFamily: fonts.bold,
    fontSize: 28,
    color: c.text,
    marginBottom: spacing.xs,
  },
  tagline: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: c.tint,
  },
  card: {
    backgroundColor: c.surface,
    borderRadius: radius.xl,
    padding: spacing.xxl,
    borderWidth: 1,
    borderColor: c.border,
  },
  cardTitle: {
    fontFamily: fonts.bold,
    fontSize: 22,
    color: c.text,
    marginBottom: spacing.xs,
  },
  cardSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: c.textSecondary,
    marginBottom: spacing.xxl,
  },
  fieldGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: c.textSecondary,
    marginBottom: spacing.sm,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: c.inputBg,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: c.border,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: c.text,
    paddingVertical: spacing.md,
  },
  submitBtn: {
    backgroundColor: c.tint,
    borderRadius: radius.md,
    paddingVertical: spacing.md + 2,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: "#FFF",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.lg,
  },
  switchText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: c.textSecondary,
  },
  switchLink: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: c.tint,
  },
});
