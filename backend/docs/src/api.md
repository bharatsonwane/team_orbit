# API Documentation

Complete reference for the TeamOrbit backend API - from quick start to detailed endpoint documentation.

## 🚀 Quick Start

### Base URL

```
Development: http://localhost:5100
Production: https://api.teamorbit.com
```

### Authentication

All protected endpoints require a JWT token in the Authorization header:

```http
Authorization: Bearer <your_jwt_token>
```

Get a token by logging in:

```bash
curl -X POST http://localhost:5100/api/user/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```

### Interactive Documentation

Visit the Swagger UI for interactive API exploration:

```
http://localhost:5100/docs
```

## 🔑 API Endpoints

### Authentication

- **POST** `/api/user/login` - Login
  _Authenticate a user and receive a JWT token._ <br>
  **Sample Request:**

  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```

- **POST** `/api/user/signup` - Register
  _Register a new user account._ <br>
  **Sample Request:**
  ```json
  {
    "email": "newuser@example.com",
    "password": "password123",
    "firstName": "Jane",
    "lastName": "Smith",
    "title": "Ms",
    "gender": "Female",
    "bloodGroup": "O+",
    "marriedStatus": "Single"
  }
  ```
- **POST** `/api/user/signout` - Logout

### Post Auth API

- **GET** `/api/user/profile` - Get profile (requires auth) <br>
  **Headers:** `Authorization: Bearer <token>`

### Users

- **GET** `/api/user/list` - Get all users with optional filters (requires auth)
  - Query Parameters:
    - `roleCategory` (optional): Filter by role category ("PLATFORM" or "TENANT")
    - `tenantId` (optional): Filter users by tenant ID (required when roleCategory="TENANT")
    - `searchTerm` (optional): Search users by name or email
- **GET** `/api/user/:id` - Get user by ID (requires auth)
- **POST** `/api/user/create` - Create user for tenant (role-based permissions)
- **PUT** `/api/user/:id` - Update user (requires auth)
- **PUT** `/api/user/:id/password` - Update password (requires auth)

### Tenants

- **POST** `/api/tenant/create` - Create tenant (requires admin role)
- **GET** `/api/tenant/list` - Get all tenants (requires auth)
- **GET** `/api/tenant/:id` - Get tenant by ID (requires auth)
- **PUT** `/api/tenant/:id` - Update tenant (requires auth)

**Note**: To get users for a specific tenant, use `/api/user/list?tenantId={id}&roleCategory=TENANT`

#### User Endpoints Details

**GET** `/api/user/list`
_Retrieve a list of users with optional filtering by role category, tenant, and search term._ <br>
**Headers:** `Authorization: Bearer <token>` <br>
**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `roleCategory` | string | No | Filter by role category: "PLATFORM" or "TENANT" |
| `tenantId` | number | Conditional | Required when `roleCategory="TENANT"` |
| `searchTerm` | string | No | Search users by name or email (case-insensitive) |

**Use Cases:**

1. **Get all platform users:**
   ```
   GET /api/user/list?roleCategory=PLATFORM
   ```

2. **Get all tenant users for a specific tenant:**
   ```
   GET /api/user/list?tenantId=8&roleCategory=TENANT
   ```

3. **Get all users (no filtering):**
   ```
   GET /api/user/list
   ```

4. **Search users with a search term:**
   ```
   GET /api/user/list?searchTerm=john
   ```

**Sample Response:**

```json
[
  {
    "id": 1,
    "title": "Mr",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "1234567890",
    "tenantId": 1,
    "statusId": 8,
    "statusName": "USER_STATUS_ACTIVE",
    "statusLabel": "Active",
    "isArchived": false,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z",
    "roles": [
      {
        "id": 4,
        "name": "TENANT_ADMIN",
        "label": "Tenant Admin",
        "lookupTypeId": 1,
        "isSystem": true
      }
    ]
  }
]
```

**cURL Examples:**

```bash
# Get platform users
curl 'http://localhost:5100/api/user/list?roleCategory=PLATFORM' \
  -H 'Authorization: Bearer <your_token>'

# Get tenant users for tenant ID 8
curl 'http://localhost:5100/api/user/list?tenantId=8&roleCategory=TENANT' \
  -H 'Authorization: Bearer <your_token>'

# Search for users with name containing "john"
curl 'http://localhost:5100/api/user/list?searchTerm=john' \
  -H 'Authorization: Bearer <your_token>'
```

**Validation Rules:**

- If `roleCategory="TENANT"`, then `tenantId` is **required**
- If `roleCategory="PLATFORM"`, then `tenantId` is **ignored**
- `roleCategory` must be either "PLATFORM" or "TENANT" (case-sensitive)

---

**POST** `/api/user/create`
_Create a new user for a tenant with role-based permissions._ <br>
**Headers:** `Authorization: Bearer <token>` <br>
**Sample Request Body:**

```json
{
  "title": "Mr",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@acme.com",
  "phone": "1234567890",
  "password": "password123",
  "tenantId": 1,
  "statusId": 8,
  "roleIds": [4]
}
```

**Sample Response:**

```json
{
  "id": 5,
  "title": "Mr",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@acme.com",
  "phone": "1234567890",
  "tenantId": 1,
  "statusId": 8,
  "isArchived": false,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

**Permission Matrix:**

- **PLATFORM_SUPER_ADMIN**: Can create users with any role
- **PLATFORM_ADMIN**: Can create users with roles: PLATFORM_USER, TENANT_ADMIN, TENANT_MANAGER, TENANT_USER
- **TENANT_ADMIN**: Can create users with roles: TENANT_MANAGER, TENANT_USER
- **PLATFORM_USER**: Cannot create any users
- **TENANT_USER**: Cannot create any users

#### Tenant Endpoints Details

**POST** `/api/tenant/create`
_Create a new tenant organization._ <br>
**Headers:** `Authorization: Bearer <token>` <br>
**Sample Request Body:**

```json
{
  "name": "acme_corp",
  "label": "ACME Corporation",
  "description": "Software development company",
  "statusId": 12
}
```

**Sample Response:**

```json
{
  "id": 1,
  "name": "acme_corp",
  "label": "ACME Corporation",
  "description": "Software development company",
  "statusId": 12,
  "isArchived": false,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z",
  "archivedAt": null
}
```

### Lookup Data

- **GET** `/api/lookup/list` - Get all lookup data (public)
- **GET** `/api/lookup/type/:id` - Get lookup type by ID (public)
- **GET** `/api/lookup/type-by-name/:name` - Get lookup type by name (public)

#### Lookup Endpoints Details

**GET** `/api/lookup/type-by-name/:name`
_Retrieve a lookup type and all its associated lookups by the lookup type name._ <br>
**Parameters:**

- `name` (path) - The name of the lookup type (e.g., "USER_ROLE", "STATUS") <br>
  **Sample Response:**

```json
{
  "id": 1,
  "name": "USER_ROLE",
  "label": "User Roles",
  "isSystem": true,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "lookups": [
    {
      "id": 1,
      "name": "PLATFORM_ADMIN",
      "label": "Platform Administrator",
      "description": "Full platform access",
      "isSystem": true,
      "sortOrder": 1,
      "createdBy": 1,
      "lookupTypeId": 1
    }
  ]
}
```

### Chat

- **GET** `/api/chat/chat/:senderId/:receiverId` - Get messages
- **POST** `/api/chat/send` - Send message

### System

- **GET** `/health` - Health check (public)
- **GET** `/docs` - API documentation (public)

## 🔒 Role-Based Access Control

The API implements role-based access control with the following roles:

### Platform Roles

- **PLATFORM_SUPER_ADMIN**: Full system access
- **PLATFORM_ADMIN**: Administrative access
- **PLATFORM_USER**: Standard platform user

### Tenant Roles

- **TENANT_ADMIN**: Tenant administrator
- **TENANT_MANAGER**: Tenant manager
- **TENANT_USER**: Standard tenant user

### Access Control Examples

```typescript
// Require any authenticated user
middleware: [authRoleMiddleware()];

// Require specific roles
middleware: [
  authRoleMiddleware(
    userRoleKeys.PLATFORM_SUPER_ADMIN,
    userRoleKeys.PLATFORM_ADMIN
  ),
];
```

## 📋 Data Schemas

For detailed and up-to-date schemas, refer to the OpenAPI specification at `/docs` or check the source code schemas in `src/schemas/`.

## 🚨 Error Codes

| Status Code | Description                            |
| ----------- | -------------------------------------- |
| 200         | Success                                |
| 201         | Created                                |
| 400         | Bad Request - Invalid input            |
| 401         | Unauthorized - Authentication required |
| 403         | Forbidden - Insufficient permissions   |
| 404         | Not Found - Resource not found         |
| 409         | Conflict - Resource already exists     |
| 500         | Internal Server Error                  |

## 🧪 Testing the API

### Using cURL

```bash
# Health check
curl http://localhost:5100/health

# User login
curl -X POST http://localhost:5100/api/user/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'

# Get user profile (with token)
curl http://localhost:5100/api/user/profile \
  -H "Authorization: Bearer <your_token>"

# Get lookup data
curl http://localhost:5100/api/lookup/list

# Get lookup type by name
curl http://localhost:5100/api/lookup/type-by-name/USER_ROLE

# Get status lookup type
curl http://localhost:5100/api/lookup/type-by-name/STATUS

# Get department lookup type
curl http://localhost:5100/api/lookup/type-by-name/DEPARTMENT
```

### Using Postman

1. Import the OpenAPI specification from `/docs`
2. Set up environment variables for base URL and tokens
3. Use the collection to test all endpoints

## 🔄 Rate Limiting

Rate limiting is not currently implemented but is planned for production deployment.

## 📝 Changelog

### Version 1.0.0 (Current)

- Initial API implementation
- User authentication and management
- Tenant
- Lookup data system
- Chat endpoints (basic implementation)

---

**Related Documentation:**

- [Controllers](controllers.md) - Controller implementation
- [Services](services.md) - Business logic layer
- [Architecture](../architecture.md) - System architecture
