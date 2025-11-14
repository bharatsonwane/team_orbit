# Chat Socket.IO Integration Roadmap

## 📋 Overview

This roadmap outlines the step-by-step implementation plan for integrating Socket.IO with the chat system. The chat system uses Node.js/Express (TypeScript) backend, React.js (TypeScript) frontend, and PostgreSQL database.

---

## 🎯 Architecture Overview

```
┌─────────────┐         WebSocket         ┌─────────────┐
│   React.js  │ ◄───────────────────────► │   Express   │
│  Frontend   │     Socket.IO Client      │   Backend   │
└─────────────┘                           └─────────────┘
                                                    │
                                                    │ SQL Queries
                                                    ▼
                                           ┌─────────────┐
                                           │ PostgreSQL  │
                                           │  Database   │
                                           └─────────────┘
```

---

## 📦 Phase 1: Backend Setup (Socket.IO Server)

### 1.1 Install Dependencies
- Install `socket.io` and `@types/socket.io` packages
- Install authentication middleware if needed (`socket.io-auth` or custom JWT)

### 1.2 Create Socket.IO Server Integration
- Initialize Socket.IO server in Express app
- Configure CORS for Socket.IO (if frontend on different origin)
- Set up Socket.IO middleware for authentication
- Create connection manager/handler

### 1.3 Authentication & Authorization
- Implement JWT token validation for Socket.IO connections
- Map Socket.IO connections to user IDs
- Store active connections (in-memory Map or Redis)
- Handle connection/disconnection events
- Implement user presence tracking

### 1.4 Room Management
- Create Socket.IO rooms based on `chatChannelId`
- Automatically join users to their channel rooms on connection
- Handle room join/leave events
- Clean up rooms when all users disconnect

---

## 🔌 Phase 2: Socket Events - Backend Handlers

### 2.1 Message Events
- **`send_message`** - Handle new message creation
  - Validate user has access to channel
  - Save message to database
  - Emit `new_message` to channel room
  - Update channel's `lastMessageId` and `lastMessageAt`
  - Handle delivery status

- **`edit_message`** - Handle message editing
  - Validate message ownership
  - Update message in database
  - Emit `message_edited` to channel room

- **`delete_message`** - Handle message deletion
  - Validate message ownership or admin rights
  - Soft delete in database
  - Emit `message_deleted` to channel room

### 2.2 Read Receipt Events
- **`mark_as_read`** - Handle read receipt
  - Batch insert into `chat_message_status` table
  - Update `lastReadMessageId` in `chat_channel_user_mapping`
  - Emit `messages_read` to channel room (optional)

- **`mark_as_delivered`** - Handle delivery receipt
  - Update `deliveredAt` in `chat_message_status` table
  - Emit delivery status to sender (optional)

### 2.3 Reaction Events
- **`add_reaction`** - Handle reaction addition
  - Insert/update in `chat_message_reaction` table
  - Emit `reaction_added` to channel room

- **`remove_reaction`** - Handle reaction removal
  - Delete from `chat_message_reaction` table
  - Emit `reaction_removed` to channel room

### 2.4 Channel Events
- **`join_channel`** - Handle channel join
  - Validate user access
  - Join Socket.IO room
  - Emit user joined to channel (optional)
  - Send channel history if needed

- **`leave_channel`** - Handle channel leave
  - Leave Socket.IO room
  - Update `chat_channel_user_mapping` (set `leftAt`)
  - Emit user left to channel (optional)

- **`typing_start`** - Handle typing indicator start
  - Emit `user_typing` to channel room (excluding sender)

- **`typing_stop`** - Handle typing indicator stop
  - Emit `user_stopped_typing` to channel room

### 2.5 Presence Events
- **`user_online`** - Track user online status
- **`user_offline`** - Track user offline status
- **`presence_update`** - Broadcast presence changes

---

## 💻 Phase 3: Frontend Setup (Socket.IO Client)

### 3.1 Install Dependencies
- Install `socket.io-client` package
- Install `@types/socket.io-client` for TypeScript

### 3.2 Create Socket.IO Client Hook/Context
- Create React Context for Socket.IO connection
- Implement connection management hook (`useSocket`)
- Handle connection lifecycle (connect, disconnect, reconnect)
- Store connection state (connected, disconnected, reconnecting)

### 3.3 Authentication Integration
- Pass JWT token in Socket.IO connection options
- Handle authentication errors
- Re-authenticate on token refresh

### 3.4 Connection Management
- Connect Socket.IO on app initialization or user login
- Disconnect on user logout
- Handle reconnection logic
- Show connection status to users

---

## 🎨 Phase 4: Frontend Socket Event Handlers

### 4.1 Message Event Handlers
- **`new_message`** - Receive new messages
  - Add message to local state
  - Play notification sound (if not current channel)
  - Update unread count
  - Scroll to bottom if in current channel

- **`message_edited`** - Receive message edits
  - Update message in local state
  - Show edit indicator

- **`message_deleted`** - Receive message deletions
  - Remove or show deleted indicator in UI

### 4.2 Read Receipt Handlers
- **`messages_read`** - Receive read receipts
  - Update read status in UI
  - Update unread count

### 4.3 Reaction Handlers
- **`reaction_added`** - Receive reaction additions
  - Update reactions in message UI

- **`reaction_removed`** - Receive reaction removals
  - Update reactions in message UI

### 4.4 Channel Handlers
- **`user_joined`** - Handle user joined channel
  - Show join notification
  - Update member list

- **`user_left`** - Handle user left channel
  - Show leave notification
  - Update member list

- **`user_typing`** - Handle typing indicators
  - Show typing indicator in UI
  - Auto-hide after timeout

- **`user_stopped_typing`** - Handle typing stop
  - Hide typing indicator

### 4.5 Presence Handlers
- **`user_online`** / **`user_offline`** - Update user presence
  - Show online/offline indicators
  - Update user list

---

## 🔄 Phase 5: Real-time Features Implementation

### 5.1 Message Sending
- Emit `send_message` event with message data
- Show optimistic update in UI
- Handle error responses
- Revert optimistic update on error

### 5.2 Read Receipts
- Automatically mark messages as read when viewed
- Batch read receipts for performance
- Use `mark_messages_read_until` database function

### 5.3 Typing Indicators
- Emit `typing_start` when user starts typing
- Emit `typing_stop` when user stops typing
- Debounce typing events to avoid spam

### 5.4 Presence System
- Emit `user_online` on connection
- Emit `user_offline` on disconnection
- Track online users per channel

---

## 🗄️ Phase 6: Database Integration Points

### 6.1 Message Creation Flow
```
1. Receive send_message event
2. Validate channel access (check chat_channel_user_mapping)
3. Insert into chat_message table
4. Get message with createdAt for foreign keys
5. Emit new_message to channel room
6. Update chat_channel (lastMessageId, lastMessageAt)
7. Create delivery status for channel members (async)
```

### 6.2 Read Receipt Flow
```
1. Receive mark_as_read event
2. Batch insert/update chat_message_status
3. Update chat_channel_user_mapping.lastReadMessageId
4. Emit messages_read to channel room (optional)
```

### 6.3 Delivery Status Flow
```
1. On new_message, create delivery status for all channel members
2. When user is online and receives message, update deliveredAt
3. Emit delivery status to sender (optional)
```

### 6.4 Reaction Flow
```
1. Receive add_reaction event
2. Insert into chat_message_reaction (with ON CONFLICT UPDATE)
3. Emit reaction_added to channel room
```

---

## 🔐 Phase 7: Security & Validation

### 7.1 Authorization Checks
- Verify user has access to channel before joining room
- Verify user can send messages to channel
- Verify message ownership before edit/delete
- Verify admin rights for channel management

### 7.2 Input Validation
- Validate message content (length, sanitize)
- Validate reaction types
- Validate channel IDs
- Rate limiting for message sending

### 7.3 Error Handling
- Handle database errors gracefully
- Handle Socket.IO errors
- Send error responses to clients
- Log errors for debugging

---

## 🚀 Phase 8: Performance Optimizations

### 8.1 Connection Optimization
- Use Redis adapter for multi-server setup
- Implement connection pooling
- Limit connections per user

### 8.2 Message Optimization
- Batch read receipts
- Throttle typing indicators
- Use cursor-based pagination for history
- Limit message history sent on channel join

### 8.3 Database Optimization
- Use database functions for batch operations
- Optimize queries with proper indexes
- Use transactions for related operations
- Async operations for non-critical updates (delivery status)

---

## 📱 Phase 9: UI/UX Enhancements

### 9.1 Real-time Indicators
- Show connection status (connected/disconnected/reconnecting)
- Show typing indicators
- Show online/offline status
- Show message delivery/read status (optional)

### 9.2 Notifications
- Browser notifications for new messages (when tab inactive)
- Sound notifications
- Desktop notifications (if PWA)

### 9.3 Message States
- Show "sending..." state
- Show "sent" state
- Show "delivered" state (optional)
- Show "read" state (optional)
- Show "failed" state with retry option

### 9.4 Optimistic Updates
- Show message immediately before server confirmation
- Update UI optimistically for reactions
- Handle rollback on errors

---

## 🧪 Phase 10: Testing

### 10.1 Backend Testing
- Unit tests for Socket.IO event handlers
- Integration tests for message flow
- Test authentication and authorization
- Test database operations

### 10.2 Frontend Testing
- Test Socket.IO connection
- Test event handlers
- Test UI updates on events
- Test error handling

### 10.3 E2E Testing
- Test full message flow (send → receive)
- Test read receipts
- Test reactions
- Test typing indicators
- Test presence updates

### 10.4 Load Testing
- Test with multiple concurrent connections
- Test message throughput
- Test reconnection behavior
- Test memory leaks

---

## 📊 Phase 11: Monitoring & Logging

### 11.1 Socket.IO Metrics
- Track active connections
- Track messages per second
- Track room sizes
- Track connection/disconnection rates

### 11.2 Error Logging
- Log Socket.IO errors
- Log authentication failures
- Log database errors
- Log client errors

### 11.3 Performance Monitoring
- Monitor message latency
- Monitor database query performance
- Monitor memory usage
- Monitor connection pool usage

---

## 🔧 Phase 12: Deployment Considerations

### 12.1 Multi-Server Setup
- Use Redis adapter for Socket.IO scaling
- Ensure sticky sessions or disable polling
- Configure Redis for pub/sub

### 12.2 Environment Variables
- Socket.IO configuration
- Redis connection details
- CORS settings
- JWT secret

### 12.3 Production Optimizations
- Enable Socket.IO compression
- Configure ping/pong intervals
- Set appropriate connection limits
- Configure CORS properly

---

## 📝 Implementation Checklist

### Backend
- [ ] Install Socket.IO dependencies
- [ ] Initialize Socket.IO server in Express
- [ ] Implement authentication middleware
- [ ] Create connection manager
- [ ] Implement room management
- [ ] Create message event handlers
- [ ] Create read receipt handlers
- [ ] Create reaction handlers
- [ ] Create channel event handlers
- [ ] Create typing indicator handlers
- [ ] Implement presence tracking
- [ ] Add database integration
- [ ] Add validation and authorization
- [ ] Add error handling
- [ ] Add logging

### Frontend
- [ ] Install Socket.IO client
- [ ] Create Socket.IO context/hook
- [ ] Implement connection management
- [ ] Add authentication to connection
- [ ] Create message event listeners
- [ ] Create read receipt listeners
- [ ] Create reaction listeners
- [ ] Create channel event listeners
- [ ] Implement typing indicators
- [ ] Implement presence indicators
- [ ] Add connection status UI
- [ ] Add notifications
- [ ] Implement optimistic updates
- [ ] Add error handling
- [ ] Add reconnection logic

### Testing
- [ ] Write backend unit tests
- [ ] Write frontend unit tests
- [ ] Write integration tests
- [ ] Write E2E tests
- [ ] Perform load testing
- [ ] Test error scenarios

### Deployment
- [ ] Configure Redis adapter (if multi-server)
- [ ] Set up environment variables
- [ ] Configure CORS
- [ ] Set up monitoring
- [ ] Set up logging
- [ ] Document API/events

---

## 🎯 Key Socket.IO Events Summary

### Client → Server Events
- `send_message` - Send new message
- `edit_message` - Edit existing message
- `delete_message` - Delete message
- `mark_as_read` - Mark messages as read
- `mark_as_delivered` - Mark messages as delivered
- `add_reaction` - Add reaction to message
- `remove_reaction` - Remove reaction from message
- `join_channel` - Join channel room
- `leave_channel` - Leave channel room
- `typing_start` - User started typing
- `typing_stop` - User stopped typing
- `user_online` - User came online
- `user_offline` - User went offline

### Server → Client Events
- `new_message` - New message received
- `message_edited` - Message was edited
- `message_deleted` - Message was deleted
- `messages_read` - Messages were read (optional)
- `reaction_added` - Reaction was added
- `reaction_removed` - Reaction was removed
- `user_joined` - User joined channel
- `user_left` - User left channel
- `user_typing` - User is typing
- `user_stopped_typing` - User stopped typing
- `user_online` - User came online
- `user_offline` - User went offline
- `error` - Error occurred
- `connected` - Socket connected
- `disconnected` - Socket disconnected

---

## 🔗 Key Database Tables Used

### Primary Tables
- `chat_channel` - Channel information
- `chat_channel_user_mapping` - User-channel relationships and `lastReadMessageId`
- `chat_message` - Messages (partitioned by `createdAt`)
- `chat_message_status` - Delivery and read status
- `chat_message_reaction` - Message reactions

### Important Fields for Socket.IO
- `chat_message.id` and `chat_message.createdAt` - Composite key for foreign keys
- `chat_channel_user_mapping.lastReadMessageId` - For fast unread count
- `chat_message_status.messageCreatedAt` - Required for foreign key
- `chat_message_reaction.messageCreatedAt` - Required for foreign key

---

## ⚠️ Important Considerations

### 1. Partitioned Table Foreign Keys
- Always include both `messageId` and `messageCreatedAt` when inserting into `chat_message_status` or `chat_message_reaction`
- Get `createdAt` from inserted message to use in related tables

### 2. Batch Operations
- Batch read receipts using database functions
- Use `mark_messages_read_until` for better performance

### 3. Room Management
- Use `chatChannelId` as room name: `socket.join(channelId)`
- Automatically join users to their channel rooms on connection

### 4. Connection Management
- Store active connections with user mapping
- Clean up on disconnection
- Handle reconnection scenarios

### 5. Message Ordering
- Use `id` (BIGSERIAL) for ordering (cursor-based pagination)
- Messages are ordered by ID, not timestamp

---

## 📚 Recommended Reading

1. [Socket.IO Official Documentation](https://socket.io/docs/v4/)
2. [Socket.IO Server API](https://socket.io/docs/v4/server-api/)
3. [Socket.IO Client API](https://socket.io/docs/v4/client-api/)
4. [Socket.IO Redis Adapter](https://socket.io/docs/v4/redis-adapter/)
5. [PostgreSQL Partitioning](https://www.postgresql.org/docs/current/ddl-partitioning.html)

---

## 🎉 Next Steps

1. Start with **Phase 1** - Backend Socket.IO setup
2. Implement **Phase 2** - Core message events
3. Move to **Phase 3** - Frontend setup
4. Gradually add features from **Phase 4-9**
5. Test thoroughly in **Phase 10**
6. Deploy and monitor in **Phase 11-12**

This roadmap provides a comprehensive guide for implementing real-time chat with Socket.IO. Follow the phases sequentially, and adjust based on your specific requirements!

