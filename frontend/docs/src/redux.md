# Redux State Management

Complete documentation for Redux Toolkit state management in TeamOrbit frontend.

## 📚 Overview

TeamOrbit uses Redux Toolkit for global state management with TypeScript support.

## 🏗️ Store Structure

```typescript
// src/redux/store.tsx
import { configureStore } from "@reduxjs/toolkit";
import userSlice from "./slices/userSlice";
import notificationSlice from "./slices/notificationSlice";
import tenantSlice from "./slices/tenantSlice";
import lookupSlice from "./slices/lookupSlice";

export const store = configureStore({
  reducer: {
    user: userSlice.reducer,
    notification: notificationSlice.reducer,
    tenant: tenantSlice.reducer,
    lookup: lookupSlice.reducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["notification/autoHideNotification"],
      },
    }),
  devTools: process.env.NODE_ENV !== "production",
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

## 📦 Slices

### User Slice

```typescript
// src/redux/slices/userSlice.ts
import { createSlice } from "@reduxjs/toolkit";
import type { User } from "@/schemas/user";

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
  name: "user",
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
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Notification } from "@/schemas/notification";

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
  name: "notification",
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

### Lookup Slice

```typescript
// src/redux/slices/lookupSlice.ts
import { createSlice } from "@reduxjs/toolkit";
import type { LookupType } from "../../schemas/lookup";
import { getLookupListAction } from "../actions/lookupAction";

interface LookupState {
  lookupList: LookupType[];
  isLoading: boolean;
  error: string | null;
}

const initialState: LookupState = {
  lookupList: [],
  isLoading: false,
  error: null,
};

export const lookupSlice = createSlice({
  name: "lookup",
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
    clearLookupList: state => {
      state.lookupList = [];
    },
  },
  extraReducers: builder => {
    builder
      .addCase(getLookupListAction.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getLookupListAction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.lookupList = action.payload;
        state.error = null;
      })
      .addCase(getLookupListAction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearLookupList } = lookupSlice.actions;
export default lookupSlice;
```

## 🎯 Async Actions

### Lookup Actions

```typescript
// src/redux/actions/lookupAction.ts
import { createAsyncThunk } from "@reduxjs/toolkit";
import getAxios, { getAppErrorMessage } from "../../utils/axiosApi";
import type { LookupListResponse } from "@/schemas/lookup";

/** Get lookup list action - API call only */
export const getLookupListAction = createAsyncThunk(
  "lookup/getLookupListAction",
  async (_, { rejectWithValue }) => {
    try {
      const response =
        await getAxios().get<LookupListResponse>("/api/lookup/list");
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(getAppErrorMessage(error));
    }
  }
);
```

### User Actions

```typescript
// src/redux/actions/userActions.ts
import { createAsyncThunk } from "@reduxjs/toolkit";
import getAxios from "@/utils/axiosApi";
import type { LoginCredentials, AuthResponse } from "@/schemas/user";

export const loginAction = createAsyncThunk<
  AuthResponse,
  LoginCredentials,
  { rejectValue: string }
>("user/login", async (credentials, { rejectWithValue }) => {
  try {
    const response = await getAxios().post<AuthResponse>(
      "/api/user/login",
      credentials
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Login failed");
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

  return <div>{user?.firstName}</div>;
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
import { useDispatch } from "react-redux";
import { loginAction } from "@/redux/actions/userActions";

function LoginForm() {
  const dispatch = useDispatch();

  const handleLogin = async (credentials: LoginCredentials) => {
    const result = await dispatch(loginAction(credentials));

    if (loginAction.fulfilled.match(result)) {
      // Success
      console.log("Login successful", result.payload);
    } else {
      // Error
      console.error("Login failed", result.payload);
    }
  };
}
```

## 🔍 Lookup Data Access Pattern

The lookup system provides a clean, direct approach to accessing global lookup data without unnecessary transformations.

### Automatic Loading

Lookup data is automatically loaded when the app starts:

```typescript
// src/App.tsx
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getLookupListAction } from './redux/actions/lookupAction';
import type { AppDispatch } from './redux/store';

function App() {
  const dispatch = useDispatch<AppDispatch>();

  // Dispatch lookup list action when app loads initially
  useEffect(() => {
    dispatch(getLookupListAction());
  }, [dispatch]);

  return <Routes>...</Routes>;
}
```

### Direct Component Access

Components access lookup data directly without transformation:

```typescript
// Clean approach - direct usage
import { useSelector } from 'react-redux';
import { selectLookupTypeByName } from '@/redux/slices/lookupSlice';
import type { RootState } from '@/redux/store';

function CreateTenantDialog() {
  // Get lookup type directly
  const tenantStatusType = useSelector((state: RootState) =>
    selectLookupTypeByName(state, 'TENANT_STATUS')
  );

  return (
    <select {...register('status')}>
      <option value=''>Select a status</option>
      {tenantStatusType?.lookups.map((item) => (
        <option key={item.id} value={item.name}>
          {item.label}
        </option>
      ))}
    </select>
  );
}
```

### Available Selectors

```typescript
// Basic selectors
export const selectLookupList = (state: RootState) => state.lookup.lookupList;
export const selectLookupLoading = (state: RootState) => state.lookup.isLoading;
export const selectLookupError = (state: RootState) => state.lookup.error;

// Helper selector for specific lookup types
export const selectLookupTypeByName = (state: RootState, name: string) =>
  state.lookup.lookupList.find(lookupType => lookupType.name === name);
```

### Lookup Types Available

- **USER_ROLE**: Platform and tenant roles (PLATFORM_ADMIN, TENANT_USER, etc.)
- **USER_STATUS**: User account statuses (ACTIVE, PENDING, DEACTIVATED, etc.)
- **TENANT_STATUS**: Tenant statuses (ACTIVE, PENDING, DEACTIVATED, etc.)
- **CHAT_TYPE**: Chat conversation types (ONE_TO_ONE, GROUP)

### Form Integration Example

```typescript
function MyForm() {
  const tenantStatusType = useSelector((state: RootState) =>
    selectLookupTypeByName(state, 'TENANT_STATUS')
  );

  const onSubmit = (data: FormData) => {
    // Find statusId directly from lookup data
    const selectedStatus = tenantStatusType?.lookups.find(
      item => item.name === data.status
    );
    const statusId = selectedStatus?.id || 12; // Default fallback

    // Submit with statusId
    submitData({ ...data, statusId });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <select {...register('status')}>
        {tenantStatusType?.lookups.map((item) => (
          <option key={item.id} value={item.name}>
            {item.label}
          </option>
        ))}
      </select>
    </form>
  );
}
```

### Benefits of This Approach

- ✅ **Direct Access**: No unnecessary data transformations
- ✅ **Clean Code**: Fewer abstractions and intermediate variables
- ✅ **Better Performance**: No mapping overhead
- ✅ **Type Safety**: Uses original lookup item types
- ✅ **Consistency**: Same pattern across all components
- ✅ **Maintainability**: Simpler logic, easier to debug

## 📊 State Shape

```typescript
{
  user: {
    user: {
      id: number,
      email: string,
      firstName: string,
      lastName: string,
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
  },
  tenant: {
    tenants: Tenant[],
    currentTenant: Tenant | null,
    tenantUsers: TenantUser[],
    isLoading: boolean,
    error: string | null
  },
  lookup: {
    lookupList: [
      {
        id: number,
        name: string, // e.g., 'USER_ROLE', 'TENANT_STATUS'
        label: string,
        isSystem: boolean,
        createdAt: string,
        lookups: [
          {
            id: number,
            name: string, // e.g., 'PLATFORM_ADMIN', 'ACTIVE'
            label: string,
            description: string | null,
            isSystem: boolean,
            sortOrder: number,
            createdBy: number | null,
            lookupTypeId: number
          }
        ]
      }
    ],
    isLoading: boolean,
    error: string | null
  }
}
```

## 🔗 Related Documentation

- [Lookup System](lookup-system.md) - Comprehensive lookup data management guide
- [Architecture](../architecture.md) - Overall architecture
- [Schemas](schema.md) - Type definitions
- [Components](components.md) - Component usage examples

---

**For implementation patterns**: [Getting Started Guide](../getting-started.md)
