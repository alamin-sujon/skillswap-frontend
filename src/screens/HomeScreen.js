import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Card, Searchbar, Button } from 'react-native-paper';
import { mockSkillPosts, mockUsers } from '../data/mockData';

const HomeScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  const filteredPosts = mockSkillPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'ALL' || post.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const renderPost = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate('SkillPostDetail', { post: item })}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <Image source={{ uri: item.user.avatarUrl }} style={styles.avatar} />
            <View>
              <Text style={styles.name}>{item.user.fullName}</Text>
              <Text style={styles.category}>{item.category}</Text>
            </View>
            <View style={[styles.typeBadge, { backgroundColor: item.type === 'TEACH' ? '#4caf50' : '#ff9800' }]}>
              <Text style={styles.typeText}>{item.type}</Text>
            </View>
          </View>
          
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description} numberOfLines={3}>{item.description}</Text>
          
          <View style={styles.tags}>
            {item.tags.slice(0, 3).map((tag, index) => (
              <Text key={index} style={styles.tag}>#{tag}</Text>
            ))}
          </View>
        </Card.Content>
        <Card.Actions>
          <Button onPress={() => navigation.navigate('SkillPostDetail', { post: item })}>View Details</Button>
        </Card.Actions>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.appTitle}>SkillShare</Text>
        <Searchbar
          placeholder="Search skills..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
      </View>

      <View style={styles.filters}>
        {['ALL', 'TEACH', 'LEARN'].map(type => (
          <TouchableOpacity
            key={type}
            style={[styles.filterBtn, filterType === type && styles.activeFilter]}
            onPress={() => setFilterType(type)}
          >
            <Text style={[styles.filterText, filterType === type && styles.activeFilterText]}>{type}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredPosts}
        renderItem={renderPost}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { padding: 16, backgroundColor: 'white' },
  appTitle: { fontSize: 24, fontWeight: 'bold', color: '#0066cc', marginBottom: 12 },
  searchbar: { marginTop: 8 },
  filters: { flexDirection: 'row', padding: 16, backgroundColor: 'white', gap: 8 },
  filterBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f0f0f0' },
  activeFilter: { backgroundColor: '#0066cc' },
  filterText: { color: '#666' },
  activeFilterText: { color: 'white' },
  list: { padding: 16 },
  card: { marginBottom: 16, borderRadius: 12 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  name: { fontWeight: '600' },
  category: { color: '#666', fontSize: 12 },
  typeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginLeft: 'auto' },
  typeText: { color: 'white', fontSize: 12, fontWeight: '600' },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  description: { color: '#444', marginBottom: 12 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { backgroundColor: '#e3f2fd', color: '#1976d2', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, fontSize: 12 },
});

export default HomeScreen;
