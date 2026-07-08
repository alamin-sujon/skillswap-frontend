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
} from "react-native";
import { Card, Searchbar, Button, Surface, FAB } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";

const API_BASE = "http://localhost:3000"; // Change this to your actual API base URL

const MySkillsScreen = ({ navigation }) => {
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchMySkills = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      else setRefreshing(true);

      const token = localStorage.getItem("authToken");

      if (!token) {
        throw new Error("Please login again");
      }

      const response = await fetch(`${API_BASE}/skills/my`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Session expired. Please login again.");
        }
        throw new Error("Failed to load your skills");
      }

      const data = await response.json();
      setMyPosts(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching my skills:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMySkills();
  }, []);

  const onRefresh = () => fetchMySkills(true);

  const filteredPosts = myPosts.filter(
    (post) =>
      post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const renderPost = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => navigation.navigate("SkillPostDetail", { post: item })}
    >
      <Surface style={styles.card} elevation={3}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.header}>
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
            {item.tags?.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        </Card.Content>

        <Card.Actions style={styles.cardActions}>
          <Button
            mode="outlined"
            onPress={() =>
              navigation.navigate("SkillPostDetail", { post: item })
            }
          >
            View / Edit
          </Button>
        </Card.Actions>
      </Surface>
    </TouchableOpacity>
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
        <Text style={styles.appTitle}>My Skills</Text>
        <Searchbar
          placeholder="Search my skills..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          iconColor="#4f46e5"
        />
      </View>

      <FlatList
        data={filteredPosts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
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
            <Ionicons name="book-outline" size={70} color="#cbd5e1" />
            <Text style={styles.emptyText}>
              You haven't posted any skills yet
            </Text>
            <Button
              mode="contained"
              buttonColor="#4f46e5"
              onPress={() => navigation.navigate("CreateSkill")}
              style={styles.createButton}
            >
              Create New Skill
            </Button>
          </View>
        }
      />

      {/* Floating Action Button */}
      <FAB
        icon="plus"
        style={styles.fab}
        color="white"
        onPress={() => navigation.navigate("CreateSkill")}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },

  topHeader: {
    padding: 20,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  appTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#4f46e5",
    marginBottom: 12,
  },
  searchbar: { borderRadius: 12, elevation: 2 },

  list: { padding: 16 },

  card: {
    marginBottom: 16,
    borderRadius: 18,
    backgroundColor: "white",
  },
  cardContent: { padding: 18 },
  cardActions: { paddingBottom: 12 },

  header: { alignItems: "flex-end", marginBottom: 10 },
  typeBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  typeText: {
    color: "white",
    fontWeight: "700",
    fontSize: 13,
  },

  title: {
    fontSize: 19,
    fontWeight: "700",
    color: "#1e2937",
    marginBottom: 8,
  },
  description: {
    color: "#475569",
    lineHeight: 22,
    marginBottom: 14,
  },

  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    backgroundColor: "#e0e7ff",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  tagText: {
    color: "#4f46e5",
    fontSize: 13,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    color: "#64748b",
    marginTop: 16,
    marginBottom: 24,
    textAlign: "center",
  },
  createButton: {
    borderRadius: 12,
    paddingHorizontal: 24,
  },

  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: "#4f46e5",
  },
});

export default MySkillsScreen;
