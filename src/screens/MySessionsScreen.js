import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { Surface, Button, Card } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";

const API_BASE = "http://localhost:3000";

const MySessionsScreen = ({ navigation }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  const loadCurrentUser = async () => {
    try {
      const userDataString = await AsyncStorage.getItem("userData");
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        setCurrentUserId(userData?.id || userData.userId);
      }
    } catch (err) {
      console.error("Failed to load user:", err);
    }
  };

  const fetchSessions = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      else setRefreshing(true);

      const token = await AsyncStorage.getItem("authToken");
      if (!token) throw new Error("No token found");

      const response = await fetch(`${API_BASE}/sessions`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch sessions");

      const data = await response.json();
      setSessions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to load sessions",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadCurrentUser();
    fetchSessions();
  }, []);

  const onRefresh = () => fetchSessions(true);

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      }) +
      " • " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "#f59e0b";
      case "CONFIRMED":
        return "#22c55e";
      case "COMPLETED":
        return "#3b82f6";
      case "CANCELLED":
        return "#ef4444";
      default:
        return "#64748b";
    }
  };

  const renderSession = ({ item }) => {
    const otherParticipant = item.participants?.find(
      (p) => p.userId !== currentUserId,
    )?.user;

    const isUpcoming = new Date(item.date) > new Date();

    return (
      <Surface style={styles.card} elevation={4}>
        <View style={styles.cardContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.dateContainer}>
              <Ionicons name="calendar" size={28} color="#4f46e5" />
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.date}>{formatDateTime(item.date)}</Text>
                {item.durationMinutes && (
                  <Text style={styles.duration}>
                    {item.durationMinutes} minutes
                  </Text>
                )}
              </View>
            </View>

            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(item.status) + "20" },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: getStatusColor(item.status) },
                ]}
              >
                {item.status}
              </Text>
            </View>
          </View>

          {/* Skill Title */}
          <Text style={styles.title}>{item.title}</Text>

          {/* Format & Location */}
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="videocam" size={20} color="#64748b" />
              <Text style={styles.infoText}>{item.format}</Text>
            </View>
            {item.location && (
              <View style={styles.infoItem}>
                <Ionicons name="location" size={20} color="#64748b" />
                <Text style={styles.infoText}>{item.location}</Text>
              </View>
            )}
          </View>

          {/* Other Participant */}
          {otherParticipant && (
            <View style={styles.participant}>
              <Image
                source={{
                  uri:
                    otherParticipant.avatarUrl ||
                    "https://via.placeholder.com/45",
                }}
                style={styles.avatar}
              />
              <View>
                <Text style={styles.participantLabel}>With</Text>
                <Text style={styles.participantName}>
                  {otherParticipant.displayName || "Unknown User"}
                </Text>
              </View>
            </View>
          )}

          {/* Action Buttons for Upcoming Sessions */}
          {isUpcoming && item.status !== "CANCELLED" && (
            <View style={styles.actionButtons}>
              {item.meetingLink && (
                <Button
                  mode="contained"
                  buttonColor="#4f46e5"
                  icon="video"
                  style={styles.joinBtn}
                  onPress={() => {
                    // Open meeting link
                    console.log("Join meeting:", item.meetingLink);
                  }}
                >
                  Join Session
                </Button>
              )}
              <Button
                mode="outlined"
                textColor="#ef4444"
                style={styles.cancelBtn}
                onPress={() => {
                  // TODO: Add cancel session logic
                  Toast.show({
                    type: "info",
                    text1: "Cancel feature coming soon",
                  });
                }}
              >
                Cancel
              </Button>
            </View>
          )}
        </View>
      </Surface>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={styles.loadingText}>Loading your sessions...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerTop}>
        <Text style={styles.appTitle}>My Sessions</Text>
      </View>

      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id}
        renderItem={renderSession}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#4f46e5"]}
          />
        }
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="calendar-outline" size={80} color="#cbd5e1" />
            <Text style={styles.emptyText}>No sessions yet</Text>
            <Text style={styles.emptySubtext}>
              Your confirmed skill exchange sessions will appear here
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  headerTop: {
    padding: 20,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  appTitle: { fontSize: 28, fontWeight: "700", color: "#4f46e5" },

  list: { padding: 16 },

  card: {
    marginBottom: 18,
    borderRadius: 22,
    backgroundColor: "white",
    overflow: "hidden",
  },
  cardContent: { padding: 20 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  dateContainer: { flexDirection: "row", alignItems: "center" },
  date: { fontSize: 16, fontWeight: "700", color: "#1e2937" },
  duration: { fontSize: 14, color: "#64748b", marginTop: 2 },

  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: { fontWeight: "700", fontSize: 13, textTransform: "uppercase" },

  title: {
    fontSize: 19,
    fontWeight: "700",
    color: "#1e2937",
    marginBottom: 14,
    lineHeight: 26,
  },

  infoRow: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  infoText: {
    fontSize: 15,
    color: "#475569",
  },

  participant: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 16,
    marginBottom: 20,
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    marginRight: 12,
  },
  participantLabel: { fontSize: 13, color: "#64748b" },
  participantName: { fontSize: 16, fontWeight: "600", color: "#1e2937" },

  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  joinBtn: { flex: 1, borderRadius: 12 },
  cancelBtn: { flex: 1, borderRadius: 12 },

  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, color: "#64748b", fontSize: 16 },

  empty: { alignItems: "center", marginTop: 120 },
  emptyText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#64748b",
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 15,
    color: "#94a3b8",
    textAlign: "center",
    marginTop: 8,
  },
});

export default MySessionsScreen;
