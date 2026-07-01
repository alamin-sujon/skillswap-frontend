import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { currentUser } from '../data/mockData';
import { Button } from 'react-native-paper';

const ProfileScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>
        <Image source={{ uri: currentUser.avatarUrl }} style={styles.avatar} />
        <Text style={styles.name}>{currentUser.fullName}</Text>
        <Text style={styles.university}>{currentUser.university}</Text>
      </View>

      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{currentUser.averageRating}</Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{currentUser.totalReviews}</Text>
          <Text style={styles.statLabel}>Reviews</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{currentUser.totalSessions || 5}</Text>
          <Text style={styles.statLabel}>Sessions</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bio</Text>
        <Text style={styles.bio}>{currentUser.bio}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Skills</Text>
        <View style={styles.skillsContainer}>
          {currentUser.skills.map((skill, index) => (
            <View key={index} style={styles.skillTag}>
              <Text>{skill}</Text>
            </View>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.logoutBtn}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  profileHeader: { alignItems: 'center', padding: 24, backgroundColor: 'white' },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 12 },
  name: { fontSize: 24, fontWeight: 'bold' },
  university: { color: '#666', fontSize: 16 },
  stats: { flexDirection: 'row', justifyContent: 'space-around', padding: 20, backgroundColor: 'white', marginTop: 8 },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 22, fontWeight: 'bold', color: '#0066cc' },
  statLabel: { color: '#666' },
  section: { padding: 20, backgroundColor: 'white', marginTop: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  bio: { lineHeight: 22, color: '#444' },
  skillsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  skillTag: { backgroundColor: '#e3f2fd', padding: 8, borderRadius: 20, fontSize: 14 },
  logoutBtn: { margin: 20, padding: 16, backgroundColor: '#ff5252', borderRadius: 12, alignItems: 'center' },
  logoutText: { color: 'white', fontWeight: '600' },
});

export default ProfileScreen;
