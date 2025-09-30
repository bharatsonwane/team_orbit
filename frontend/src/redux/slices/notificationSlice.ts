import { createSlice } from '@reduxjs/toolkit';
import type { Notification } from '../actions/notificationActions';
import { getNotificationAction } from '../actions/notificationActions';

// Notification state interface
interface NotificationState {
  notifications: Notification[];
  maxNotifications: number;
  error: string | null;
}

// Initial state
const initialState: NotificationState = {
  notifications: [],
  maxNotifications: 5, // Maximum number of notifications to show at once
  error: null,
};

// Notification slice
const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    // Handle get notification action
    builder
      .addCase(getNotificationAction.fulfilled, (state, action) => {
        const newNotification = action.payload;

        // Add new notification
        state.notifications.push(newNotification);

        // Remove oldest notification if we exceed the maximum
        if (state.notifications.length > state.maxNotifications) {
          state.notifications.shift();
        }

        // Clear any previous errors
        state.error = null;
      })
      .addCase(getNotificationAction.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const { clearError } = notificationSlice.actions;

// Export slice
export default notificationSlice;

// Selectors
export const selectNotifications = (state: {
  notification: NotificationState;
}) => state.notification.notifications;

export const selectNotificationCount = (state: {
  notification: NotificationState;
}) => state.notification.notifications.length;

export const selectNotificationError = (state: {
  notification: NotificationState;
}) => state.notification.error;
