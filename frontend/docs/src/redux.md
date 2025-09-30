# Redux State Management

Complete documentation for Redux Toolkit state management in TeamOrbit frontend.

## 📚 Overview

TeamOrbit uses Redux Toolkit for global state management with TypeScript support.

## 🏗️ Store Structure

```typescript
// src/redux/store.tsx
import { configureStore } from '@reduxjs/toolkit';
import userSlice from './slices/userSlice';
import notificationSlice from './slices/notificationSlice';

export const store = configureStore({
  reducer: {
    user: userSlice.reducer,
    notification: notificationSlice.reducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['notification/autoHideNotification'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

## 📦 Slices

### User Slice

```typescript
// src/redux/slices/userSlice.ts
import { createSlice } from '@reduxjs/toolkit';
import type { User } from '@/schemas/user';

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
  },
});

export const { clearError } = userSlice.actions;
export default userSlice;
```

### Notification Slice

```typescript
// src/redux/slices/notificationSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Notification } from '@/schemas/notification';

interface NotificationState {
  notifications: Notification[];
  count: number;
  error: string | null;
}

const initialState: NotificationState = {
  notifications: [],
  count: 0,
  error: null,
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.push(action.payload);
      state.count += 1;
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        n => n.id !== action.payload
      );
      state.count -= 1;
    },
    clearNotifications: state => {
      state.notifications = [];
      state.count = 0;
    },
  },
});

export const { addNotification, removeNotification, clearNotifications } =
  notificationSlice.actions;
export default notificationSlice;
```

## 🎯 Async Actions

### User Actions

```typescript
// src/redux/actions/userActions.ts
import { createAsyncThunk } from '@reduxjs/toolkit';
import getAxios from '@/utils/axiosApi';
import type { LoginCredentials, AuthResponse } from '@/schemas/user';

export const loginAction = createAsyncThunk<
  AuthResponse,
  LoginCredentials,
  { rejectValue: string }
>('user/login', async (credentials, { rejectWithValue }) => {
  try {
    const response = await getAxios().post<AuthResponse>(
      '/api/user/login',
      credentials
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Login failed');
  }
});
```

## 🔧 Usage in Components

### Using useSelector

```typescript
import { useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';

function MyComponent() {
  const user = useSelector((state: RootState) => state.user.user);
  const isAuthenticated = useSelector(
    (state: RootState) => state.user.isAuthenticated
  );

  return <div>{user?.first_name}</div>;
}
```

### Using useDispatch

```typescript
import { useDispatch } from 'react-redux';
import { clearError } from '@/redux/slices/userSlice';
import type { AppDispatch } from '@/redux/store';

function MyComponent() {
  const dispatch = useDispatch<AppDispatch>();

  const handleClearError = () => {
    dispatch(clearError());
  };

  return <button onClick={handleClearError}>Clear Error</button>;
}
```

### Dispatching Async Actions

```typescript
import { useDispatch } from 'react-redux';
import { loginAction } from '@/redux/actions/userActions';

function LoginForm() {
  const dispatch = useDispatch();

  const handleLogin = async (credentials: LoginCredentials) => {
    const result = await dispatch(loginAction(credentials));
    
    if (loginAction.fulfilled.match(result)) {
      // Success
      console.log('Login successful', result.payload);
    } else {
      // Error
      console.error('Login failed', result.payload);
    }
  };
}
```

## 📊 State Shape

```typescript
{
  user: {
    user: {
      id: number,
      email: string,
      first_name: string,
      last_name: string,
      // ... more user fields
    } | null,
    isAuthenticated: boolean,
    isLoading: boolean,
    error: string | null
  },
  notification: {
    notifications: [
      {
        id: string,
        type: 'success' | 'error' | 'info',
        message: string,
        timestamp: number
      }
    ],
    count: number,
    error: string | null
  }
}
```

## 🔗 Related Documentation

- [Architecture](architecture.md) - Overall architecture
- [Authentication](authentication.md) - Auth context integration
- [Schemas](schema.md) - Type definitions

---

**For implementation patterns**: [Getting Started Guide](../getting-started.md)
