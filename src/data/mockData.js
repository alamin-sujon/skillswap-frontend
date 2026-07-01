export const mockUsers = [
  {
    id: '1',
    fullName: 'Alex Johnson',
    displayName: 'alexj',
    avatarUrl: 'https://i.pravatar.cc/150?u=alex',
    bio: 'Computer Science student passionate about AI and web dev.',
    university: 'Tech University',
    averageRating: 4.8,
    totalReviews: 15,
    skills: ['Programming', 'AI', 'Design'],
    role: 'STUDENT'
  },
  {
    id: '2',
    fullName: 'Sam Rivera',
    displayName: 'samr',
    avatarUrl: 'https://i.pravatar.cc/150?u=sam',
    bio: 'Economics major who loves teaching languages.',
    university: 'State University',
    averageRating: 4.5,
    totalReviews: 22,
    skills: ['Spanish', 'Economics'],
    role: 'STUDENT'
  },
];

export const mockSkillPosts = [
  {
    id: 'sp1',
    type: 'TEACH',
    title: 'Learn React Native Basics',
    category: 'Programming',
    description: 'I can teach you the fundamentals of building mobile apps with React Native.',
    tags: ['react', 'mobile', 'javascript'],
    userId: '1',
    user: mockUsers[0],
    isActive: true,
  },
  {
    id: 'sp2',
    type: 'LEARN',
    title: 'Need help with Spanish conversation',
    category: 'Languages',
    description: 'Looking for someone to practice Spanish speaking with.',
    tags: ['spanish', 'conversation'],
    userId: '2',
    user: mockUsers[1],
    isActive: true,
  },
];

export const mockMatches = [
  {
    id: 'm1',
    userAId: '1',
    userBId: '2',
    skillPostId: 'sp1',
    status: 'ACCEPTED',
    userA: mockUsers[0],
    userB: mockUsers[1],
    skillPost: mockSkillPosts[0],
  },
];

export const mockSessions = [
  {
    id: 's1',
    title: 'React Native Intro Session',
    date: new Date(Date.now() + 86400000).toISOString(),
    durationMinutes: 60,
    format: 'ONLINE',
    status: 'CONFIRMED',
    matchId: 'm1',
    participants: [mockUsers[0], mockUsers[1]],
  },
];

export const mockConversations = [
  {
    id: 'c1',
    userA: mockUsers[0],
    userB: mockUsers[1],
    messages: [
      {
        id: 'msg1',
        content: 'Hi, interested in your React Native post!',
        senderId: '2',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'msg2',
        content: 'Sure! When are you free?',
        senderId: '1',
        createdAt: new Date(Date.now() - 1800000).toISOString(),
      },
    ],
  },
];

export const currentUser = mockUsers[0];
