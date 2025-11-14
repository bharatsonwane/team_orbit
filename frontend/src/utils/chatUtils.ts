import type {
  ChatUser,
  ChatMessage,
  Conversation,
  ChatChannel,
} from "../schemas/chat";

// Generate mock users
const mockUsers: ChatUser[] = [
  {
    id: 2,
    name: "Alice Johnson",
    email: "alice@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
    status: "online",
  },
  {
    id: 3,
    name: "Bob Smith",
    email: "bob@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob",
    status: "offline",
    lastSeen: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
  },
  {
    id: 4,
    name: "Charlie Brown",
    email: "charlie@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie",
    status: "away",
  },
  {
    id: 5,
    name: "Diana Prince",
    email: "diana@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Diana",
    status: "online",
  },
  {
    id: 6,
    name: "Edward Norton",
    email: "edward@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Edward",
    status: "offline",
    lastSeen: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
  },
];

// Generate mock conversations
export const generateMockConversations = (): Conversation[] => {
  const baseTime = Date.now();
  const conversations: Conversation[] = [];

  mockUsers.forEach((user, index) => {
    const channelId = index + 1;
    const conversationId = `dm_1_${user.id}`;

    // Generate a sample last message
    const lastMessageTime = new Date(baseTime - index * 3600000); // Staggered times
    const lastMessage: ChatMessage = {
      id: 1000 + index,
      messageCreatedAt: lastMessageTime.toISOString(),
      channelId,
      senderId: index % 2 === 0 ? user.id : 1, // Alternate sender
      sender: index % 2 === 0 ? user : mockUsers[0],
      text:
        index % 2 === 0
          ? "Hey, how are you doing?"
          : "Thanks for your message! I'll get back to you soon.",
      isEdited: false,
      isDeleted: false,
      createdAt: lastMessageTime.toISOString(),
      updatedAt: lastMessageTime.toISOString(),
      reactions: [],
      readBy: [],
    };

    conversations.push({
      id: conversationId,
      channelId,
      participant: user,
      lastMessage,
      unreadCount: index < 3 ? index + 1 : 0, // First 3 have unread messages
      updatedAt: lastMessageTime.toISOString(),
    });
  });

  // Sort by updatedAt (most recent first)
  return conversations.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
};

// Generate mock messages for a conversation
export const generateMockMessages = (
  channelId: number,
  participantId: number,
  isGroupChat: boolean = false
): ChatMessage[] => {
  const messages: ChatMessage[] = [];
  const baseTime = Date.now();
  const participant =
    mockUsers.find(u => u.id === participantId) || mockUsers[0];

  // Generate 15-20 messages
  const messageCount = 15 + Math.floor(Math.random() * 6);

  // For group chats, use multiple users (at least 3)
  const groupChatUsers = isGroupChat
    ? [
        {
          id: 1,
          name: "You",
          email: "you@example.com",
          status: "online" as const,
        },
        ...mockUsers.slice(0, 4), // Use first 4 mock users
      ]
    : [
        {
          id: 1,
          name: "You",
          email: "you@example.com",
          status: "online" as const,
        },
        participant,
      ];

  for (let i = 0; i < messageCount; i++) {
    let senderId: number;
    let sender: ChatUser;

    if (isGroupChat) {
      // For group chats, randomly select from multiple users
      const randomIndex = Math.floor(Math.random() * groupChatUsers.length);
      const selectedUser = groupChatUsers[randomIndex];
      senderId = selectedUser.id;
      sender = selectedUser;
    } else {
      // For one-to-one, alternate between participant and current user
      const isFromParticipant = i % 3 !== 0; // 2/3 messages from participant
      senderId = isFromParticipant ? participantId : 1;
      sender = isFromParticipant ? participant : groupChatUsers[0];
    }

    const messageTime = new Date(baseTime - (messageCount - i) * 60000); // 1 minute intervals
    const messageTexts = [
      "Hey there!",
      "How are you doing?",
      "I'm doing great, thanks for asking!",
      "That's awesome to hear.",
      "What have you been up to?",
      "Just working on some projects. How about you?",
      "Same here, busy with deadlines.",
      "I totally understand that feeling.",
      "Would you like to grab coffee sometime?",
      "That sounds great! How about this weekend?",
      "Perfect! Saturday works for me.",
      "Awesome, looking forward to it!",
    ];

    // Determine readBy based on chat type
    let readBy: number[];
    if (isGroupChat) {
      // For group chats, last few messages read by multiple users
      readBy =
        i >= messageCount - 3
          ? [1, ...mockUsers.slice(0, 3).map(u => u.id)]
          : [senderId];
    } else {
      // For one-to-one, last 3 messages read by both participants
      readBy = i >= messageCount - 3 ? [1, participantId] : [senderId];
    }

    const message: ChatMessage = {
      id: channelId * 1000 + i,
      messageCreatedAt: messageTime.toISOString(),
      channelId,
      senderId,
      sender,
      text: messageTexts[i % messageTexts.length],
      isEdited: false,
      isDeleted: false,
      createdAt: messageTime.toISOString(),
      updatedAt: messageTime.toISOString(),
      reactions:
        i % 5 === 0 && senderId !== 1 // Add reactions to messages from other users
          ? [
              {
                id: i * 10,
                messageId: channelId * 1000 + i,
                messageCreatedAt: messageTime.toISOString(),
                userId: 1,
                user: {
                  id: 1,
                  name: "You",
                  email: "you@example.com",
                  status: "online",
                },
                reaction: "👍",
                createdAt: messageTime.toISOString(),
              },
            ]
          : [],
      readBy,
    };

    // Add reply to some messages
    if (i > 2 && i % 4 === 0) {
      message.replyToMessageId = channelId * 1000 + (i - 2);
    }

    messages.push(message);
  }

  return messages;
};

// Format message time
export const formatMessageTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  // Show date if older than a week
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
};

// Format conversation time
export const formatConversationTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const messageDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  if (messageDate.getTime() === today.getTime()) {
    // Today - show time
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (messageDate.getTime() === yesterday.getTime()) {
    return "Yesterday";
  }

  // Show date
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
};

// Group messages by date
export const groupMessagesByDate = (
  messages: ChatMessage[]
): Record<string, ChatMessage[]> => {
  const grouped: Record<string, ChatMessage[]> = {};

  messages.forEach(message => {
    const date = new Date(message.createdAt);
    const dateKey = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(message);
  });

  return grouped;
};

// Generate mock channels for group chat
export const generateMockChannels = (): ChatChannel[] => {
  const baseTime = Date.now();
  const channels: ChatChannel[] = [
    {
      id: 101,
      name: "general",
      description: "General team discussions",
      type: "public",
      avatar: "https://api.dicebear.com/7.x/shapes/svg?seed=general",
      memberCount: 15,
      unreadCount: 3,
      createdAt: new Date(baseTime - 86400000 * 30).toISOString(), // 30 days ago
      updatedAt: new Date(baseTime - 3600000).toISOString(), // 1 hour ago
      lastMessage: {
        id: 2001,
        messageCreatedAt: new Date(baseTime - 3600000).toISOString(),
        channelId: 101,
        senderId: 2,
        sender: mockUsers[0],
        text: "Has everyone reviewed the new design?",
        isEdited: false,
        isDeleted: false,
        createdAt: new Date(baseTime - 3600000).toISOString(),
        updatedAt: new Date(baseTime - 3600000).toISOString(),
        reactions: [],
        readBy: [],
      },
    },
    {
      id: 102,
      name: "developers",
      description: "Development team channel",
      type: "public",
      avatar: "https://api.dicebear.com/7.x/shapes/svg?seed=developers",
      memberCount: 8,
      unreadCount: 5,
      createdAt: new Date(baseTime - 86400000 * 20).toISOString(),
      updatedAt: new Date(baseTime - 1800000).toISOString(), // 30 minutes ago
      lastMessage: {
        id: 2002,
        messageCreatedAt: new Date(baseTime - 1800000).toISOString(),
        channelId: 102,
        senderId: 3,
        sender: mockUsers[1],
        text: "The bug fix has been deployed!",
        isEdited: false,
        isDeleted: false,
        createdAt: new Date(baseTime - 1800000).toISOString(),
        updatedAt: new Date(baseTime - 1800000).toISOString(),
        reactions: [],
        readBy: [],
      },
    },
    {
      id: 103,
      name: "design-team",
      description: "Design discussions",
      type: "public",
      avatar: "https://api.dicebear.com/7.x/shapes/svg?seed=design",
      memberCount: 6,
      unreadCount: 0,
      createdAt: new Date(baseTime - 86400000 * 15).toISOString(),
      updatedAt: new Date(baseTime - 7200000).toISOString(), // 2 hours ago
      lastMessage: {
        id: 2003,
        messageCreatedAt: new Date(baseTime - 7200000).toISOString(),
        channelId: 103,
        senderId: 4,
        sender: mockUsers[2],
        text: "New design mockups are ready for review",
        isEdited: false,
        isDeleted: false,
        createdAt: new Date(baseTime - 7200000).toISOString(),
        updatedAt: new Date(baseTime - 7200000).toISOString(),
        reactions: [],
        readBy: [],
      },
    },
    {
      id: 104,
      name: "marketing",
      description: "Marketing team updates",
      type: "public",
      avatar: "https://api.dicebear.com/7.x/shapes/svg?seed=marketing",
      memberCount: 10,
      unreadCount: 2,
      createdAt: new Date(baseTime - 86400000 * 10).toISOString(),
      updatedAt: new Date(baseTime - 5400000).toISOString(), // 1.5 hours ago
      lastMessage: {
        id: 2004,
        messageCreatedAt: new Date(baseTime - 5400000).toISOString(),
        channelId: 104,
        senderId: 5,
        sender: mockUsers[3],
        text: "Campaign launch is scheduled for next week",
        isEdited: false,
        isDeleted: false,
        createdAt: new Date(baseTime - 5400000).toISOString(),
        updatedAt: new Date(baseTime - 5400000).toISOString(),
        reactions: [],
        readBy: [],
      },
    },
    {
      id: 105,
      name: "random",
      description: "Random discussions and fun",
      type: "public",
      avatar: "https://api.dicebear.com/7.x/shapes/svg?seed=random",
      memberCount: 12,
      unreadCount: 0,
      createdAt: new Date(baseTime - 86400000 * 5).toISOString(),
      updatedAt: new Date(baseTime - 10800000).toISOString(), // 3 hours ago
      lastMessage: {
        id: 2005,
        messageCreatedAt: new Date(baseTime - 10800000).toISOString(),
        channelId: 105,
        senderId: 6,
        sender: mockUsers[4],
        text: "Who's up for lunch?",
        isEdited: false,
        isDeleted: false,
        createdAt: new Date(baseTime - 10800000).toISOString(),
        updatedAt: new Date(baseTime - 10800000).toISOString(),
        reactions: [],
        readBy: [],
      },
    },
  ];

  // Sort by updatedAt (most recent first)
  return channels.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
};
