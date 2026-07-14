import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { Card, Button, Surface, FAB } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";

const API_BASE = "http://localhost:3000";

const MySkillPostScreen = ({ navigation }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchMySkills = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      else setRefreshing(true);

      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No authentication token found.");

      const response = await fetch(`${API_BASE}/skills/my`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to load your skills");

      const data = await response.json();
      setPosts(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMySkills();
  }, []);

  const onRefresh = () => fetchMySkills(true);

  const handleDelete = async (skillId) => {
    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        Toast.show({
          type: "error",
          text1: "Authentication Error",
          text2: "Please login again",
        });
        return;
      }

      console.log(`🗑️ Deleting skill with ID: ${skillId}`);

      const response = await fetch(`${API_BASE}/skills/${skillId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      console.log({ response });
      if (response.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== skillId));

        Toast.show({
          type: "success",
          text1: "Deleted",
          text2: "Skill deleted successfully.",
        });

        setTimeout(() => fetchMySkills(true), 600);
      } else {
        Toast.show({
          type: "error",
          text1: "Delete Failed",
          text2: "Failed to delete skill.",
        });
      }
    } catch (err) {
      console.error(err);

      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Could not delete skill.",
      });
    }
  };
  const renderPost = ({ item }) => (
    <Surface style={styles.card} elevation={4}>
      <Card.Content style={styles.cardContent}>
        <View style={styles.header}>
          <Image
            source={{
              uri: item.user?.avatarUrl || "https://via.placeholder.com/52",
            }}
            style={styles.avatar}
          />
          <View style={styles.userInfo}>
            <Text style={styles.name}>{item.user?.displayName || "You"}</Text>
            <Text style={styles.category}>{item.category}</Text>
          </View>

          <View
            style={[
              styles.typeBadge,
              {
                backgroundColor: item.type === "TEACH" ? "#22c55e" : "#f59e0b",
              },
            ]}
          >
            <Text style={styles.typeText}>{item.type}</Text>
          </View>
        </View>

        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description} numberOfLines={3}>
          {item.description}
        </Text>

        <View style={styles.tags}>
          {item.tags?.slice(0, 3).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>
      </Card.Content>

      <Card.Actions style={styles.cardActions}>
        <Button
          mode="contained"
          buttonColor="#4f46e5"
          textColor="white"
          onPress={() => navigation.navigate("SkillPostDetail", { post: item })}
          style={styles.viewButton}
        >
          View Details
        </Button>

        <Button
          mode="outlined"
          textColor="#ef4444"
          onPress={() => handleDelete(item.id)}
          style={styles.deleteButton}
        >
          Delete
        </Button>
      </Card.Actions>
    </Surface>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={styles.loadingText}>Loading your skills...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topHeader}>
        <Text style={styles.appTitle}>My Skill Posts</Text>
      </View>

      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id?.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#4f46e5"]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="book-outline" size={60} color="#cbd5e1" />
            <Text style={styles.emptyText}>
              {error ? error : "You haven't posted any skills yet."}
            </Text>
            <Button
              mode="contained"
              buttonColor="#4f46e5"
              onPress={() => navigation.goBack()}
              style={{ marginTop: 20 }}
            >
              Browse All Skills
            </Button>
          </View>
        }
      />

      <FAB
        icon="plus"
        style={styles.fab}
        color="white"
        onPress={() => navigation.navigate("Home")}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  topHeader: {
    padding: 20,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  appTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#4f46e5",
  },
  list: { padding: 16 },
  card: {
    marginBottom: 18,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "white",
  },
  cardContent: { padding: 20 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 14,
    borderWidth: 3,
    borderColor: "#e0e7ff",
  },
  userInfo: { flex: 1 },
  name: { fontSize: 17, fontWeight: "700", color: "#1e2937" },
  category: { color: "#64748b", fontSize: 13.5, marginTop: 2 },

  typeBadge: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20 },
  typeText: { color: "white", fontSize: 13, fontWeight: "700" },

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e2937",
    marginBottom: 10,
    lineHeight: 26,
  },
  description: { color: "#475569", lineHeight: 22, marginBottom: 16 },

  tags: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: {
    backgroundColor: "#e0e7ff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tagText: { color: "#4f46e5", fontSize: 13, fontWeight: "500" },

  cardActions: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: "row",
    gap: 12,
  },
  viewButton: { flex: 1, borderRadius: 12 },
  deleteButton: { flex: 1, borderRadius: 12 },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 17,
    color: "#64748b",
    textAlign: "center",
    marginTop: 16,
  },
  loadingText: { marginTop: 16, color: "#4f46e5", fontSize: 16 },

  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: "#4f46e5",
  },
});

export default MySkillPostScreen;
