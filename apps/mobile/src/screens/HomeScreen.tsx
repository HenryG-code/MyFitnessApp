import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  AppState,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { healthProvider } from "../health/provider";
import {
  clearLocalSyncState,
  defaultCategories,
  getLastSyncTime,
  getStoredGrantedCategories,
  storeGrantedCategories,
  syncHealthData,
} from "../health/sync";
import type { HealthAvailability } from "../health/types";
import { config } from "../lib/config";
import { supabase } from "../lib/supabase";
import { radius, theme } from "../lib/theme";

const platformName =
  Platform.OS === "ios" ? "Apple Health" : "Health Connect";

const permissionGroups = [
  { title: "ACTIVITY", items: "Steps · Distance · Active energy" },
  { title: "RECOVERY", items: "Sleep duration · Resting heart rate" },
  { title: "BODY", items: "Weight" },
  { title: "TRAINING", items: "Exercise sessions" },
];

function formatSyncTime(iso: string | null) {
  if (!iso) {
    return "Never";
  }

  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export function HomeScreen({ email }: { email: string | null }) {
  const [availability, setAvailability] =
    useState<HealthAvailability>("unavailable");
  const [isConnected, setIsConnected] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const syncingRef = useRef(false);

  const refreshState = useCallback(async () => {
    setAvailability(await healthProvider.getAvailability());
    const granted = await getStoredGrantedCategories();
    setIsConnected(granted.length > 0);
    setLastSync(await getLastSyncTime());
  }, []);

  useEffect(() => {
    refreshState();
  }, [refreshState]);

  const runSync = useCallback(async () => {
    if (syncingRef.current) {
      return;
    }

    syncingRef.current = true;
    setIsSyncing(true);
    setStatusMessage("");

    const result = await syncHealthData();

    if (result.status === "error") {
      setStatusMessage(result.message);
    } else {
      setLastSync(result.syncedAt);
      setStatusMessage(
        result.status === "ok"
          ? `Synced ${result.days} day${result.days === 1 ? "" : "s"} of data.`
          : "No new health data found."
      );
    }

    setIsSyncing(false);
    syncingRef.current = false;
  }, []);

  // Foreground sync: platform-honest incremental sync without background jobs.
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active" && isConnected) {
        runSync();
      }
    });

    return () => subscription.remove();
  }, [isConnected, runSync]);

  async function connect() {
    setStatusMessage("");
    const granted = await healthProvider.requestPermissions(defaultCategories);

    if (!granted.length) {
      setStatusMessage(
        `No permissions granted. You can change this anytime in ${platformName}.`
      );
      return;
    }

    await storeGrantedCategories(granted);
    setIsConnected(true);
    await runSync();
  }

  async function signOut() {
    await clearLocalSyncState();
    await supabase.auth.signOut();
  }

  function openWebPath(path: string) {
    Linking.openURL(`${config.webAppUrl}${path}`);
  }

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.brandRow}>
          <View style={styles.brandMark}>
            <Text style={styles.brandMarkText}>LF</Text>
          </View>
          <View>
            <Text style={styles.brandName}>LogFit</Text>
            {email ? <Text style={styles.brandTag}>{email}</Text> : null}
          </View>
        </View>
        <Pressable onPress={signOut} accessibilityRole="button">
          <Text style={styles.signOut}>Sign out</Text>
        </Pressable>
      </View>

      {/* Connection card */}
      <View style={styles.card}>
        {availability === "unavailable" ? (
          <>
            <Text style={styles.cardEyebrow}>CONNECTED HEALTH</Text>
            <Text style={styles.cardTitle}>Not available here</Text>
            <Text style={styles.cardBody}>
              {platformName} is not available on this device. LogFit still
              works fully with manual logging.
            </Text>
          </>
        ) : availability === "needs-install" ? (
          <>
            <Text style={styles.cardEyebrow}>CONNECTED HEALTH</Text>
            <Text style={styles.cardTitle}>Install Health Connect</Text>
            <Text style={styles.cardBody}>
              Health Connect needs to be installed or updated before LogFit can
              read your activity data.
            </Text>
            <Pressable
              style={({ pressed }) => [styles.primary, pressed && styles.pressed]}
              onPress={() =>
                Linking.openURL(
                  "market://details?id=com.google.android.apps.healthdata"
                )
              }
            >
              <Text style={styles.primaryText}>OPEN PLAY STORE</Text>
            </Pressable>
          </>
        ) : !isConnected ? (
          <>
            <Text style={styles.cardEyebrow}>CONNECTED HEALTH</Text>
            <Text style={styles.cardTitle}>Connect your health data</Text>
            <Text style={styles.cardBody}>
              Turn daily activity into a clearer picture of your performance.
              You choose exactly what LogFit can read — and it stays optional.
            </Text>

            <Pressable
              onPress={() => setShowDetails((current) => !current)}
              accessibilityRole="button"
            >
              <Text style={styles.detailToggle}>
                {showDetails ? "Hide details" : "What will LogFit access?"}
              </Text>
            </Pressable>

            {showDetails ? (
              <View style={styles.permissionList}>
                {permissionGroups.map((group) => (
                  <View key={group.title} style={styles.permissionRow}>
                    <Text style={styles.permissionTitle}>{group.title}</Text>
                    <Text style={styles.permissionItems}>{group.items}</Text>
                  </View>
                ))}
              </View>
            ) : null}

            <Pressable
              style={({ pressed }) => [styles.primary, pressed && styles.pressed]}
              onPress={connect}
            >
              <Text style={styles.primaryText}>
                CONNECT {platformName.toUpperCase()}
              </Text>
            </Pressable>
          </>
        ) : (
          <>
            <View style={styles.connectedRow}>
              <View>
                <Text style={styles.cardEyebrow}>
                  {platformName.toUpperCase()}
                </Text>
                <Text style={styles.connectedState}>Connected</Text>
              </View>
              <View style={styles.syncMeta}>
                <Text style={styles.syncLabel}>LAST SYNC</Text>
                <Text style={styles.syncValue}>{formatSyncTime(lastSync)}</Text>
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [styles.primary, pressed && styles.pressed]}
              onPress={runSync}
              disabled={isSyncing}
            >
              {isSyncing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryText}>SYNC NOW</Text>
              )}
            </Pressable>

            <Text style={styles.helpText}>
              Data syncs automatically when you open the app. Manage granted
              permissions in {platformName}.
            </Text>
          </>
        )}

        {statusMessage ? (
          <Text style={styles.status}>{statusMessage}</Text>
        ) : null}
      </View>

      {/* Dashboard link */}
      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.pressed]}
        onPress={() => openWebPath("/dashboard")}
      >
        <Text style={styles.cardEyebrow}>TODAY</Text>
        <Text style={styles.cardTitle}>Open your Command Centre</Text>
        <Text style={styles.cardBody}>
          Readiness, today's mission, and your synced metrics live in the
          LogFit dashboard.
        </Text>
      </Pressable>

      {/* Lifestyle */}
      <Text style={styles.sectionLabel}>LIFESTYLE</Text>
      <View style={styles.lifestyleRow}>
        {[
          { label: "Recipes", path: "/recipes" },
          { label: "Grocery List", path: "/grocery-list" },
          { label: "Meal Planner", path: "/meal-planner" },
        ].map((item) => (
          <Pressable
            key={item.path}
            style={({ pressed }) => [
              styles.lifestyleItem,
              pressed && styles.pressed,
            ]}
            onPress={() => openWebPath(item.path)}
            accessibilityRole="link"
          >
            <Text style={styles.lifestyleText}>{item.label}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.privacy}>
        Health data is read only with your permission, stored in your private
        LogFit account, and never shared or used for analytics. Guidance is
        fitness context, not medical advice.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.background },
  content: { padding: 20, paddingTop: 60, paddingBottom: 40, gap: 12 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  brandMark: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: theme.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  brandMarkText: { color: "#fff", fontWeight: "900", fontSize: 13 },
  brandName: {
    color: theme.ink,
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: -0.4,
  },
  brandTag: { color: theme.inkDim, fontSize: 11, fontWeight: "600" },
  signOut: { color: theme.muted, fontSize: 12, fontWeight: "700" },
  card: {
    backgroundColor: theme.card,
    borderColor: theme.line,
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: 18,
  },
  cardEyebrow: {
    color: theme.accentStrong,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.6,
  },
  cardTitle: {
    color: theme.ink,
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: -0.4,
    marginTop: 6,
  },
  cardBody: {
    color: theme.muted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },
  detailToggle: {
    color: theme.ink,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 12,
  },
  permissionList: { marginTop: 10, gap: 8 },
  permissionRow: {
    backgroundColor: theme.surface,
    borderRadius: radius.md,
    padding: 10,
  },
  permissionTitle: {
    color: theme.inkDim,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.4,
  },
  permissionItems: {
    color: theme.ink,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 3,
  },
  primary: {
    backgroundColor: theme.accent,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 14,
  },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  primaryText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 13,
    letterSpacing: 1,
  },
  connectedRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  connectedState: {
    color: theme.ready,
    fontSize: 20,
    fontWeight: "900",
    marginTop: 4,
  },
  syncMeta: { alignItems: "flex-end" },
  syncLabel: {
    color: theme.inkDim,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.4,
  },
  syncValue: { color: theme.ink, fontSize: 13, fontWeight: "800", marginTop: 3 },
  helpText: { color: theme.inkDim, fontSize: 11, lineHeight: 16, marginTop: 10 },
  status: {
    color: theme.muted,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 10,
    backgroundColor: theme.surface,
    borderRadius: radius.md,
    padding: 10,
  },
  sectionLabel: {
    color: theme.inkDim,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.6,
    marginTop: 6,
    marginLeft: 4,
  },
  lifestyleRow: { flexDirection: "row", gap: 8 },
  lifestyleItem: {
    flex: 1,
    backgroundColor: theme.card,
    borderColor: theme.line,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingVertical: 16,
    alignItems: "center",
  },
  lifestyleText: { color: theme.ink, fontSize: 12, fontWeight: "800" },
  privacy: {
    color: theme.inkDim,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 8,
    paddingHorizontal: 4,
  },
});
