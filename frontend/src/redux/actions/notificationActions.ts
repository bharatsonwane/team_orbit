import { createAsyncThunk } from '@reduxjs/toolkit';

// Notification interface
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  timestamp: number;
}

// Get notification action
export const getNotificationAction = createAsyncThunk(
  'notification/getNotificationAction',
  async (
    notification: Omit<Notification, 'id' | 'timestamp'>,
    { rejectWithValue }
  ) => {
    try {
      // Generate unique ID
      const notificationId = `notification-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      // Create full notification object
      const fullNotification: Notification = {
        ...notification,
        id: notificationId,
        timestamp: Date.now(),
        duration: notification.duration || 5100,
      };

      return fullNotification;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create notification');
    }
  }
);
