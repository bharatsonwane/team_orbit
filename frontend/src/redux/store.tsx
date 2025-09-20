import { configureStore } from '@reduxjs/toolkit';
import notificationSlice from './slices/notificationSlice';
import userSlice from './slices/userSlice';

// Root state type
export interface RootState {
  notification: ReturnType<typeof notificationSlice.reducer>;
  user: ReturnType<typeof userSlice.reducer>;
}

// Configure the store
export const store = configureStore({
  reducer: {
    notification: notificationSlice.reducer,
    user: userSlice.reducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['notification/autoHideNotification'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['meta.arg', 'payload.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: ['notification.notifications.timestamp'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type AppDispatch = typeof store.dispatch;

// Export store
export default store;
