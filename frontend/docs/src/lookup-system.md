# Lookup System Documentation

Complete guide for the TeamOrbit lookup system - a clean, efficient approach to managing global lookup data.

## 📚 Overview

The lookup system provides centralized management of reference data (user roles, statuses, types) with automatic loading and direct component access patterns.

## 🏗️ Architecture

### Core Components

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   App.tsx       │    │   lookupSlice    │    │   Components    │
│                 │    │                  │    │                 │
│ Auto-loads      │───▶│ Manages state    │◀───│ Direct access   │
│ on startup      │    │ & selectors      │    │ no transforms   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Data Flow

1. **App Initialization**: `getLookupListAction` dispatched automatically
2. **API Call**: Fetches all lookup data from `/api/lookup/list`
3. **State Storage**: Data stored in `lookupSlice` with loading/error states
4. **Component Access**: Direct access via selectors, no transformations

## 🎯 Available Lookup Types

### USER_ROLE

User roles for platform and tenant access control.

```typescript
// Available roles
{
  PLATFORM_SUPER_ADMIN: "Platform Super Admin",
  PLATFORM_ADMIN: "Platform Admin",
  PLATFORM_USER: "Platform User",
  TENANT_ADMIN: "Tenant Admin",
  TENANT_MANAGER: "Tenant Manager",
  TENANT_USER: "Tenant User"
}
```

### USER_STATUS

User account statuses for lifecycle management.

```typescript
// Available statuses
{
  PENDING: "Pending",
  ACTIVE: "Active",
  DEACTIVATED: "Deactivated",
  ARCHIVED: "Archived"
}
```

### TENANT_STATUS

Tenant organization statuses.

```typescript
// Available statuses
{
  PENDING: "Pending",
  ACTIVE: "Active",
  DEACTIVATED: "Deactivated",
  ARCHIVED: "Archived"
}
```

### CHAT_TYPE

Chat conversation types.

```typescript
// Available types
{
  ONE_TO_ONE: "1:1 Chat",
  GROUP: "Group Chat"
}
```

## 🔧 Implementation

### Automatic Loading

Lookup data loads automatically when the app starts:

```typescript
// src/App.tsx
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getLookupListAction } from './redux/actions/lookupAction';
import type { AppDispatch } from './redux/store';

function App() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(getLookupListAction());
  }, [dispatch]);

  return <Routes>...</Routes>;
}
```

### Redux Store Integration

```typescript
// src/redux/store.tsx
export const store = configureStore({
  reducer: {
    user: userSlice.reducer,
    notification: notificationSlice.reducer,
    tenant: tenantSlice.reducer,
    lookup: lookupSlice.reducer, // ✅ Lookup slice integrated
  },
});
```

### Slice Implementation

```typescript
// src/redux/slices/lookupSlice.ts
interface LookupState {
  lookupList: LookupType[];
  isLoading: boolean;
  error: string | null;
}

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
```

## 🎨 Component Usage Patterns

### Direct Access Pattern (Recommended)

```typescript
import { useSelector } from 'react-redux';
import { selectLookupTypeByName } from '@/redux/slices/lookupSlice';
import type { RootState } from '@/redux/store';

function MyComponent() {
  // Get lookup type directly - no transformations
  const tenantStatusType = useSelector((state: RootState) =>
    selectLookupTypeByName(state, 'TENANT_STATUS')
  );

  return (
    <select>
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

### Form Integration

```typescript
function CreateTenantForm() {
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

### Multiple Lookup Types

```typescript
function ComplexForm() {
  const userRoles = useSelector((state: RootState) =>
    selectLookupTypeByName(state, 'USER_ROLE')
  );
  const userStatuses = useSelector((state: RootState) =>
    selectLookupTypeByName(state, 'USER_STATUS')
  );

  return (
    <form>
      <select {...register('role')}>
        {userRoles?.lookups.map((item) => (
          <option key={item.id} value={item.name}>
            {item.label}
          </option>
        ))}
      </select>

      <select {...register('status')}>
        {userStatuses?.lookups.map((item) => (
          <option key={item.id} value={item.name}>
            {item.label}
          </option>
        ))}
      </select>
    </form>
  );
}
```

## 📊 Available Selectors

### Basic Selectors

```typescript
// Get all lookup data
export const selectLookupList = (state: RootState) => state.lookup.lookupList;

// Get loading state
export const selectLookupLoading = (state: RootState) => state.lookup.isLoading;

// Get error state
export const selectLookupError = (state: RootState) => state.lookup.error;
```

### Helper Selectors

```typescript
// Get specific lookup type by name
export const selectLookupTypeByName = (state: RootState, name: string) =>
  state.lookup.lookupList.find(lookupType => lookupType.name === name);
```

## 🚀 Best Practices

### ✅ Do

- **Use Direct Access**: Access lookup data directly without transformations
- **Single Source of Truth**: Always use Redux selectors for lookup data
- **Handle Loading States**: Check `isLoading` when needed
- **Provide Fallbacks**: Use default values when lookup data is unavailable
- **Type Safety**: Use proper TypeScript types for lookup items

### ❌ Don't

- **Transform Data**: Don't create intermediate data structures
- **Duplicate Logic**: Don't re-implement lookup logic in components
- **Ignore Errors**: Handle lookup loading errors appropriately
- **Hardcode Values**: Use lookup data instead of hardcoded options

## 🔍 Data Structure

### LookupType Structure

```typescript
interface LookupType {
  id: number;
  name: string; // e.g., 'USER_ROLE', 'TENANT_STATUS'
  label: string; // e.g., 'User Role', 'Tenant Status'
  isSystem: boolean;
  createdAt: string;
  lookups: LookupItem[]; // Array of lookup items
}
```

### LookupItem Structure

```typescript
interface LookupItem {
  id: number;
  name: string; // e.g., 'PLATFORM_ADMIN', 'ACTIVE'
  label: string; // e.g., 'Platform Admin', 'Active'
  description: string | null;
  isSystem: boolean;
  sortOrder: number;
  createdBy: number | null;
  lookupTypeId: number;
}
```

## 🔗 Integration Examples

### React Hook Form Integration

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Define schema with lookup validation
const formSchema = z.object({
  status: z.string().min(1, 'Status is required'),
  role: z.string().min(1, 'Role is required'),
});

function FormWithLookups() {
  const tenantStatuses = useSelector((state: RootState) =>
    selectLookupTypeByName(state, 'TENANT_STATUS')
  );
  const userRoles = useSelector((state: RootState) =>
    selectLookupTypeByName(state, 'USER_ROLE')
  );

  const form = useForm({
    resolver: zodResolver(formSchema),
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <select {...form.register('status')}>
        {tenantStatuses?.lookups.map((item) => (
          <option key={item.id} value={item.name}>
            {item.label}
          </option>
        ))}
      </select>

      <select {...form.register('role')}>
        {userRoles?.lookups.map((item) => (
          <option key={item.id} value={item.name}>
            {item.label}
          </option>
        ))}
      </select>
    </form>
  );
}
```

### Conditional Rendering

```typescript
function ConditionalLookupComponent() {
  const lookupData = useSelector((state: RootState) =>
    selectLookupTypeByName(state, 'USER_ROLE')
  );
  const isLoading = useSelector(selectLookupLoading);
  const error = useSelector(selectLookupError);

  if (isLoading) {
    return <div>Loading lookup data...</div>;
  }

  if (error) {
    return <div>Error loading lookup data: {error}</div>;
  }

  if (!lookupData?.lookups.length) {
    return <div>No lookup data available</div>;
  }

  return (
    <select>
      {lookupData.lookups.map((item) => (
        <option key={item.id} value={item.name}>
          {item.label}
        </option>
      ))}
    </select>
  );
}
```

## 🎯 Benefits

### Performance

- ✅ **Single API Call**: Data loads once on app startup
- ✅ **No Transformations**: Direct access eliminates mapping overhead
- ✅ **Cached Data**: Redux caching prevents repeated API calls
- ✅ **Efficient Re-renders**: Minimal selector dependencies

### Developer Experience

- ✅ **Simple API**: Easy to understand and use
- ✅ **Type Safety**: Full TypeScript support
- ✅ **Consistent Pattern**: Same approach across all components
- ✅ **Auto-loading**: No manual data fetching required

### Maintainability

- ✅ **Single Source**: Centralized lookup data management
- ✅ **Clean Code**: Fewer abstractions and transformations
- ✅ **Easy Updates**: Changes to lookup data automatically reflect
- ✅ **Error Handling**: Built-in loading and error states

## 🔗 Related Documentation

- [Redux State Management](redux.md) - Complete Redux documentation
- [Components](components.md) - Component usage examples
- [Schemas](schema.md) - Type definitions
- [Architecture](architecture.md) - Overall system architecture

---

**For implementation help**: [Getting Started Guide](../getting-started.md)
