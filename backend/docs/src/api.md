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

## 🔑 Common Endpoints

### Authentication
- **POST** `/api/user/login` - Login
- **POST** `/api/user/signup` - Register
- **POST** `/api/user/signout` - Logout
- **GET** `/api/user/profile` - Get profile (requires auth)

### Users
- **GET** `/api/user/list` - Get all users (requires auth)
- **GET** `/api/user/:id` - Get user by ID (requires auth)
- **POST** `/api/user/create-user` - Create new user
- **PUT** `/api/user/:id` - Update user (requires auth)
- **PUT** `/api/user/:id/update-password` - Update password (requires auth)

### Tenants
- **POST** `/api/tenant/create` - Create tenant (requires admin role)
- **GET** `/api/tenant/list` - Get all tenants (requires auth)
- **GET** `/api/tenant/:id` - Get tenant by ID (requires auth)
- **PUT** `/api/tenant/:id` - Update tenant (requires auth)
- **GET** `/api/tenant/:id/users` - Get tenant users (requires auth)

### Lookup Data
- **GET** `/api/lookup/list` - Get all lookup data (public)
- **GET** `/api/lookup/type/:id` - Get lookup type by ID (public)

### Chat
- **GET** `/api/chat/chat/:senderId/:receiverId` - Get messages
- **POST** `/api/chat/send` - Send message

### System
- **GET** `/health` - Health check (public)
- **GET** `/docs` - API documentation (public)

## 📝 Quick Examples

### Login
```bash
curl -X POST http://localhost:5100/api/user/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Get User Profile
```bash
curl http://localhost:5100/api/user/profile \
  -H "Authorization: Bearer <your_token>"
```

### Create Tenant
```bash
curl -X POST http://localhost:5100/api/tenant/create \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Acme Corporation",
    "contact_email": "admin@acme.com",
    "description": "Leading tech company"
  }'
```

---

## 📚 Complete API Reference

## 📊 Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data here
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information",
  "statusCode": 400
}
```

## 🚀 API Endpoints

### Authentication Endpoints

#### POST /api/user/login
Authenticate a user and receive a JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "title": "Mr",
      "gender": "Male",
      "blood_group": "A+",
      "married_status": "Single",
      "is_active": true,
      "roles": [
        {
          "id": 1,
          "name": "PLATFORM_USER",
          "label": "Platform User",
          "description": "Standard platform user"
        }
      ]
    }
  }
}
```

#### POST /api/user/signup
Register a new user account.

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "first_name": "Jane",
  "last_name": "Smith",
  "title": "Ms",
  "gender": "Female",
  "blood_group": "O+",
  "married_status": "Single"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 2,
    "email": "newuser@example.com",
    "first_name": "Jane",
    "last_name": "Smith",
    "title": "Ms",
    "gender": "Female",
    "blood_group": "O+",
    "married_status": "Single",
    "is_active": true,
    "created_at": "2024-12-19T10:30:00.000Z",
    "updated_at": "2024-12-19T10:30:00.000Z"
  }
}
```

#### POST /api/user/signout
Sign out the current user (invalidate token).

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Signed out successfully"
}
```

### User Management Endpoints

#### GET /api/user/profile
Get the authenticated user's profile information.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "title": "Mr",
      "gender": "Male",
      "blood_group": "A+",
      "married_status": "Single",
      "is_active": true,
      "created_at": "2024-12-19T10:30:00.000Z",
      "updated_at": "2024-12-19T10:30:00.000Z",
      "roles": [...]
    }
  }
}
```

#### GET /api/user/list
Get all users (requires authentication).

**Headers:** `Authorization: Bearer <token>`

**Response:** Returns array of users with roles

#### GET /api/user/:id
Get a specific user by ID.

**Headers:** `Authorization: Bearer <token>`

**Parameters:**
- `id` (path): User ID

#### POST /api/user/create-user
Create a new user (admin function).

**Headers:** `Authorization: Bearer <token>`

**Request Body:** Same as signup

#### PUT /api/user/:id
Update user profile information.

**Headers:** `Authorization: Bearer <token>`

**Parameters:**
- `id` (path): User ID

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "title": "Mr",
  "gender": "Male",
  "blood_group": "A+",
  "married_status": "Married"
}
```

#### PUT /api/user/:id/update-password
Update user password.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "current_password": "oldpassword123",
  "new_password": "newpassword123"
}
```

### Tenant Management Endpoints

#### POST /api/tenant/create
Create a new tenant organization.

**Headers:** `Authorization: Bearer <token>`

**Required Roles:** PLATFORM_SUPER_ADMIN, PLATFORM_ADMIN, PLATFORM_USER

**Request Body:**
```json
{
  "name": "Acme Corporation",
  "description": "A leading technology company",
  "contact_email": "admin@acme.com",
  "contact_phone": "+1-555-0123",
  "address": "123 Tech Street, Silicon Valley, CA 94000",
  "website": "https://acme.com"
}
```

#### GET /api/tenant/list
Get all tenants.

**Headers:** `Authorization: Bearer <token>`

**Required Roles:** PLATFORM_SUPER_ADMIN, PLATFORM_ADMIN, PLATFORM_USER

#### GET /api/tenant/:id
Get a specific tenant by ID.

**Headers:** `Authorization: Bearer <token>`

**Parameters:**
- `id` (path): Tenant ID

#### PUT /api/tenant/:id
Update tenant information.

**Headers:** `Authorization: Bearer <token>`

**Parameters:**
- `id` (path): Tenant ID

#### GET /api/tenant/:id/users
Get all users belonging to a specific tenant.

**Headers:** `Authorization: Bearer <token>`

**Parameters:**
- `id` (path): Tenant ID

### Lookup Data Endpoints

#### GET /api/lookup/list
Get all lookup data (reference data).

**No authentication required**

**Response:**
```json
{
  "success": true,
  "message": "Lookup data retrieved successfully",
  "data": {
    "lookupTypes": [
      {
        "id": 1,
        "key": "USER_ROLE",
        "name": "User Roles",
        "description": "Available user roles in the system",
        "lookups": [
          {
            "id": 1,
            "key": "PLATFORM_SUPER_ADMIN",
            "name": "Platform Super Admin",
            "label": "Super Admin",
            "description": "Full system access",
            "sort_order": 1
          }
        ]
      }
    ]
  }
}
```

#### GET /api/lookup/type/:id
Get a specific lookup type with its values.

**No authentication required**

**Parameters:**
- `id` (path): Lookup type ID

### Chat Endpoints

#### GET /api/chat/chat/:senderId/:receiverId
Get chat messages between two users.

**Parameters:**
- `senderId` (path): Sender user ID
- `receiverId` (path): Receiver user ID

#### POST /api/chat/send
Send a chat message.

**Request Body:**
```json
{
  "sender_id": 1,
  "receiver_id": 2,
  "message": "Hello, how are you?",
  "message_type": "TEXT"
}
```

### System Endpoints

#### GET /health
Health check endpoint.

**No authentication required**

**Response:**
```json
{
  "status": "OK",
  "message": "Server is running",
  "timestamp": "2024-12-19T10:30:00.000Z"
}
```

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
middleware: [authRoleMiddleware()]

// Require specific roles
middleware: [
  authRoleMiddleware(
    userRoleKeys.PLATFORM_SUPER_ADMIN,
    userRoleKeys.PLATFORM_ADMIN
  )
]
```

## 📋 Data Schemas

### User Schema
```typescript
interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  title: 'Mr' | 'Mrs' | 'Ms' | 'Dr' | 'Prof';
  gender: 'Male' | 'Female' | 'Other';
  blood_group: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  married_status: 'Single' | 'Married' | 'Divorced' | 'Widowed';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  roles: Role[];
}
```

### Tenant Schema
```typescript
interface Tenant {
  id: number;
  name: string;
  description: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  website: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  created_at: string;
  updated_at: string;
}
```

### Lookup Schema
```typescript
interface LookupType {
  id: number;
  key: string;
  name: string;
  description: string;
  lookups: LookupItem[];
}

interface LookupItem {
  id: number;
  key: string;
  name: string;
  label: string;
  description: string;
  sort_order: number;
}
```

## 🚨 Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 500 | Internal Server Error |

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
- Tenant management
- Lookup data system
- Chat endpoints (basic implementation)

---

**Related Documentation:**
- [Controllers Reference](controllers-reference.md) - Controller implementation
- [Services Reference](services-reference.md) - Business logic layer
- [Architecture](../architecture.md) - System architecture
