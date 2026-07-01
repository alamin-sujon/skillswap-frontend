import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { mockMatches } from '../data/mockData';

const MatchesScreen = ({ navigation }) => {
  const renderMatch = ({ item }) => (
    <TouchableOpacity 
      style={styles.matchCard}
      onPress={() => navigation.navigate('Conversation', { conversationId: 'c1' })}
    >
      <Image source={{ uri: item.userB.avatarUrl }} style={styles.avatar} />
      <View style={styles.info}>
        <Text style={styles.name}>{item.userB.fullName}</Text>
        <Text style={styles.skill}>{item.skillPost.title}</Text>
        <Text style={styles.status}>Status: {item.status}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Matches</Text>
      <FlatList
        data={mockMatches}
        renderItem={renderMatch}
        keyExtractor={item => item.id}
        ListEmptyComponent={<Text>No matches yet. Browse skills on Home!</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f8f9fa' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  matchCard: { flexDirection: 'row', padding: 16, backgroundColor: 'white', borderRadius: 12, marginBottom: 12, alignItems: 'center' },
  avatar: { width: 60, height: 60, borderRadius: 30 },
  info: { marginLeft: 16, flex: 1 },
  name: { fontSize: 18, fontWeight: '600' },
  skill: { color: '#666' },
  status: { color: '#4caf50', marginTop: 4 },
});

export default MatchesScreen;
