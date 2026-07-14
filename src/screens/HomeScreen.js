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
  Modal,
  ScrollView,
  TextInput,
} from "react-native";
import { Card, Searchbar, Button, Surface, FAB } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";

const API_BASE = "http://localhost:3000";

const HomeScreen = ({ navigation }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("ALL");

  // Notification States
  const [notifications, setNotifications] = useState([]);
  const [notificationModalVisible, setNotificationModalVisible] =
    useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Create Skill Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    type: "LEARN",
    title: "",
    category: "",
    description: "",
    tags: "",
    availability: "",
    preferredFormat: "ONLINE",
  });

  // ==================== NOTIFICATIONS ====================
  const fetchNotifications = async () => {
    try {
      setNotifLoading(true);
      const token = await AsyncStorage.getItem("authToken");
      if (!token) return;

      const response = await fetch(`${API_BASE}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch notifications");

      const data = await response.json();
      setNotifications(Array.isArray(data) ? data : []);

      const unread = data.filter((n) => !n.isRead).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error("Notifications fetch error:", err);
    } finally {
      setNotifLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) return;

      const response = await fetch(`${API_BASE}/notifications/read-all`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((notif) => ({ ...notif, isRead: true })),
        );
        setUnreadCount(0);
        Toast.show({
          type: "success",
          text1: "All notifications marked as read",
        });
      }
    } catch (err) {
      console.error(err);
      Toast.show({ type: "error", text1: "Failed to mark as read" });
    }
  };

  // Poll notifications every 10 seconds
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  // ==================== FETCH SKILLS ====================
  const fetchSkills = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      else setRefreshing(true);

      const token = await AsyncStorage.getItem("authToken");
      if (!token) throw new Error("No authentication token found.");

      const response = await fetch(`${API_BASE}/skills`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to load skills");

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
    fetchSkills();
  }, []);

  const onRefresh = () => fetchSkills(true);

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = filterType === "ALL" || post.type === filterType;
    return matchesSearch && matchesFilter;
  });

  // ==================== CREATE SKILL ====================
  const handleCreateSkill = async () => {
    if (
      !formData.title?.trim() ||
      !formData.description?.trim() ||
      !formData.category?.trim()
    ) {
      alert("Title, Description, and Category are required");
      return;
    }

    setSubmitting(true);
    const token = await AsyncStorage.getItem("authToken");

    if (!token) {
      alert("Please login again");
      setSubmitting(false);
      return;
    }

    const tagsArray = formData.tags
      ? formData.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];

    const newSkill = {
      id: `temp_${Date.now()}`,
      type: formData.type,
      title: formData.title.trim(),
      category: formData.category.trim(),
      description: formData.description.trim(),
      tags: tagsArray,
      availability: formData.availability?.trim() || "",
      preferredFormat: formData.preferredFormat,
      user: { displayName: "You", avatarUrl: "" },
      createdAt: new Date().toISOString(),
    };

    try {
      setPosts((prev) => [newSkill, ...prev]);

      const response = await fetch(`${API_BASE}/skills`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: formData.type,
          title: newSkill.title,
          category: newSkill.category,
          description: newSkill.description,
          tags: tagsArray,
          availability: newSkill.availability,
          preferredFormat: newSkill.preferredFormat,
        }),
      });

      if (!response.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== newSkill.id));
        throw new Error("Failed to save skill");
      }

      alert("Skill created successfully!");
      setModalVisible(false);
      setFormData({
        type: "LEARN",
        title: "",
        category: "",
        description: "",
        tags: "",
        availability: "",
        preferredFormat: "ONLINE",
      });
      setTimeout(() => fetchSkills(true), 1000);
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to create skill");
      setPosts((prev) => prev.filter((p) => p.id !== newSkill.id));
    } finally {
      setSubmitting(false);
    }
  };

  // ==================== RENDER NOTIFICATION ====================
  const renderNotification = ({ item }) => (
    <Surface style={styles.notifCard} elevation={2}>
      <View style={styles.notifContent}>
        <View style={styles.notifHeader}>
          <Ionicons
            name={item.type === "NEW_MATCH" ? "handshake" : "notifications"}
            size={24}
            color="#4f46e5"
          />
          <Text style={styles.notifTitle}>{item.title}</Text>
          {!item.isRead && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.notifBody}>{item.body}</Text>
        <Text style={styles.notifTime}>
          {new Date(item.createdAt).toLocaleDateString()} •{" "}
          {new Date(item.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    </Surface>
  );

  // ==================== RENDER SKILL POST ====================
  const renderPost = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => navigation.navigate("SkillPostDetail", { post: item })}
    >
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
              <Text style={styles.name}>
                {item.user?.displayName || "Anonymous User"}
              </Text>
              <Text style={styles.category}>{item.category}</Text>
            </View>

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
            mode="contained"
            buttonColor="#4f46e5"
            textColor="white"
            onPress={() =>
              navigation.navigate("SkillPostDetail", { post: item })
            }
            style={styles.viewButton}
          >
            View Details
          </Button>
        </Card.Actions>
      </Surface>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={styles.loadingText}>Discovering amazing skills...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Notification Icon */}
      <View style={styles.topHeader}>
        <Text style={styles.appTitle}>SkillSWap</Text>
        <TouchableOpacity
          style={styles.notifIconContainer}
          onPress={() => setNotificationModalVisible(true)}
        >
          <Ionicons name="notifications-outline" size={28} color="#1e2937" />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadCount > 99 ? "99+" : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <Searchbar
        placeholder="Search skills, teachers..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
        iconColor="#4f46e5"
      />

      <TouchableOpacity
        style={styles.mySkillsQuickBtn}
        onPress={() => navigation.navigate("MySkillPost")}
      >
        <Ionicons name="book" size={22} color="#4f46e5" />
        <Text style={styles.mySkillsQuickText}>My Skill Posts</Text>
        <Ionicons name="chevron-forward" size={20} color="#4f46e5" />
      </TouchableOpacity>

      <View style={styles.filters}>
        {["ALL", "TEACH", "LEARN"].map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.filterBtn,
              filterType === type && styles.activeFilter,
            ]}
            onPress={() => setFilterType(type)}
          >
            <Text
              style={[
                styles.filterText,
                filterType === type && styles.activeFilterText,
              ]}
            >
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredPosts}
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
            <Text style={styles.emptyText}>
              {error ? error : "No skills found matching your search."}
            </Text>
            {error && (
              <Button
                mode="contained"
                onPress={onRefresh}
                style={{ marginTop: 20 }}
              >
                Try Again
              </Button>
            )}
          </View>
        }
      />

      <FAB
        icon="plus"
        style={styles.fab}
        color="white"
        onPress={() => setModalVisible(true)}
      />

      {/* ==================== NOTIFICATIONS MODAL ==================== */}
      <Modal
        visible={notificationModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setNotificationModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.notifModalContent}>
            <View style={styles.notifModalHeader}>
              <Text style={styles.modalTitle}>Notifications</Text>
              {unreadCount > 0 && (
                <Button mode="text" textColor="#4f46e5" onPress={markAllAsRead}>
                  Mark all read
                </Button>
              )}
              <TouchableOpacity
                onPress={() => setNotificationModalVisible(false)}
              >
                <Ionicons name="close" size={28} color="#64748b" />
              </TouchableOpacity>
            </View>

            {notifLoading && notifications.length === 0 ? (
              <ActivityIndicator style={{ marginTop: 50 }} color="#4f46e5" />
            ) : (
              <FlatList
                data={notifications}
                keyExtractor={(item) => item.id}
                renderItem={renderNotification}
                ListEmptyComponent={
                  <Text style={styles.noNotifText}>No notifications yet</Text>
                }
              />
            )}
          </View>
        </View>
      </Modal>

      {/* ==================== CREATE SKILL MODAL ==================== */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Skill</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Form fields here - same as before */}
              <Text style={styles.label}>Type</Text>
              <View style={styles.typeSelector}>
                {["LEARN", "TEACH"].map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[
                      styles.typeOption,
                      formData.type === t && styles.typeOptionActive,
                    ]}
                    onPress={() => setFormData({ ...formData, type: t })}
                  >
                    <Text
                      style={[
                        styles.typeOptionText,
                        formData.type === t && styles.typeOptionTextActive,
                      ]}
                    >
                      {t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Title</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Learn Guitar Basics"
                value={formData.title}
                onChangeText={(text) =>
                  setFormData({ ...formData, title: text })
                }
              />

              <Text style={styles.label}>Category</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Music"
                value={formData.category}
                onChangeText={(text) =>
                  setFormData({ ...formData, category: text })
                }
              />

              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe your skill..."
                multiline
                numberOfLines={4}
                value={formData.description}
                onChangeText={(text) =>
                  setFormData({ ...formData, description: text })
                }
              />

              <Text style={styles.label}>Tags (comma separated)</Text>
              <TextInput
                style={styles.input}
                placeholder="guitar, music, beginner"
                value={formData.tags}
                onChangeText={(text) =>
                  setFormData({ ...formData, tags: text })
                }
              />

              <Text style={styles.label}>Availability</Text>
              <TextInput
                style={styles.input}
                placeholder="Weekends, evenings..."
                value={formData.availability}
                onChangeText={(text) =>
                  setFormData({ ...formData, availability: text })
                }
              />

              <Text style={styles.label}>Preferred Format</Text>
              <View style={styles.typeSelector}>
                {["ONLINE", "OFFLINE", "BOTH"].map((f) => (
                  <TouchableOpacity
                    key={f}
                    style={[
                      styles.typeOption,
                      formData.preferredFormat === f && styles.typeOptionActive,
                    ]}
                    onPress={() =>
                      setFormData({ ...formData, preferredFormat: f })
                    }
                  >
                    <Text
                      style={[
                        styles.typeOptionText,
                        formData.preferredFormat === f &&
                          styles.typeOptionTextActive,
                      ]}
                    >
                      {f}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalButtons}>
              <Button
                mode="outlined"
                onPress={() => setModalVisible(false)}
                style={styles.modalBtn}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                buttonColor="#4f46e5"
                onPress={handleCreateSkill}
                loading={submitting}
                disabled={submitting}
                style={styles.modalBtn}
              >
                Create Skill
              </Button>
            </View>
          </View>
        </View>
      </Modal>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  appTitle: { fontSize: 28, fontWeight: "700", color: "#4f46e5" },

  notifIconContainer: { position: "relative", padding: 6 },
  badge: {
    position: "absolute",
    right: 2,
    top: 2,
    backgroundColor: "#ef4444",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  badgeText: { color: "white", fontSize: 11, fontWeight: "bold" },

  searchbar: {
    borderRadius: 12,
    elevation: 3,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  mySkillsQuickBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0ff",
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 14,
    gap: 12,
  },
  mySkillsQuickText: {
    color: "#4f46e5",
    fontWeight: "600",
    fontSize: 16,
    flex: 1,
  },

  filters: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "white",
    gap: 10,
  },
  filterBtn: {
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 30,
    backgroundColor: "#f1f5f9",
  },
  activeFilter: { backgroundColor: "#4f46e5" },
  filterText: { color: "#64748b", fontWeight: "600" },
  activeFilterText: { color: "white" },

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
  cardActions: { paddingHorizontal: 16, paddingBottom: 16 },
  viewButton: { borderRadius: 12 },

  // Notification Styles
  notifCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    backgroundColor: "white",
  },
  notifContent: { padding: 16 },
  notifHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  notifTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e2937",
    marginLeft: 10,
    flex: 1,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#ef4444",
  },
  notifBody: { fontSize: 15, color: "#475569", lineHeight: 22 },
  notifTime: { fontSize: 12, color: "#94a3b8", marginTop: 8 },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  notifModalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    flex: 1,
    paddingTop: 10,
  },
  notifModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },

  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    flex: 1,
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1e2937",
    textAlign: "center",
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#334155",
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#f8fafc",
  },
  textArea: { height: 100, textAlignVertical: "top" },
  typeSelector: { flexDirection: "row", gap: 10, marginBottom: 12 },
  typeOption: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
  },
  typeOptionActive: { backgroundColor: "#4f46e5" },
  typeOptionText: { fontWeight: "600", color: "#64748b" },
  typeOptionTextActive: { color: "white" },
  modalButtons: { flexDirection: "row", gap: 12, marginTop: 20 },
  modalBtn: { flex: 1 },

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
    paddingHorizontal: 30,
  },
  loadingText: { marginTop: 16, color: "#4f46e5", fontSize: 16 },
  noNotifText: {
    textAlign: "center",
    marginTop: 80,
    color: "#64748b",
    fontSize: 16,
  },

  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: "#4f46e5",
  },
});

export default HomeScreen;
