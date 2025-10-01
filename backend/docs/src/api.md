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
    *Authenticate a user and receive a JWT token.* <br>
    **Sample Request:**
    ```json
    {
      "email": "user@example.com",
      "password": "password123"
    }
    ```


- **POST** `/api/user/signup` - Register
    *Register a new user account.* <br>
    **Sample Request:**
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
- **POST** `/api/user/signout` - Logout

### Post Auth API
- **GET** `/api/user/profile` - Get profile (requires auth) <br>
  **Headers:** `Authorization: Bearer <token>`

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

For detailed and up-to-date schemas, refer to the OpenAPI specification at `/docs` or check the source code schemas in `src/schemas/`.

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
- Tenant
- Lookup data system
- Chat endpoints (basic implementation)

---

**Related Documentation:**
- [Controllers](controllers.md) - Controller implementation
- [Services](services.md) - Business logic layer
- [Architecture](../architecture.md) - System architecture
