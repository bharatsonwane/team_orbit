# Socket.IO Multi-Purpose Real-Time System Usage Guide

## 📋 Overview

This Socket.IO implementation supports multiple use cases:
- **Chat Messages** - Real-time chat functionality
- **In-App Notifications** - Push notifications to users
- **Data Refresh** - Real-time data updates for various entities

The system uses a category-based event naming convention: `category:eventName`

## 🏗️ Architecture

### Event Categories

```typescript
enum EventCategory {
  CHAT = "chat",
  NOTIFICATION = "notification",
  DATA_REFRESH = "data_refresh",
  PRESENCE = "presence",
  TYPING = "typing",
}
```

### Event Format

All events follow the format: `category:eventName`

**Examples:**
- `chat:send_message`
- `notification:new_notification`
- `data_refresh:refresh_data`

## 💬 Chat Events

### Client → Server

```typescript
// Join a channel
socket.emit("chat:join_channel", {
  channelId: 123
});

// Leave a channel
socket.emit("chat:leave_channel", {
  channelId: 123
});

// Send a message
socket.emit("chat:send_message", {
  channelId: 123,
  message: "Hello!",
  mediaUrl: "https://example.com/image.jpg" // optional
});
```

### Server → Client

```typescript
// New message received
socket.on("chat:new_message", (data) => {
  console.log("New message:", data);
  // data: { messageId, messageCreatedAt, channelId, senderUserId, message, mediaUrl, createdAt }
});

// User joined channel
socket.on("chat:user_joined", (data) => {
  console.log("User joined:", data);
});

// User left channel
socket.on("chat:user_left", (data) => {
  console.log("User left:", data);
});
```

### Server-Side: Emitting Chat Events

```typescript
import { eventHandler, EventCategory } from "@src/socket";

// Emit new message to channel
eventHandler.emitToCategory(
  EventCategory.CHAT,
  "new_message",
  {
    messageId: 123,
    messageCreatedAt: "2024-01-01T00:00:00Z",
    channelId: 456,
    senderUserId: 789,
    message: "Hello!",
  },
  { channelId: 456 }
);
```

## 🔔 Notification Events

### Client → Server

```typescript
// Mark notification as read
socket.emit("notification:mark_read", {
  notificationId: 123
});

// Get unread count
socket.emit("notification:get_unread_count", {});
```

### Server → Client

```typescript
// New notification received
socket.on("notification:new_notification", (data) => {
  console.log("New notification:", data);
  // data: { type, title, message, actionUrl, data }
});

// Unread count update
socket.on("notification:unread_count", (data) => {
  console.log("Unread count:", data.count);
});
```

### Server-Side: Sending Notifications

```typescript
import { eventHandler } from "@src/socket";

// Send notification to single user
eventHandler.emitNotification(
  123, // userId
  {
    type: "task_assigned",
    title: "New Task Assigned",
    message: "You have been assigned a new task",
    actionUrl: "/tasks/456",
    data: { taskId: 456 }
  }
);

// Send notification to multiple users
eventHandler.emitNotification(
  [123, 456, 789], // userIds
  {
    type: "project_update",
    title: "Project Updated",
    message: "Project has been updated",
  }
);
```

## 🔄 Data Refresh Events

### Client → Server

```typescript
// Subscribe to entity updates
socket.emit("data_refresh:subscribe", {
  entityType: "task", // or "project", "user", etc.
  entityId: 123 // optional - subscribe to specific entity
});

// Unsubscribe from entity updates
socket.emit("data_refresh:unsubscribe", {
  entityType: "task",
  entityId: 123
});

// Request immediate refresh
socket.emit("data_refresh:request_refresh", {
  entityType: "task",
  entityId: 123
});
```

### Server → Client

```typescript
// Data refresh event
socket.on("data_refresh:refresh_data", (data) => {
  console.log("Data refreshed:", data);
  // data: { entityType, action, data }
  
  if (data.entityType === "task") {
    // Update task in UI
    updateTaskInUI(data.data);
  }
});
```

### Server-Side: Emitting Data Refresh

```typescript
import { eventHandler, EventCategory } from "@src/socket";

// Emit data refresh to specific entity room
eventHandler.emitDataRefresh(
  "task", // entityType
  "update", // action: "create" | "update" | "delete"
  { taskId: 123, status: "completed" }, // data
  { room: "task_123" } // target room
);

// Emit to specific user
eventHandler.emitDataRefresh(
  "project",
  "create",
  { projectId: 456, name: "New Project" },
  { userId: 789 }
);

// Emit to channel (if related to chat)
eventHandler.emitDataRefresh(
  "channel",
  "update",
  { channelId: 123, name: "Updated Channel Name" },
  { channelId: 123 }
);
```

## 🎯 Custom Event Handlers

### Creating a New Handler

1. **Create handler file** (e.g., `src/socket/handlers/customHandlers.ts`):

```typescript
import { AuthenticatedSocket } from "../socketTypes";
import { EventCategory, IEventHandler, BaseEventData } from "../socketEventTypes";

const handleCustomEvent = async (
  socket: AuthenticatedSocket,
  data: BaseEventData
): Promise<void> => {
  // Your handler logic here
  console.log("Custom event received:", data);
  
  // Emit response
  socket.emit("custom:response", {
    message: "Event processed",
    timestamp: new Date().toISOString(),
  });
};

export const registerCustomHandlers = (): IEventHandler[] => {
  return [
    {
      eventName: "custom_event",
      category: EventCategory.DATA_REFRESH, // or your custom category
      handler: handleCustomEvent,
    },
  ];
};
```

2. **Register handlers** in `src/server.ts`:

```typescript
import { registerCustomHandlers } from "./socket/handlers/customHandlers";

eventHandler.registerHandlers([
  ...registerChatHandlers(),
  ...registerNotificationHandlers(),
  ...registerDataRefreshHandlers(),
  ...registerCustomHandlers(), // Add your handlers
]);
```

## 🏠 Room Management

### User Rooms
- **Format**: `user_{userId}`
- **Purpose**: Send notifications and user-specific events
- **Auto-joined**: Yes, on connection

### Channel Rooms
- **Format**: `channel_{channelId}`
- **Purpose**: Chat messages for specific channels
- **Join**: Use `chat:join_channel` event

### Entity Rooms
- **Format**: `{entityType}_{entityId}` or `entity_{entityType}`
- **Purpose**: Data refresh for specific entities
- **Join**: Use `data_refresh:subscribe` event

### Custom Rooms
```typescript
import { socketService } from "@src/socket";

// Join custom room
socketService.joinRoom(socket, "team_123");

// Leave custom room
socketService.leaveRoom(socket, "team_123");

// Emit to custom room
socketService.emitToRoom("team_123", "team:update", {
  teamId: 123,
  name: "Updated Team Name",
});
```

## 📡 Server-Side Usage Examples

### In Express Controllers/Services

```typescript
import { eventHandler, EventCategory } from "@src/socket";

// After creating a task
export const createTask = async (req: Request, res: Response) => {
  // ... create task in database
  
  // Emit data refresh to all subscribers
  eventHandler.emitDataRefresh(
    "task",
    "create",
    newTask,
    { room: `task_${newTask.id}` }
  );
  
  // Send notification to assignee
  eventHandler.emitNotification(
    newTask.assigneeId,
    {
      type: "task_assigned",
      title: "New Task Assigned",
      message: `You have been assigned: ${newTask.title}`,
      actionUrl: `/tasks/${newTask.id}`,
    }
  );
};
```

### After Database Updates

```typescript
// After updating user profile
await db.query("UPDATE users SET name = $1 WHERE id = $2", [name, userId]);

// Notify user's connections about profile update
eventHandler.emitDataRefresh(
  "user",
  "update",
  { userId, name },
  { userId }
);
```

## 🔧 Helper Functions

### Check if User is Connected

```typescript
import { connectionManager } from "@src/socket";

if (connectionManager.isUserConnected(userId)) {
  // User is online
  const connection = connectionManager.getConnection(userId);
  console.log("User is in channels:", Array.from(connection.channels));
}
```

### Get Active Connections

```typescript
import { connectionManager } from "@src/socket";

const activeCount = connectionManager.getActiveConnectionsCount();
const connections = connectionManager.getAllConnections();
```

### Get Users in Channel

```typescript
import { connectionManager } from "@src/socket";

const userIds = connectionManager.getUsersInChannel(channelId);
console.log("Users in channel:", userIds);
```

## 🎨 Event Naming Convention

### Standard Format
```
{category}:{action}
```

### Examples
- `chat:send_message` ✅
- `chat:new_message` ✅
- `notification:mark_read` ✅
- `data_refresh:subscribe` ✅
- `send_message` ❌ (missing category)
- `chat_send_message` ❌ (use colon, not underscore)

## 🚀 Best Practices

1. **Always use category prefix** for events
2. **Validate data** in handlers before processing
3. **Emit errors** to clients when validation fails
4. **Use appropriate rooms** for targeted broadcasts
5. **Log important events** for debugging
6. **Handle errors gracefully** in event handlers
7. **Use batch operations** for multiple notifications
8. **Subscribe/unsubscribe** properly to avoid memory leaks

## 📝 Complete Example

### Client-Side (React/TypeScript)

```typescript
import { io } from "socket.io-client";

const socket = io("http://localhost:5100", {
  auth: {
    token: "your-jwt-token"
  }
});

// Connection
socket.on("connected", (data) => {
  console.log("Connected:", data);
});

// Chat
socket.emit("chat:join_channel", { channelId: 123 });
socket.on("chat:new_message", (data) => {
  console.log("New message:", data);
});

// Notifications
socket.on("notification:new_notification", (notification) => {
  showNotification(notification);
});

// Data Refresh
socket.emit("data_refresh:subscribe", {
  entityType: "task",
  entityId: 456
});
socket.on("data_refresh:refresh_data", (data) => {
  if (data.entityType === "task" && data.action === "update") {
    updateTaskInUI(data.data);
  }
});
```

### Server-Side (Express Controller)

```typescript
import { eventHandler, EventCategory } from "@src/socket";

export const updateTaskController = async (req: Request, res: Response) => {
  // Update task in database
  const updatedTask = await updateTask(req.params.id, req.body);
  
  // Emit data refresh to subscribers
  eventHandler.emitDataRefresh(
    "task",
    "update",
    updatedTask,
    { room: `task_${updatedTask.id}` }
  );
  
  // Notify assignee if status changed
  if (req.body.status !== updatedTask.status) {
    eventHandler.emitNotification(
      updatedTask.assigneeId,
      {
        type: "task_status_changed",
        title: "Task Status Updated",
        message: `Task "${updatedTask.title}" status changed to ${updatedTask.status}`,
        actionUrl: `/tasks/${updatedTask.id}`,
      }
    );
  }
  
  res.json(updatedTask);
};
```

This system provides a flexible, scalable foundation for real-time communication across multiple features in your application! 🎉

