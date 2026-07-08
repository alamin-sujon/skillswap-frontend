import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Card, Searchbar, Button, Surface, FAB } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";

const API_BASE = "http://localhost:8081"; // Update with your actual API base

const MySkillPostScreen = ({ navigation }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchMySkills = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      else setRefreshing(true);

      const token = localStorage.getItem("authToken");

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
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMySkills();
  }, []);

  const onRefresh = () => fetchMySkills(true);

  const filteredPosts = posts.filter(
    (post) =>
      post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const renderPost = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate("SkillPostDetail", { post: item })}
    >
      <Surface style={styles.card} elevation={3}>
        <Card.Content>
          <View style={styles.typeContainer}>
            <View
              style={[
                styles.typeBadge,
                {
                  backgroundColor:
                    item.type === "TEACH" ? "#22c55e" : "#f59e0b",
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
            {item.tags?.slice(0, 3).map((tag, i) => (
              <Text key={i} style={styles.tag}>
                #{tag}
              </Text>
            ))}
          </View>
        </Card.Content>
      </Surface>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.screenTitle}>My Skill Posts</Text>
        <Searchbar
          placeholder="Search my posts..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchbar}
        />
      </View>

      <FlatList
        data={filteredPosts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="book-outline" size={80} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>No Skills Yet</Text>
            <Text style={styles.emptySubtitle}>
              You haven't created any skill posts yet.
            </Text>
            <Button
              mode="contained"
              onPress={() => navigation.navigate("CreateSkill")}
              style={styles.createBtn}
            >
              Create Your First Skill
            </Button>
          </View>
        }
        contentContainerStyle={styles.list}
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate("CreateSkill")}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { padding: 20, backgroundColor: "white" },
  screenTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e2937",
    marginBottom: 12,
  },
  searchbar: { borderRadius: 12 },

  list: { padding: 16 },
  card: { marginBottom: 16, borderRadius: 16 },

  typeContainer: { alignItems: "flex-end", marginBottom: 8 },
  typeBadge: { paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20 },
  typeText: { color: "white", fontWeight: "600", fontSize: 13 },

  title: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
  description: { color: "#475569", marginBottom: 12, lineHeight: 20 },

  tags: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  tag: {
    backgroundColor: "#e0e7ff",
    color: "#4f46e5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#64748b",
    marginTop: 16,
  },
  emptySubtitle: {
    color: "#94a3b8",
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 40,
  },
  createBtn: { marginTop: 20, borderRadius: 12 },

  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    backgroundColor: "#4f46e5",
  },
});

export default MySkillPostScreen;
