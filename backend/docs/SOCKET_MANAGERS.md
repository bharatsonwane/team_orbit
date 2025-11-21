# Socket Managers Architecture

## 📋 Overview

The Socket.IO system is now organized into separate manager classes, each responsible for a specific domain:

- **BaseSocketManager** - Common socket functionality
- **ChatSocketManager** - All chat-related functionality
- **NotificationSocketManager** - All notification-related functionality
- **DataRefreshSocketManager** - Data refresh functionality
- **SocketManager** - Main manager combining all features

## 🏗️ Architecture

```
SocketManager (Main)
├── BaseSocketManager (Common)
│   ├── Server initialization
│   ├── Authentication
│   ├── Connection management
│   ├── Room management
│   └── Event routing
├── ChatSocketManager (Chat)
│   ├── Channel rooms
│   ├── Message events
│   ├── Typing indicators
│   └── Read receipts
├── NotificationSocketManager (Notifications)
│   ├── Send notifications
│   ├── Read status
│   └── Unread count
└── DataRefreshSocketManager (Data Refresh)
    ├── Entity subscriptions
    └── Data refresh events
```

## 📁 File Structure

```
src/socket/
├── managers/
│   ├── BaseSocketManager.ts      # Common functionality
│   ├── ChatSocketManager.ts      # Chat functionality
│   ├── NotificationSocketManager.ts  # Notification functionality
│   ├── DataRefreshSocketManager.ts   # Data refresh functionality
│   ├── SocketManager.ts          # Main manager
│   └── index.ts                  # Manager exports
├── handlers/                     # Event handlers
├── socketTypes.ts               # TypeScript types
├── socketAuth.ts                # Authentication
├── socketConnectionManager.ts   # Connection tracking
├── socketEventHandler.ts        # Event handler system
├── socketEventTypes.ts          # Event types
└── index.ts                     # Main exports
```

## 🎯 Usage

### Server Initialization

```typescript
import { socketManager } from "./socket/managers/SocketManager";

// Initialize all managers at once
socketManager.initialize(server);
```

### Chat Operations

```typescript
import { socketManager } from "@src/socket/managers/SocketManager";

// Get chat manager
const chatManager = socketManager.getChat();

// Join channel
chatManager.joinChannel(socket, chatChannelId);

// Leave channel
chatManager.leaveChannel(socket, chatChannelId);

// Emit new message
chatManager.emitNewMessage(chatChannelId, {
  messageId: 123,
  messageCreatedAt: "2024-01-01T00:00:00Z",
  chatChannelId: 456,
  senderUserId: 789,
  message: "Hello!",
});

// Emit typing indicator
chatManager.emitTyping(chatChannelId, userId, true);

// Get users in channel
const users = chatManager.getUsersInChannel(chatChannelId);

// Check if user is in channel
const isInChannel = chatManager.isUserInChannel(userId, chatChannelId);
```

### Notification Operations

```typescript
import { socketManager } from "@src/socket/managers/SocketManager";

// Get notification manager
const notificationManager = socketManager.getNotification();

// Send notification to single user
notificationManager.sendNotification(userId, {
  type: "task_assigned",
  title: "New Task Assigned",
  message: "You have been assigned a new task",
  actionUrl: "/tasks/123",
  data: { taskId: 123 }
});

// Send notification to multiple users
notificationManager.sendNotificationToUsers([userId1, userId2], {
  type: "project_update",
  title: "Project Updated",
  message: "Project has been updated",
});

// Broadcast notification to all users
notificationManager.broadcastNotification({
  type: "maintenance",
  title: "System Maintenance",
  message: "System will be under maintenance",
});

// Emit unread count
notificationManager.emitUnreadCount(userId, 5);

// Mark notification as read
notificationManager.emitNotificationRead(userId, notificationId);
```

### Data Refresh Operations

```typescript
import { socketManager } from "@src/socket/managers/SocketManager";

// Get data refresh manager
const dataRefreshManager = socketManager.getDataRefresh();

// Emit entity refresh to specific room
dataRefreshManager.emitToEntityRoom("task", taskId, "update", taskData);

// Emit refresh to entity type subscribers
dataRefreshManager.emitToEntityType("project", "create", projectData);

// Emit refresh to specific user
dataRefreshManager.emitToUser(userId, "task", "update", taskData);

// Emit refresh to channel
dataRefreshManager.emitToChannel(chatChannelId, "message", "create", messageData);
```

### Common Operations (Base Manager)

```typescript
import { socketManager } from "@src/socket/managers/SocketManager";

// Join custom room
socketManager.joinRoom(socket, "team_123");

// Leave custom room
socketManager.leaveRoom(socket, "team_123");

// Emit to room
socketManager.emitToRoom("team_123", "team:update", teamData);

// Emit to user
socketManager.emitToUser(userId, "user:update", userData);

// Broadcast to all
socketManager.broadcast("system:announcement", announcementData);

// Get IO instance
const io = socketManager.getSocketIo();
```

## 📊 Manager Responsibilities

### BaseSocketManager
- ✅ Server initialization
- ✅ Authentication middleware
- ✅ Connection handling
- ✅ Disconnection handling
- ✅ User rooms (`user_{userId}`)
- ✅ Generic room management
- ✅ Event routing
- ✅ Ping/pong health checks

### ChatSocketManager
- ✅ Channel room management (`channel_{chatChannelId}`)
- ✅ Join/leave channels
- ✅ Emit new messages
- ✅ Emit message edits
- ✅ Emit message deletions
- ✅ Typing indicators
- ✅ Read receipts
- ✅ Reactions
- ✅ Channel updates
- ✅ Get users in channel
- ✅ Check user in channel

### NotificationSocketManager
- ✅ Send notifications to users
- ✅ Batch notifications
- ✅ Broadcast notifications
- ✅ Notification read status
- ✅ Unread count updates
- ✅ All notifications read

### DataRefreshSocketManager
- ✅ Entity subscriptions
- ✅ Data refresh events
- ✅ Entity room management
- ✅ Targeted refresh (user, channel, room)

## 🔄 Migration from Old Code

### Before
```typescript
import socketService from "@src/socket/socketService";

socketService.joinChannel(socket, chatChannelId);
socketService.emitToChannel(chatChannelId, "new_message", data);
```

### After
```typescript
import { socketManager } from "@src/socket/managers/SocketManager";

// Chat operations
socketManager.getChat().joinChannel(socket, chatChannelId);
socketManager.getChat().emitNewMessage(chatChannelId, data);

// Notification operations
socketManager.getNotification().sendNotification(userId, notification);

// Data refresh operations
socketManager.getDataRefresh().emitToEntityRoom("task", taskId, "update", data);
```

## ✅ Benefits

1. **Separation of Concerns** - Each manager handles one domain
2. **Better Organization** - Clear responsibility boundaries
3. **Easier Testing** - Test each manager independently
4. **Type Safety** - Full TypeScript support per manager
5. **Maintainability** - Easy to find and update features
6. **Scalability** - Add new managers without affecting others

## 📝 Example: Controller Usage

```typescript
import { socketManager } from "@src/socket/managers/SocketManager";

export const createTaskController = async (req: Request, res: Response) => {
  // Create task in database
  const task = await createTask(req.body);
  
  // Notify assignee
  socketManager.getNotification().sendNotification(
    task.assigneeId,
    {
      type: "task_assigned",
      title: "New Task Assigned",
      message: `You have been assigned: ${task.title}`,
      actionUrl: `/tasks/${task.id}`,
      data: { taskId: task.id }
    }
  );
  
  // Emit data refresh to task subscribers
  socketManager.getDataRefresh().emitToEntityRoom(
    "task",
    task.id,
    "create",
    task
  );
  
  res.json(task);
};
```

## 🎯 Summary

- **Common functionality** → `BaseSocketManager` / `socketManager` directly
- **Chat functionality** → `socketManager.getChat()`
- **Notification functionality** → `socketManager.getNotification()`
- **Data refresh functionality** → `socketManager.getDataRefresh()`

All managers are automatically initialized when `socketManager.initialize(server)` is called!

