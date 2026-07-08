import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";

const API_BASE = "http://localhost:3000";

const MatchesScreen = ({ navigation }) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Load current user ID (as per your requirement)
  const loadCurrentUser = async () => {
    try {
      const userDataStr = await AsyncStorage.getItem("userData");
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        setCurrentUserId(userData?.id);
      }
    } catch (error) {
      console.log("Error loading current user:", error);
    }
  };

  const getToken = async () => {
    return await AsyncStorage.getItem("authToken");
  };

  const loadMatches = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getToken();

      if (!token) {
        Toast.show({
          type: "error",
          text1: "Authentication Error",
          text2: "Please login again.",
        });
        return;
      }

      const response = await fetch(`${API_BASE}/matches`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: data.message || "Failed to load matches.",
        });
        setMatches([]);
        return;
      }

      setMatches(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log("Load Matches Error:", error);
      Toast.show({
        type: "error",
        text1: "Network Error",
        text2: "Unable to load matches.",
      });
      setMatches([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadCurrentUser();
    loadMatches();
  }, [loadMatches]);

  const onRefresh = () => {
    setRefreshing(true);
    loadMatches();
  };

  // Accept Match
  const handleAccept = async (matchId) => {
    Alert.alert("Accept Match", "Are you sure you want to accept this match?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Accept",
        onPress: async () => {
          setProcessingId(matchId);
          try {
            const token = await getToken();
            const response = await fetch(`${API_BASE}/matches/${matchId}/accept`, {
              method: "PATCH",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            });

            if (response.ok) {
              Toast.show({
                type: "success",
                text1: "Success",
                text2: "Match accepted! 🎉",
              });
              loadMatches();
            } else {
              const errorData = await response.json().catch(() => ({}));
              Toast.show({
                type: "error",
                text1: "Failed",
                text2: errorData.message || "Could not accept match.",
              });
            }
          } catch (error) {
            Toast.show({
              type: "error",
              text1: "Error",
              text2: "Something went wrong.",
            });
          } finally {
            setProcessingId(null);
          }
        },
      },
    ]);
  };

  // Reject Match
  const handleReject = async (matchId) => {
    Alert.alert("Reject Match", "Are you sure you want to reject this match?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reject",
        style: "destructive",
        onPress: async () => {
          setProcessingId(matchId);
          try {
            const token = await getToken();
            const response = await fetch(`${API_BASE}/matches/${matchId}/reject`, {
              method: "PATCH",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            });

            if (response.ok) {
              Toast.show({
                type: "success",
                text1: "Rejected",
                text2: "Match has been rejected.",
              });
              loadMatches();
            } else {
              const errorData = await response.json().catch(() => ({}));
              Toast.show({
                type: "error",
                text1: "Failed",
                text2: errorData.message || "Could not reject match.",
              });
            }
          } catch (error) {
            Toast.show({
              type: "error",
              text1: "Error",
              text2: "Something went wrong.",
            });
          } finally {
            setProcessingId(null);
          }
        },
      },
    ]);
  };

  const renderMatch = ({ item }) => {
    const isPending = item.status?.toLowerCase() === "pending";
    const isProcessing = processingId === item.id;

    // Only userB (receiver) can accept or reject
    const isReceiver = currentUserId && item.userBId === currentUserId;

    return (
      <View style={styles.card}>
        <Image
          source={{
            uri: item?.userB?.avatarUrl || "https://via.placeholder.com/80",
          }}
          style={styles.avatar}
        />

        <View style={styles.info}>
          <Text style={styles.name}>
            {item?.userB?.fullName || "Unknown User"}
          </Text>

          <Text style={styles.skill}>
            {item?.skillPost?.title || "No Skill"}
          </Text>

          <Text style={styles.status}>
            Status: {item?.status || "Pending"}
          </Text>

          {/* Accept & Reject - Only visible to userB */}
          {isPending && isReceiver && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.button, styles.acceptButton]}
                onPress={() => handleAccept(item.id)}
                disabled={isProcessing}
              >
                <Text style={styles.buttonText}>
                  {isProcessing ? "Processing..." : "✅ Accept"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.rejectButton]}
                onPress={() => handleReject(item.id)}
                disabled={isProcessing}
              >
                <Text style={styles.buttonText}>❌ Reject</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Chat button for accepted matches */}
          {!isPending && (
            <TouchableOpacity
              style={styles.chatButton}
              onPress={() =>
                navigation.navigate("Conversation", {
                  conversationId: item.conversationId,
                })
              }
            >
              <Text style={styles.chatButtonText}>💬 Open Chat</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={{ marginTop: 10 }}>Loading Matches...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Matches</Text>

      <FlatList
        data={matches}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderMatch}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No Matches Yet</Text>
            <Text style={styles.emptyText}>
              Browse skill posts and send a request to connect.
            </Text>
          </View>
        }
      />
    </View>
  );
};

export default MatchesScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F6F9", padding: 16 },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 20, color: "#111827" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 15,
    marginBottom: 14,
    flexDirection: "row",
    elevation: 2,
  },
  avatar: { width: 65, height: 65, borderRadius: 32, backgroundColor: "#ddd" },
  info: { flex: 1, marginLeft: 15 },
  name: { fontSize: 18, fontWeight: "700", color: "#111827" },
  skill: { marginTop: 4, color: "#6B7280", fontSize: 15 },
  status: { marginTop: 6, color: "#16A34A", fontWeight: "600" },
  actionButtons: { flexDirection: "row", marginTop: 12, gap: 10 },
  button: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: "center" },
  acceptButton: { backgroundColor: "#16A34A" },
  rejectButton: { backgroundColor: "#EF4444" },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  chatButton: {
    marginTop: 12,
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  chatButtonText: { color: "#fff", fontWeight: "600" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  empty: { alignItems: "center", marginTop: 100 },
  emptyTitle: { fontSize: 22, fontWeight: "bold", color: "#374151" },
  emptyText: { marginTop: 10, color: "#6B7280", textAlign: "center", fontSize: 15 },
});