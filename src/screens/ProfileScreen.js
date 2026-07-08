import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

const API_BASE = "http://localhost:3000";

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({});

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem("userData");
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);

        // Only include fields allowed by backend
        setFormData({
          displayName: parsedUser.displayName || "",
          bio: parsedUser.bio || "",
          avatarUrl: parsedUser.avatarUrl || "",
          university: parsedUser.university || "",
          campus: parsedUser.campus || "",
          department: parsedUser.department || "",
          year: parsedUser.year || "",
        });
      } else {
        Alert.alert("Error", "No user data found. Please login again.");
      }
    } catch (error) {
      console.error("Failed to load user data:", error);
      Alert.alert("Error", "Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const token = await AsyncStorage.getItem("authToken");

      const updatePayload = {
        displayName: formData.displayName?.trim() || undefined,
        bio: formData.bio?.trim() || undefined,
        avatarUrl: formData.avatarUrl?.trim() || undefined,
        university: formData.university?.trim() || undefined,
        campus: formData.campus?.trim() || undefined,
        department: formData.department?.trim() || undefined,
        year: formData.year ? Number(formData.year) : undefined,
      };

      // Remove undefined values
      Object.keys(updatePayload).forEach((key) => {
        if (updatePayload[key] === undefined) delete updatePayload[key];
      });

      const response = await fetch(`${API_BASE}/users/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatePayload),
      });

      const result = await response.json();

      if (response.ok) {
        await AsyncStorage.setItem("userData", JSON.stringify(result));
        setUser(result);
        setEditing(false);
        Alert.alert("Success", "Profile updated successfully!");
      } else {
        Alert.alert("Error", result.message || "Failed to update profile");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove(["authToken", "userData"]);

      Alert.alert("Logged Out", "You have been successfully logged out.", [
        {
          text: "OK",
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{ name: "Login" }],
            });
          },
        },
      ]);
    } catch (error) {
      console.error("Logout error:", error);
      Alert.alert("Error", "Failed to logout. Please try again.");
    }
  };

  const getValue = (value) => {
    if (value === null || value === undefined || value === "") return "—";
    if (Array.isArray(value)) return value.length > 0 ? value.join(", ") : "—";
    return value.toString();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <Image
          source={{ uri: user?.avatarUrl || "https://via.placeholder.com/120" }}
          style={styles.avatar}
        />
        <Text style={styles.name}>
          {getValue(user?.displayName || user?.fullName)}
        </Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={[styles.editButton, editing && styles.saveButton]}
          onPress={() => (editing ? handleSaveProfile() : setEditing(true))}
          disabled={saving}
        >
          <Ionicons
            name={editing ? "save" : "create-outline"}
            size={20}
            color="#fff"
          />
          <Text style={styles.editButtonText}>
            {saving ? "Saving..." : editing ? "Save Changes" : "Edit Profile"}
          </Text>
        </TouchableOpacity>

        {editing && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setEditing(false)}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Basic Information</Text>
        <InfoRow label="Full Name" value={user?.fullName} />
        <InfoRow
          label="Display Name"
          value={user?.displayName}
          editing={editing}
          formData={formData}
          setFormData={setFormData}
          field="displayName"
        />
        <InfoRow label="Email" value={user?.email} />
        <InfoRow
          label="Bio"
          value={user?.bio}
          editing={editing}
          formData={formData}
          setFormData={setFormData}
          field="bio"
          multiline
        />
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Academic Information</Text>
        <InfoRow
          label="University"
          value={user?.university}
          editing={editing}
          formData={formData}
          setFormData={setFormData}
          field="university"
        />
        <InfoRow
          label="Campus"
          value={user?.campus}
          editing={editing}
          formData={formData}
          setFormData={setFormData}
          field="campus"
        />
        <InfoRow
          label="Department"
          value={user?.department}
          editing={editing}
          formData={formData}
          setFormData={setFormData}
          field="department"
        />
        <InfoRow
          label="Year"
          value={user?.year}
          editing={editing}
          formData={formData}
          setFormData={setFormData}
          field="year"
        />
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Statistics</Text>
        <InfoRow label="Average Rating" value={user?.averageRating} />
        <InfoRow label="Total Reviews" value={user?.totalReviews} />
        <InfoRow label="Total Sessions" value={user?.totalSessions} />
        <InfoRow label="Skills" value={user?.skills} />
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// Reusable Info Row Component
const InfoRow = ({
  label,
  value,
  editing,
  formData,
  setFormData,
  field,
  multiline,
}) => {
  const displayValue =
    value === null || value === undefined || value === ""
      ? "—"
      : Array.isArray(value)
        ? value.length
          ? value.join(", ")
          : "—"
        : value;

  return (
    <View style={styles.infoRow}>
      <Text style={styles.label}>{label}</Text>
      {editing && field ? (
        <TextInput
          style={[styles.input, multiline && styles.multilineInput]}
          value={formData[field]?.toString() || ""}
          onChangeText={(text) => setFormData({ ...formData, [field]: text })}
          multiline={multiline}
          numberOfLines={multiline ? 3 : 1}
        />
      ) : (
        <Text style={styles.value}>{displayValue}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  profileHeader: {
    alignItems: "center",
    padding: 30,
    backgroundColor: "white",
  },
  avatar: { width: 120, height: 120, borderRadius: 60, marginBottom: 12 },
  name: { fontSize: 26, fontWeight: "bold", marginBottom: 4 },
  email: { fontSize: 16, color: "#666" },

  actionContainer: {
    flexDirection: "row",
    justifyContent: "center",
    padding: 12,
    gap: 12,
  },
  editButton: {
    backgroundColor: "#0066cc",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  saveButton: { backgroundColor: "#28a745" },
  editButtonText: { color: "white", fontWeight: "600" },
  cancelButton: { padding: 12 },
  cancelText: { color: "#ff5252", fontWeight: "600" },

  infoSection: {
    backgroundColor: "white",
    marginTop: 10,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  label: { flex: 1, fontWeight: "600", color: "#555" },
  value: { flex: 1.8, color: "#333" },
  input: {
    flex: 1.8,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 8,
    backgroundColor: "#f9f9f9",
  },
  multilineInput: { height: 80, textAlignVertical: "top" },

  logoutBtn: {
    margin: 20,
    padding: 16,
    backgroundColor: "#ff5252",
    borderRadius: 12,
    alignItems: "center",
  },
  logoutText: { color: "white", fontWeight: "600", fontSize: 16 },
});

export default ProfileScreen;
