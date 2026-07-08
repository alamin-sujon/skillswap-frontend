import React from "react";
import { View, Text, StyleSheet, ScrollView, Image } from "react-native";
import { Button, Card } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
const SkillPostDetailScreen = ({ route, navigation }) => {
  const { post } = route.params;
  // console.log({ post });

  const handleMatch = async () => {
    try {
      const userDataStr = await AsyncStorage.getItem("userData");
      const currentUser = userDataStr ? JSON.parse(userDataStr) : null;

      const currentUserId = currentUser?.id; // adjust if your shape differs
      const postOwnerId = post?.userId;
      console.log({ currentUserId, postOwnerId });
      if (!currentUserId) {
        Alert.alert("Error", "Please login again.");
        return;
      }

      if (currentUserId === postOwnerId) {
        Alert.alert(
          "Not allowed",
          "You can’t send a request to your own skill post.",
        );
        return;
      }

      const payload = { skillPostId: post.id };

      // create match request
      await fetch(`${YOUR_API_BASE_URL}/matches`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // "Authorization": `Bearer ${token}`, // if your backend requires it
        },
        body: JSON.stringify(payload),
      });

      Alert.alert("Match request sent! Check Matches tab.");
      navigation.navigate("Matches");
    } catch (e) {
      Alert.alert("Error", "Something went wrong.");
    }
  };
  const isTeach = post?.type === "TEACH";

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerOverlay} />
        <Image source={{ uri: post?.user?.avatarUrl }} style={styles.avatar} />
        <Text style={styles.name}>{post?.user?.fullName}</Text>
        <Text style={styles.title}>{post?.title}</Text>

        <View style={styles.metaRow}>
          <View style={styles.metaChip}>
            <Text style={styles.metaChipText}>{post?.category}</Text>
          </View>
          <View
            style={[
              styles.metaChip,
              isTeach ? styles.teachChip : styles.learnChip,
            ]}
          >
            <Text style={styles.metaChipText}>
              {isTeach ? "Wants to Learn" : "Wants to Teach"}
            </Text>
          </View>
        </View>
      </View>

      {/* Card */}
      <Card style={styles.card} mode="elevated">
        <Card.Content>
          <Text style={styles.sectionTitle}>About this skill</Text>
          <Text style={styles.description}>{post?.description}</Text>

          <Text style={styles.sectionTitle}>Category</Text>
          <Text style={styles.bodyText}>{post?.category}</Text>

          <Text style={styles.sectionTitle}>Tags</Text>
          <View style={styles.tags}>
            {(post?.tags || []).map((tag, i) => (
              <View key={i} style={styles.tagPill}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* CTA */}
      <View style={styles.ctaWrap}>
        <Button
          mode="contained"
          onPress={handleMatch}
          style={[
            styles.button,
            isTeach ? styles.buttonLearn : styles.buttonTeach,
          ]}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
        >
          {isTeach ? "Request to Learn" : "Offer to Teach"}
        </Button>

        <Text style={styles.ctaHint}>
          A message will be sent to coordinate next steps.
        </Text>
      </View>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F9FC" },
  content: { padding: 16 },

  header: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 18,
    paddingBottom: 22,
    overflow: "hidden",
    marginBottom: 14,
    // subtle border look
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(25, 118, 210, 0.08)", // soft blue tint
  },

  avatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignSelf: "center",
    marginTop: 6,
    marginBottom: 10,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.95)",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },

  name: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
  },
  title: {
    textAlign: "center",
    fontSize: 22,
    fontWeight: "700",
    marginTop: 6,
    color: "#111827",
  },

  metaRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginTop: 14,
    flexWrap: "wrap",
  },
  metaChip: {
    backgroundColor: "#EEF2FF",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  teachChip: { backgroundColor: "rgba(34, 197, 94, 0.12)" },
  learnChip: { backgroundColor: "rgba(59, 130, 246, 0.12)" },
  metaChipText: { color: "#334155", fontWeight: "700", fontSize: 13 },

  card: {
    borderRadius: 16,
    overflow: "hidden",
  },

  sectionTitle: {
    fontWeight: "800",
    fontSize: 15,
    marginTop: 6,
    marginBottom: 8,
    color: "#111827",
  },
  description: {
    lineHeight: 22,
    color: "#334155",
    fontSize: 15,
  },
  bodyText: { color: "#334155", fontSize: 15, marginBottom: 6 },

  tags: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tagPill: {
    backgroundColor: "rgba(14, 165, 233, 0.10)",
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  tagText: { color: "#0284C7", fontWeight: "800", fontSize: 13 },

  ctaWrap: { marginTop: 14, alignItems: "center" },
  button: {
    width: "100%",
    borderRadius: 12,
    paddingVertical: 3,
  },
  buttonContent: { height: 48 },
  buttonLabel: { fontWeight: "900", fontSize: 16 },

  buttonLearn: { backgroundColor: "#2563EB" },
  buttonTeach: { backgroundColor: "#16A34A" },

  ctaHint: {
    marginTop: 10,
    color: "rgba(15, 23, 42, 0.65)",
    fontSize: 12,
    textAlign: "center",
  },
});

export default SkillPostDetailScreen;
