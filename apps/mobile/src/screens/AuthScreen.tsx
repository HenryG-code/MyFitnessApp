import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { supabase } from "../lib/supabase";
import { radius, theme } from "../lib/theme";

export function AuthScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isWorking, setIsWorking] = useState(false);
  const [error, setError] = useState("");

  async function signIn() {
    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }

    setIsWorking(true);
    setError("");

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setIsWorking(false);
    }
    // Success: the App-level auth listener swaps screens.
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.brandRow}>
        <View style={styles.brandMark}>
          <Text style={styles.brandMarkText}>LF</Text>
        </View>
        <View>
          <Text style={styles.brandName}>LogFit</Text>
          <Text style={styles.brandTag}>PERFORMANCE OS</Text>
        </View>
      </View>

      <Text style={styles.title}>Sign in</Text>
      <Text style={styles.subtitle}>
        Use your existing LogFit account. The mobile app syncs health data into
        the same dashboard.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={theme.inkDim}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor={theme.inkDim}
        secureTextEntry
        autoComplete="current-password"
        value={password}
        onChangeText={setPassword}
        onSubmitEditing={signIn}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        onPress={signIn}
        disabled={isWorking}
        accessibilityRole="button"
      >
        {isWorking ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>SIGN IN</Text>
        )}
      </Pressable>

      <Text style={styles.footnote}>
        No account yet? Register on the LogFit web app first.
      </Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.background,
    padding: 24,
    justifyContent: "center",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 32,
  },
  brandMark: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: theme.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  brandMarkText: { color: "#fff", fontWeight: "900", fontSize: 16 },
  brandName: {
    color: theme.ink,
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  brandTag: {
    color: theme.inkDim,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  title: {
    color: theme.ink,
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  subtitle: {
    color: theme.muted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
    marginBottom: 24,
  },
  input: {
    backgroundColor: theme.card,
    borderColor: theme.line,
    borderWidth: 1,
    borderRadius: radius.md,
    color: theme.ink,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    marginBottom: 10,
  },
  error: {
    color: theme.strain,
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 8,
  },
  button: {
    backgroundColor: theme.accent,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  buttonText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 14,
    letterSpacing: 1,
  },
  footnote: {
    color: theme.inkDim,
    fontSize: 12,
    textAlign: "center",
    marginTop: 20,
  },
});
