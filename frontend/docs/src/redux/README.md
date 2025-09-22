# Redux Store

Redux store configuration, actions, and slices for the TeamOrbit frontend application.

## 📁 Structure

```
src/redux/
├── actions/
│   ├── notificationActions.ts    # Notification action creators
│   └── userActions.ts            # User action creators
├── slices/
│   ├── notificationSlice.ts      # Notification slice with reducers
│   └── userSlice.ts              # User slice with reducers
├── store.tsx                     # Root store configuration
└── README.md                     # This file
```

## 🛠️ Features

### Notification System

- Multiple notification types (success, error, warning, info)
- Maximum notification limit to prevent UI clutter
- Unique ID generation and timestamp tracking
- Async thunk using createAsyncThunk

### User System

- Login functionality with async login and token storage
- User state management for authentication
- Error handling for login failures
- Automatic token storage and cleanup

## 🚀 Usage

### Basic Setup

```tsx
import { Provider } from 'react-redux';
import { store } from '@/redux/store';

function App() {
  return (
    <Provider store={store}>
      <YourApp />
    </Provider>
  );
}
```

### Using Notifications

```tsx
import { useDispatch, useSelector } from 'react-redux';
import { getNotificationAction } from '@/redux/actions/notificationActions';
import { selectNotifications } from '@/redux/slices/notificationSlice';
import type { RootState, AppDispatch } from '@/redux/store';

function MyComponent() {
  const dispatch = useDispatch<AppDispatch>();
  const notifications = useSelector(selectNotifications);

  const handleSuccess = () => {
    dispatch(
      getNotificationAction({
        type: 'success',
        title: 'Success!',
        message: 'Operation completed successfully',
      })
    );
  };

  return (
    <div>
      <button onClick={handleSuccess}>Show Success</button>
      <div>
        {notifications.map(notification => (
          <div key={notification.id}>
            <strong>{notification.title}</strong>
            <p>{notification.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Using User Actions

```tsx
import { useDispatch, useSelector } from 'react-redux';
import { loginAction } from '@/redux/actions/userActions';
import {
  selectIsAuthenticated,
  selectUserLoading,
} from '@/redux/slices/userSlice';
import type { AppDispatch } from '@/redux/store';

function LoginComponent() {
  const dispatch = useDispatch<AppDispatch>();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectUserLoading);

  const handleLogin = async credentials => {
    try {
      await dispatch(loginAction(credentials)).unwrap();
      // Login successful
    } catch (error) {
      // Handle login error
      console.error('Login failed:', error);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (isAuthenticated) return <div>Welcome back!</div>;

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        handleLogin({ email: 'user@example.com', password: 'password' });
      }}
    >
      <button type='submit'>Login</button>
    </form>
  );
}
```

## 📚 Available Actions

### Notification Actions

- `getNotificationAction` - Create and show a notification

### User Actions

- `loginAction` - Login user with credentials

## 📚 Available Selectors

### Notification Selectors

- `selectNotifications` - Get all notifications
- `selectNotificationCount` - Get notification count
- `selectNotificationError` - Get notification error

### User Selectors

- `selectUser` - Get current user
- `selectIsAuthenticated` - Check if user is authenticated
- `selectUserLoading` - Check if user action is loading
- `selectUserError` - Get user error

## 📚 Related Documentation

For more information about Redux Toolkit:

- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [React Redux Documentation](https://react-redux.js.org/)
- [createAsyncThunk Documentation](https://redux-toolkit.js.org/api/createAsyncThunk)
