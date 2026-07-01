import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { mockSessions } from '../data/mockData';
import { format } from 'date-fns';

const SessionsScreen = () => {
  const renderSession = ({ item }) => (
    <View style={styles.sessionCard}>
      <Text style={styles.title}>{item.title}</Text>
      <Text>{format(new Date(item.date), 'PPPp')}</Text>
      <Text>Duration: {item.durationMinutes} mins</Text>
      <Text>Format: {item.format}</Text>
      <Text style={styles.status}>Status: {item.status}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Upcoming Sessions</Text>
      <FlatList
        data={mockSessions}
        renderItem={renderSession}
        keyExtractor={item => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f8f9fa' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  sessionCard: { backgroundColor: 'white', padding: 16, borderRadius: 12, marginBottom: 12 },
  title: { fontSize: 18, fontWeight: '600' },
  status: { color: '#2196f3', marginTop: 8 },
});

export default SessionsScreen;
