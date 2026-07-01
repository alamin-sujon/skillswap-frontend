import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { mockConversations } from '../data/mockData';

const ConversationScreen = ({ route }) => {
  const [messages, setMessages] = useState(mockConversations[0].messages);
  const [newMessage, setNewMessage] = useState('');

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now().toString(),
        content: newMessage,
        senderId: '1', // current user
        createdAt: new Date().toISOString(),
      };
      setMessages([...messages, message]);
      setNewMessage('');
    }
  };

  const renderMessage = ({ item }) => (
    <View style={[
      styles.messageBubble,
      item.senderId === '1' ? styles.myMessage : styles.otherMessage
    ]}>
      <Text style={item.senderId === '1' ? styles.myText : styles.otherText}>{item.content}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        style={styles.messagesList}
        inverted={false}
      />
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  messagesList: { flex: 1, padding: 16 },
  messageBubble: { maxWidth: '80%', padding: 12, borderRadius: 18, marginVertical: 4 },
  myMessage: { alignSelf: 'flex-end', backgroundColor: '#0066cc', borderBottomRightRadius: 4 },
  otherMessage: { alignSelf: 'flex-start', backgroundColor: 'white', borderBottomLeftRadius: 4 },
  myText: { color: 'white' },
  otherText: { color: '#333' },
  inputContainer: { flexDirection: 'row', padding: 12, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#ddd' },
  input: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 25, paddingHorizontal: 16, paddingVertical: 10, marginRight: 8 },
  sendButton: { backgroundColor: '#0066cc', paddingHorizontal: 20, justifyContent: 'center', borderRadius: 25 },
  sendText: { color: 'white', fontWeight: '600' },
});

export default ConversationScreen;
