import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { mockConversations } from '../data/mockData';

const MessagesScreen = ({ navigation }) => {
  const renderConversation = ({ item }) => (
    <TouchableOpacity 
      style={styles.convoCard}
      onPress={() => navigation.navigate('Conversation', { conversationId: item.id })}
    >
      <Image source={{ uri: item.userB.avatarUrl }} style={styles.avatar} />
      <View style={styles.info}>
        <Text style={styles.name}>{item.userB.fullName}</Text>
        <Text style={styles.lastMsg}>{item.messages[item.messages.length-1]?.content}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Messages</Text>
      <FlatList
        data={mockConversations}
        renderItem={renderConversation}
        keyExtractor={item => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f8f9fa' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  convoCard: { flexDirection: 'row', padding: 16, backgroundColor: 'white', borderRadius: 12, marginBottom: 12 },
  avatar: { width: 50, height: 50, borderRadius: 25 },
  info: { marginLeft: 12, justifyContent: 'center' },
  name: { fontWeight: '600', fontSize: 16 },
  lastMsg: { color: '#666' },
});

export default MessagesScreen;
