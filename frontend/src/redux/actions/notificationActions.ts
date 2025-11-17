import type { Notification } from "@/schemas/notificationSchema";
import { getAppErrorMessage } from "@/utils/axiosApi";
import { createAsyncThunk } from "@reduxjs/toolkit";

// Get notification action
export const getNotificationAction = createAsyncThunk(
  "notification/getNotificationAction",
  async (
    notification: Omit<Notification, "id" | "timestamp">,
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
    } catch (error) {
      return rejectWithValue(getAppErrorMessage(error));
    }
  }
);
