# API Documentation

Complete API reference for the TeamOrbit backend application.

## 🌐 Base URL

- **Development:** `http://localhost:5100`
- **Production:** `https://api.teamorbit.com`

## 📚 API Overview

The TeamOrbit API is a RESTful API built with Express.js and TypeScript. It provides endpoints for user management, authentication, and real-time chat functionality.

### Features

- JWT-based authentication
- User management
- Real-time chat with Socket.IO
- OpenAPI/Swagger documentation
- Request validation with Zod
- Error handling and logging

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

### JWT Token Structure

The JWT token contains the following payload:

```typescript
interface JwtTokenPayload {
  userId: number;
  email: string;
  userRoles: Array<{
    id: number;
    label: string;
    lookupTypeId: number;
  }>;
}
```

### AuthenticatedRequest Interface

Controllers that require authentication should use the `AuthenticatedRequest` type:

```typescript
import { AuthenticatedRequest } from '../middleware/authRoleMiddleware';

export const getUserProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId; // Access authenticated user data
    const userRoles = req.user?.userRoles; // Access user roles
    
    // Your controller logic here
  } catch (error) {
    next(error);
  }
};
```

### User Authentication Endpoints

#### Login

```http
POST /api/user/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "tenantId": 1,
    "userRoles": [
      {
        "id": 1,
        "label": "Standard",
        "lookupTypeId": 1
      }
    ]
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Signup

```http
POST /api/user/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

**Response:**

```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "tenantId": 1,
    "userRoles": []
  }
}
```

#### Signout

```http
POST /api/user/signout
```

**Response:**

```json
{
  "message": "User signed out successfully"
}
```

#### Get Profile

```http
GET /api/user/profile
Authorization: Bearer <token>
```

**Response:**

```json
{
  "id": 1,
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "tenantId": 1,
  "userRoles": [
    {
      "id": 1,
      "label": "Standard",
      "lookupTypeId": 1
    }
  ],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## 👥 User Management

### User Endpoints

#### Get All Users

```http
GET /api/user/list
Authorization: Bearer <token>
```

**Response:**

```json
{
  "users": [
    {
      "id": 1,
      "email": "user1@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+1234567890",
      "tenantId": 1,
      "userRoles": [
        {
          "id": 1,
          "label": "Standard",
          "lookupTypeId": 1
        }
      ],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### Get User by ID

```http
GET /api/user/:id
Authorization: Bearer <token>
```

**Response:**

```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "tenantId": 1,
    "userRoles": [
      {
        "id": 1,
        "label": "Standard",
        "lookupTypeId": 1
      }
    ],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Create User

```http
POST /api/user/create-user
Content-Type: application/json

{
  "email": "newuser@example.com",
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "+1987654321"
}
```

**Response:**

```json
{
  "user": {
    "id": 2,
    "email": "newuser@example.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "phone": "+1987654321",
    "tenantId": 1,
    "userRoles": [],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Update User Profile

```http
PUT /api/user/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "+1987654321"
}
```

**Response:**

```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "phone": "+1987654321",
    "tenantId": 1,
    "userRoles": [
      {
        "id": 1,
        "label": "Standard",
        "lookupTypeId": 1
      }
    ],
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Update User Password

```http
PUT /api/user/:id/update-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "password": "newSecurePassword123"
}
```

**Response:**

```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "tenantId": 1,
    "userRoles": [
      {
        "id": 1,
        "label": "Standard",
        "lookupTypeId": 1
      }
    ],
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## 📋 Lookup Endpoints

### Lookup Data Management

The lookup endpoints provide access to reference data used throughout the application, such as user roles, statuses, and other categorized data.

#### Get All Lookup Data

```http
GET /api/lookup/list
Authorization: Bearer <token>
```

**Description:** Retrieves all lookup types with their associated lookup values, organized hierarchically.

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "userRole",
      "lookups": [
        {
          "id": 1,
          "label": "Standard",
          "lookupTypeId": 1
        },
        {
          "id": 2,
          "label": "Admin",
          "lookupTypeId": 1
        }
      ]
    },
    {
      "id": 2,
      "name": "userStatus",
      "lookups": [
        {
          "id": 3,
          "label": "Active",
          "lookupTypeId": 2
        },
        {
          "id": 4,
          "label": "Pending",
          "lookupTypeId": 2
        },
        {
          "id": 5,
          "label": "Inactive",
          "lookupTypeId": 2
        }
      ]
    }
  ]
}
```

#### Get Lookup Type by ID

```http
GET /api/lookup/:id
Authorization: Bearer <token>
```

**Description:** Retrieves a specific lookup type and its associated values by ID.

**Parameters:**
- `id` (number): The lookup type ID

**Example:**
```http
GET /api/lookup/1
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "userRole",
    "lookups": [
      {
        "id": 1,
        "label": "Standard"
      },
      {
        "id": 2,
        "label": "Admin"
      }
    ]
  }
}
```

**Error Responses:**

```json
{
  "success": false,
  "error": {
    "message": "Lookup Type not found"
  }
}
```

### Lookup Data Structure

#### LookupType Interface
```typescript
interface LookupType {
  id: number;
  name: string;
  lookups: LookupItem[];
}
```

#### LookupItem Interface
```typescript
interface LookupItem {
  id: number;
  label: string;
  name?: string;
  lookupTypeId?: number;
}
```

## 💬 Chat Endpoints

### Chat Messages

#### Get Messages

```http
GET /api/chat/messages?channelId=1&limit=50&offset=0
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "sender_id": 1,
      "receiver_id": 2,
      "message": "Hello!",
      "media_url": null,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### Send Message

```http
POST /api/chat/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "receiver_id": 2,
  "message": "Hello!",
  "media_url": "https://example.com/image.jpg"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "sender_id": 1,
    "receiver_id": 2,
    "message": "Hello!",
    "media_url": "https://example.com/image.jpg",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Get Chat Channels

```http
GET /api/chat/channels
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "General Chat",
      "participants": [1, 2, 3],
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

## 🔍 System Endpoints

### Health Check

```http
GET /health
```

**Response:**

```json
{
  "status": "OK",
  "message": "Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### API Documentation

```http
GET /docs
```

Returns the Swagger UI documentation interface.

### Health Check Endpoint

```http
GET /health
```

**Response:**

```json
{
  "status": "OK",
  "message": "Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Note:** The `/test` endpoint has been removed in favor of the standardized `/health` endpoint.

## 📊 Response Format

### Success Response

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data
  }
}
```

### Enhanced User Response Format

User endpoints now return comprehensive user data including role information:

**User Object Structure:**
- Basic user information (id, name, email, phone, etc.)
- User status and tenant information
- Roles array with complete role objects including lookup relationships
- Conditional password field (only included when specifically requested)
- Timestamp information for creation and updates

**Role Integration:**
- User roles are returned as structured arrays
- Each role object contains id, label, and lookup type information
- Empty array returned for users with no assigned roles
- Supports multiple role assignments per user

### Error Response (Updated Format)

```json
{
  "message": "Error description"
}
```

### Error Response (Development Mode)

```json
{
  "message": "Error description",
  "stack": "Error: Detailed error stack trace..."
}
```

### Legacy Error Response (Being Phased Out)

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "email": "Email is required"
    }
  }
}
```

## 🚨 Error Codes

| Code               | HTTP Status | Description              |
| ------------------ | ----------- | ------------------------ |
| `VALIDATION_ERROR` | 400         | Input validation failed  |
| `UNAUTHORIZED`     | 401         | Authentication required  |
| `FORBIDDEN`        | 403         | Insufficient permissions |
| `NOT_FOUND`        | 404         | Resource not found       |
| `CONFLICT`         | 409         | Resource already exists  |
| `INTERNAL_ERROR`   | 500         | Internal server error    |

## 🔒 Rate Limiting

The API implements rate limiting to prevent abuse:

- **Authentication endpoints:** 5 requests per minute per IP
- **General endpoints:** 100 requests per minute per IP
- **Chat endpoints:** 30 requests per minute per user

## 📝 Request Validation

All requests are validated using Zod schemas:

### User Registration Schema

```typescript
{
  email: string().email().required(),
  password: string().min(6).required(),
  first_name: string().min(1).required(),
  last_name: string().min(1).required()
}
```

### Message Schema

```typescript
{
  receiver_id: number().positive().required(),
  message: string().min(1).max(1000).required(),
  media_url: string().url().optional()
}
```

## 🔄 WebSocket Events

### Connection

```javascript
const socket = io('http://localhost:5100');

// Join a channel
socket.emit('joinChannel', { userId: 1 });

// Send a message
socket.emit('sendMessage', {
  senderId: 1,
  receiverId: 2,
  message: 'Hello!',
  mediaUrl: 'https://example.com/image.jpg',
});

// Listen for messages
socket.on('receiveMessage', message => {
  console.log('New message:', message);
});
```

### Events

- `joinChannel` - Join a chat channel
- `sendMessage` - Send a message
- `receiveMessage` - Receive a message
- `disconnect` - User disconnected

## 🧪 Testing

### Using cURL

#### Login

```bash
curl -X POST http://localhost:5100/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

#### Get Users

```bash
curl -X GET http://localhost:5100/api/users \
  -H "Authorization: Bearer <your-token>"
```

#### Get Lookup Data

```bash
curl -X GET http://localhost:5100/api/lookup/list \
  -H "Authorization: Bearer <your-token>"
```

#### Get Specific Lookup Type

```bash
curl -X GET http://localhost:5100/api/lookup/1 \
  -H "Authorization: Bearer <your-token>"
```

### Using Postman

1. Import the OpenAPI specification from `/docs`
2. Set up environment variables for base URL and tokens
3. Use the collection to test all endpoints

## 📚 OpenAPI Specification

The TeamOrbit backend features a comprehensive OpenAPI documentation system built with Zod schemas and the ServiceResponse pattern, located in `src/openApiDocs/`.

### OpenAPI Endpoints

- **Interactive Documentation:** `http://localhost:5100/docs` - Swagger UI interface
- **JSON Specification:** `http://localhost:5100/docs/swagger.json` - Raw OpenAPI spec

### Features

- **Schema-driven Documentation:** Auto-generated from Zod validation schemas
- **ServiceResponse Integration:** Standardized response format across all endpoints
- **Interactive Testing:** Test endpoints directly from the documentation
- **JWT Authentication:** Built-in bearer token support
- **Real-time Validation:** Request/response validation against schemas
- **Code Generation:** Export for client SDK generation

### OpenAPI Architecture

The documentation system includes:
- **openApiRoutes.ts:** Swagger UI routes and JSON endpoint
- **openAPIDocumentGenerator.ts:** Document generation utilities and registry
- **serviceResponse.ts:** Service response class and schemas

For detailed information about the OpenAPI system, see [OpenAPI Documentation](./OPENAPI.md).

## 🔧 Development

### Adding New Endpoints

1. **Create Controller**

```typescript
// src/controllers/example.controller.ts
export const getExample = async (req: Request, res: Response) => {
  try {
    const data = await exampleService.getData();
    res.success(data);
  } catch (error) {
    res.error(error);
  }
};
```

2. **Create Route**

```typescript
// src/routes/example.routes.ts
import { getExample } from '../controllers/example.controller';

router.get('/', getExample);
```

3. **Add to Main Routes**

```typescript
// src/routes/routes.ts
import exampleRoutes from './example.routes';

app.use('/api/example', exampleRoutes);
```

4. **Update Documentation**

- Add endpoint to OpenAPI specification
- Update this documentation
- Test the endpoint

## 📖 Additional Resources

- [Database Schema](./DATABASE.md) - Database design and relationships
- [Architecture Guide](../architecture/ARCHITECTURE.md) - System architecture
- [Development Guide](../development/DEVELOPMENT.md) - Development best practices
- [Deployment Guide](../deployment/DEPLOYMENT.md) - Production deployment
