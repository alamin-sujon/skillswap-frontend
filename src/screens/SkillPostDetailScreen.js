import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Button, Card } from 'react-native-paper';
import { mockMatches, currentUser } from '../data/mockData';

const SkillPostDetailScreen = ({ route, navigation }) => {
  const { post } = route.params;

  const handleMatch = () => {
    // Simulate match
    alert('Match request sent! Check Matches tab.');
    navigation.navigate('Matches');
  };

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: post.user.avatarUrl }} style={styles.avatar} />
      <Text style={styles.name}>{post.user.fullName}</Text>
      <Text style={styles.title}>{post.title}</Text>
      
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>About this skill</Text>
          <Text style={styles.description}>{post.description}</Text>
          
          <Text style={styles.sectionTitle}>Category</Text>
          <Text>{post.category}</Text>
          
          <Text style={styles.sectionTitle}>Tags</Text>
          <View style={styles.tags}>
            {post.tags.map((tag, i) => (
              <Text key={i} style={styles.tag}>#{tag}</Text>
            ))}
          </View>
        </Card.Content>
      </Card>

      <Button mode="contained" onPress={handleMatch} style={styles.button}>
        {post.type === 'TEACH' ? 'Request to Learn' : 'Offer to Teach'}
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  avatar: { width: 80, height: 80, borderRadius: 40, alignSelf: 'center', marginVertical: 20 },
  name: { textAlign: 'center', fontSize: 20, fontWeight: 'bold' },
  title: { textAlign: 'center', fontSize: 24, fontWeight: '600', marginVertical: 8 },
  card: { marginVertical: 16, borderRadius: 12 },
  sectionTitle: { fontWeight: '600', marginTop: 16, marginBottom: 8, color: '#333' },
  description: { lineHeight: 22 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { backgroundColor: '#e3f2fd', padding: 6, borderRadius: 16, fontSize: 14 },
  button: { marginTop: 20, borderRadius: 8 },
});

export default SkillPostDetailScreen;
