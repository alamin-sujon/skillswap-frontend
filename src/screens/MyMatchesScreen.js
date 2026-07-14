import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Dimensions,
} from "react-native";
import { Button, Surface } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

const API_BASE = "http://localhost:3000";

const MyMatchesScreen = ({ navigation }) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  const loadCurrentUser = async () => {
    try {
      const userDataString = await AsyncStorage.getItem("userData");
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        console.log([userData]);
        setCurrentUserId(userData?.id || userData.userId);
      }
    } catch (err) {
      console.error("Failed to load user:", err);
    }
  };

  const getToken = async () => {
    return await AsyncStorage.getItem("authToken");
  };

  const fetchMatches = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      else setRefreshing(true);

      const token = await getToken();
      if (!token) throw new Error("No token found");

      const response = await fetch(`${API_BASE}/matches`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch matches");

      const data = await response.json();
      setMatches(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to load matches",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadCurrentUser();
    fetchMatches();
  }, [currentUserId]);

  const onRefresh = () => fetchMatches(true);

  const handleAction = async (matchId, action) => {
    console.log({ matchId, action });

    try {
      const token = await getToken();
      if (!token) throw new Error("No token");

      const response = await fetch(`${API_BASE}/matches/${matchId}/${action}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log({ response });
      if (response.ok) {
        Toast.show({
          type: "success",
          text1: action === "accept" ? "Accepted!" : "Rejected!",
          text2:
            action === "accept"
              ? "Match request accepted successfully."
              : "Match request rejected successfully.",
        });

        fetchMatches(true);
      } else {
        throw new Error("Failed to update match");
      }
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Failed",
        text2: err.message || "Something went wrong",
      });
    }
  };

  const renderMatch = ({ item }) => {
    if (!currentUserId) return null;

    const isIncoming = item.userBId === currentUserId;
    const isPending = item.status === "PENDING";
    const otherUser = isIncoming ? item.userA : item.userB;

    return (
      <Surface style={styles.card} elevation={4}>
        <View style={styles.cardContent}>
          {/* Header */}
          <View style={styles.header}>
            <Image
              source={{
                uri: otherUser?.avatarUrl || "https://via.placeholder.com/60",
              }}
              style={styles.avatar}
            />

            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {otherUser?.displayName ||
                  otherUser?.fullName ||
                  "Unknown User"}
              </Text>
              <Text style={styles.actionType}>
                {isIncoming
                  ? "sent you a match request"
                  : "requested to learn from you"}
              </Text>
            </View>

            <View style={styles.statusContainer}>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      item.status === "PENDING"
                        ? "#fef3c7"
                        : item.status === "ACCEPTED"
                          ? "#d1fae5"
                          : "#fee2e2",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    {
                      color:
                        item.status === "PENDING"
                          ? "#d97706"
                          : item.status === "ACCEPTED"
                            ? "#10b981"
                            : "#ef4444",
                    },
                  ]}
                >
                  {item.status}
                </Text>
              </View>
            </View>
          </View>

          {/* Skill Details */}
          <View style={styles.skillSection}>
            <View style={styles.skillHeader}>
              <Ionicons
                name="color-palette-outline"
                size={24}
                color="#6366f1"
              />
              <Text style={styles.skillTitle}>{item.skillPost?.title}</Text>
            </View>
            <Text style={styles.skillCategory}>
              {item.skillPost?.category} • {item.skillPost?.type}
            </Text>
          </View>

          {/* Action Buttons - Smaller & Improved Colors */}
          {isPending && isIncoming && (
            <View style={styles.actionButtons}>
              <Button
                mode="contained"
                buttonColor="#22c55e"
                style={styles.acceptBtn}
                labelStyle={styles.buttonLabel}
                icon="checkmark-circle-outline"
                onPress={() => handleAction(item.id, "accept")}
              >
                Accept
              </Button>

              <Button
                mode="outlined"
                textColor="#ef4444"
                style={styles.rejectBtn}
                labelStyle={styles.buttonLabel}
                icon="close-circle-outline"
                onPress={() => handleAction(item.id, "reject")}
              >
                Reject
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
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading your matches...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerTop}>
        <Text style={styles.appTitle}>My Matches</Text>
      </View>

      <FlatList
        data={matches}
        keyExtractor={(item) => item.id}
        renderItem={renderMatch}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#6366f1"]}
          />
        }
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="handshake-outline" size={90} color="#e2e8f0" />
            <Text style={styles.emptyText}>No matches yet</Text>
            <Text style={styles.emptySubtext}>
              Your skill exchange requests will appear here
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

  /* Card Styles */
  card: {
    marginBottom: 18,
    borderRadius: 22,
    backgroundColor: "white",
    overflow: "hidden",
  },
  cardContent: {
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 62,
    height: 62,
    borderRadius: 31,
    marginRight: 14,
    borderWidth: 3,
    borderColor: "#f1f5f9",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e2937",
  },
  actionType: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 2,
  },
  statusContainer: {
    alignItems: "flex-end",
  },
  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 30,
  },
  statusText: {
    fontWeight: "700",
    fontSize: 13,
    textTransform: "uppercase",
  },

  /* Skill Section */
  skillSection: {
    backgroundColor: "#f8fafc",
    padding: 18,
    borderRadius: 18,
    marginBottom: 20,
  },
  skillHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  skillTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1e2937",
    marginLeft: 12,
    flex: 1,
  },
  skillCategory: {
    fontSize: 14.5,
    color: "#64748b",
    marginLeft: 36,
  },

  /* Smaller Buttons */
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  acceptBtn: {
    flex: 1,
    borderRadius: 12,
    height: 46,
    justifyContent: "center",
  },
  rejectBtn: {
    flex: 1,
    borderRadius: 12,
    height: 46,
    justifyContent: "center",
    borderWidth: 1.8,
    borderColor: "#ef4444",
  },
  buttonLabel: {
    fontSize: 15,
    fontWeight: "600",
  },

  /* Loading & Empty */
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

export default MyMatchesScreen;
