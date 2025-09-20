# 🚀 TeamOrbit - Full Stack TypeScript Application

A modern, full-stack web application built with React (Vite), Node.js, Express, and TypeScript.

## ✨ Features

- **Frontend**: React 18 with TypeScript and Vite
- **Backend**: Node.js with Express and TypeScript
- **Authentication**: User registration, login, and profile management
- **User Management**: CRUD operations for users
- **Modern UI**: Beautiful, responsive design with CSS animations
- **Type Safety**: Full TypeScript support across frontend and backend
- **API**: RESTful API with proper error handling

## 🏗️ Project Structure

```
teamorbit/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API services
│   │   ├── types/          # TypeScript type definitions
│   │   └── App.tsx         # Main application component
│   ├── package.json
│   └── vite.config.ts
├── backend/                  # Node.js backend application
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic services
│   │   ├── types/          # TypeScript type definitions
│   │   └── server.ts       # Main server file
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd teamorbit
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Set up environment variables**
   ```bash
   cd ../backend
   cp env.example .env
   # Edit .env with your configuration
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```
   The backend will run on `http://localhost:5100`

2. **Start the frontend development server**
   ```bash
   cd frontend
   npm run dev
   ```
   The frontend will run on `http://localhost:3000`

3. **Open your browser**
   Navigate to `http://localhost:3000` to see the application

## 🛠️ Available Scripts

### Backend
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run clean` - Clean build directory

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Health Check
- `GET /health` - Server health status

## 🎨 Frontend Components

- **Login**: User authentication form
- **Register**: User registration form
- **Dashboard**: Main application interface
- **App**: Main application wrapper with routing

## 🔧 Backend Architecture

- **Controllers**: Handle HTTP requests and responses
- **Services**: Business logic and data operations
- **Middleware**: Request processing and error handling
- **Routes**: API endpoint definitions
- **Types**: TypeScript interfaces and types

## 🚀 Deployment

### Backend
1. Build the application: `npm run build`
2. Start production server: `npm start`
3. Set environment variables for production

### Frontend
1. Build the application: `npm run build`
2. Deploy the `dist` folder to your hosting service

## 🧪 Testing

The project includes testing setup for both frontend and backend:

- **Frontend**: React Testing Library (configured)
- **Backend**: Jest setup ready

## 🔒 Security Features

- CORS configuration
- Helmet.js for security headers
- Input validation
- Error handling middleware
- Environment variable management

## 📱 Responsive Design

The frontend is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile devices

## 🎯 Future Enhancements

- Database integration (PostgreSQL/MongoDB)
- JWT token authentication
- Password hashing
- User roles and permissions
- File upload functionality
- Real-time features with WebSockets
- Unit and integration tests
- Docker containerization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

If you encounter any issues or have questions, please:
1. Check the existing issues
2. Create a new issue with detailed information
3. Contact the development team

---

**Built with ❤️ using React, Node.js, Express, and TypeScript**
# teamorbit
# teamorbit
# teamorbit
# teamorbit
# team_orbit
# team_orbit
# team_orbit
# team_orbit
# team_orbit
# team_orbit
# team_orbit
