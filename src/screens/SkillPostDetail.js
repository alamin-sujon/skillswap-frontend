import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Button, Surface } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE = "http://localhost:3000";

const SkillPostDetail = ({ route, navigation }) => {
  const { post: initialPost } = route.params || {};
  const [post, setPost] = useState(initialPost);
  const [loading, setLoading] = useState(!initialPost);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [sendingMatch, setSendingMatch] = useState(false);

  const skillId = post?.id || route.params?.id;

  // Load current user
  const loadCurrentUser = async () => {
    try {
      const userDataString = await AsyncStorage.getItem("userData");
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        const userId = userData.id || userData.userId;
        setCurrentUserId(userId);
      }
    } catch (err) {
      console.error("Failed to load user data:", err);
    }
  };

  // Fetch full details
  const fetchSkillDetail = async () => {
    if (!skillId) return;
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");

      const response = await fetch(`${API_BASE}/skills/${skillId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to load details");
      const data = await response.json();
      setPost(data);
    } catch (err) {
      setError(err.message);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to load skill",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCurrentUser();
    if (!initialPost && skillId) fetchSkillDetail();
  }, [skillId]);

  const isOwner = currentUserId && post?.userId === currentUserId;

  // Send Match Request
  const sendMatchRequest = async () => {
    console.log("JJJJJJJ");
    if (!skillId) return;

    setSendingMatch(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Please login again");

      const response = await fetch(`${API_BASE}/matches`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          skillPostId: skillId,
        }),
      });
      console.log({ response });
      if (response.ok) {
        Toast.show({
          type: "success",
          text1: "Request Sent!",
          text2: "Your match request has been sent successfully.",
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to send request");
      }
    } catch (err) {
      console.error(err);
      Toast.show({
        type: "error",
        text1: "Request Failed",
        text2: err.message || "Something went wrong",
      });
    } finally {
      setSendingMatch(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={styles.loadingText}>Loading skill details...</Text>
      </View>
    );
  }

  if (error || !post) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error || "Skill not found"}</Text>
        <Button mode="contained" onPress={() => navigation.goBack()}>
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.headerCard}>
        <View style={styles.userHeader}>
          <Image
            source={{
              uri: post.user?.avatarUrl || "https://via.placeholder.com/80",
            }}
            style={styles.bigAvatar}
          />
          <View style={styles.userInfo}>
            <Text style={styles.displayName}>
              {post.user?.displayName || post.user?.fullName || "Anonymous"}
            </Text>
            <Text style={styles.userRole}>
              {post.user?.university || post.user?.role || ""}
            </Text>
          </View>
        </View>

        <View style={styles.typeContainer}>
          <View
            style={[
              styles.typeBadge,
              {
                backgroundColor: post.type === "TEACH" ? "#22c55e" : "#f59e0b",
              },
            ]}
          >
            <Text style={styles.typeText}>{post.type}</Text>
          </View>
        </View>
      </Surface>

      <View style={styles.content}>
        <Text style={styles.title}>{post.title}</Text>
        <Text style={styles.category}>{post.category}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{post.description}</Text>
        </View>

        {post.availability && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Availability</Text>
            <Text style={styles.availability}>{post.availability}</Text>
          </View>
        )}

        {post.preferredFormat && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferred Format</Text>
            <Text style={styles.format}>
              {post.preferredFormat.replace("_", " ")}
            </Text>
          </View>
        )}

        {post.tags?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tags</Text>
            <View style={styles.tagsContainer}>
              {post.tags.map((tag, i) => (
                <View key={i} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        {!isOwner && (
          <Button
            mode="contained"
            buttonColor="#4f46e5"
            textColor="#ffffff"
            style={styles.mainButton}
            icon="handshake"
            loading={sendingMatch}
            disabled={sendingMatch}
            onPress={sendMatchRequest}
          >
            Send Match Request
          </Button>
        )}

        {isOwner && (
          <>
            <Button mode="outlined" icon="pencil" style={styles.mainButton}>
              Edit Post
            </Button>
            <Button
              mode="outlined"
              textColor="#ef4444"
              icon="trash-outline"
              onPress={() => navigation.goBack()} // You can connect delete later
            >
              Delete Post
            </Button>
          </>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerCard: {
    backgroundColor: "white",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  userHeader: { flexDirection: "row", alignItems: "center" },
  bigAvatar: { width: 80, height: 80, borderRadius: 40, marginRight: 16 },
  userInfo: { flex: 1 },
  displayName: { fontSize: 22, fontWeight: "700", color: "#1e2937" },
  userRole: { color: "#64748b", fontSize: 15 },

  typeContainer: { marginTop: 16, alignSelf: "flex-start" },
  typeBadge: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 30 },
  typeText: { color: "white", fontWeight: "700", fontSize: 15 },

  content: { padding: 20 },
  title: { fontSize: 26, fontWeight: "700", color: "#1e2937", marginBottom: 6 },
  category: { fontSize: 18, color: "#4f46e5", marginBottom: 20 },

  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 8,
  },
  description: { fontSize: 16, lineHeight: 24, color: "#475569" },
  availability: { fontSize: 16, color: "#1e2937" },
  format: { fontSize: 16, color: "#1e2937", textTransform: "capitalize" },

  tagsContainer: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  tag: {
    backgroundColor: "#e0e7ff",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tagText: { color: "#4f46e5", fontWeight: "500" },

  actionButtons: { padding: 20, gap: 12, paddingBottom: 40 },
  mainButton: { borderRadius: 12, paddingVertical: 6 },
  loadingText: { marginTop: 12, color: "#64748b" },
  errorText: { color: "red", marginBottom: 20 },
});

export default SkillPostDetail;
