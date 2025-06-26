# Sisyphus II - Daily Task Management App 🏔️

A modern productivity app where users manage daily tasks that automatically reset every 24 hours, embodying the Sisyphus metaphor of starting fresh each day. Built with React, FastAPI, and PostgreSQL.

## 🎯 Demo

**Live Demo**: [Coming Soon]

**Demo Credentials**: 
- Username: `demo`
- Password: `demo1234`

## 🧠 Concept

- **Daily Reset Philosophy**: Tasks automatically reset every 24 hours, encouraging focus on today's priorities
- **Clean Interface**: Minimalist design that reduces cognitive load
- **Smart Features**: Bulk operations, analytics, and intelligent task management
- **Secure**: JWT-based authentication with refresh tokens
- **Real-time**: Instant updates and responsive interactions

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │◄──►│  FastAPI Backend │◄──►│  PostgreSQL DB  │
│   (Port 3000)    │    │   (Port 8000)    │    │   (Port 5432)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   Redis Cache   │
                       │   (Port 6379)   │
                       └─────────────────┘
```

### Component Structure
```
App
├── AuthProvider (Context)
│   ├── LoginPage
│   ├── RegisterPage
│   └── DashboardPage
│       ├── TaskForm
│       ├── TaskItem
│       ├── BulkOperations
│       ├── SearchAndFilters
│       ├── TaskAnalytics
│       └── ExportImport
```

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **TypeScript** - Type safety and better developer experience
- **Vite** - Fast build tool and development server
- **TailwindCSS** - Utility-first CSS framework
- **Axios** - HTTP client for API communication
- **React Router** - Client-side routing

### Backend
- **FastAPI** - Modern, fast web framework for APIs
- **SQLAlchemy** - SQL toolkit and ORM
- **PostgreSQL** - Robust, open-source database
- **Redis** - In-memory data store for caching
- **JWT** - JSON Web Tokens for authentication
- **Pydantic** - Data validation using Python type annotations

### DevOps & Tools
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Alembic** - Database migrations
- **Python 3.9+** - Backend runtime
- **Node.js 18+** - Frontend runtime

## 🚀 Key Features

### 🔐 Authentication & Security
- **JWT Authentication**: Secure token-based auth with refresh tokens
- **Password Hashing**: bcrypt for secure password storage
- **CORS Protection**: Configured for production security
- **Input Validation**: Comprehensive request validation

### 📋 Task Management
- **CRUD Operations**: Full create, read, update, delete functionality
- **Bulk Operations**: Multi-select task management with batch processing
- **Priority Levels**: Low, Medium, High priority system
- **Categories**: Organize tasks by custom categories
- **Due Dates**: Set and track task deadlines

### ⏰ Smart Scheduling
- **Daily Reset**: Automated task reset based on user preferences
- **Redis Integration**: Efficient scheduling and caching
- **Custom Reset Times**: Users can set their preferred reset hour
- **Overdue Detection**: Automatic overdue task identification

### 📊 Analytics & Insights
- **Completion Tracking**: Monitor task completion rates
- **Productivity Metrics**: Visual analytics dashboard
- **Progress Visualization**: Charts and progress indicators
- **Performance Insights**: User productivity patterns

### 🔄 Data Management
- **Export/Import**: JSON and CSV data portability
- **Backup/Restore**: Easy data migration capabilities
- **Bulk Operations**: Efficient batch processing
- **Search & Filter**: Advanced task filtering system

### 📱 User Experience
- **Responsive Design**: Mobile-first approach
- **Real-time Updates**: Instant UI feedback
- **Keyboard Shortcuts**: Power user features
- **Accessibility**: WCAG compliant design
- **Dark/Light Mode**: Theme preferences (planned)

## 🏗️ Project Structure

```
Sisyphus/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── TaskForm.tsx
│   │   │   ├── TaskItem.tsx
│   │   │   ├── BulkOperations.tsx
│   │   │   ├── SearchAndFilters.tsx
│   │   │   ├── TaskAnalytics.tsx
│   │   │   └── ExportImport.tsx
│   │   ├── pages/         # Page components
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   └── DashboardPage.tsx
│   │   ├── contexts/      # React contexts
│   │   │   └── AuthContext.tsx
│   │   ├── hooks/         # Custom React hooks
│   │   └── utils/         # Utility functions
│   ├── public/            # Static assets
│   └── package.json       # Dependencies
├── server/                # FastAPI backend
│   ├── models/            # Database models
│   │   ├── base.py
│   │   ├── user.py
│   │   └── task.py
│   ├── routes/            # API routes
│   │   ├── auth.py
│   │   ├── tasks.py
│   │   └── users.py
│   ├── utils/             # Helper functions
│   │   ├── auth.py
│   │   ├── database.py
│   │   └── scheduler.py
│   ├── schemas/           # Pydantic schemas
│   └── main.py           # FastAPI app entry point
├── docker-compose.yml     # Development environment
├── Dockerfile            # Production deployment
└── .env.example          # Environment variables template
```

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** - Frontend runtime
- **Python 3.9+** - Backend runtime
- **PostgreSQL 15+** - Database
- **Redis 7+** - Caching (optional)
- **Docker & Docker Compose** - Containerization (optional)

### Development Setup

#### 1. Clone and Setup Environment
```bash
git clone <repository-url>
cd Sisyphus
cp .env.example .env
# Edit .env with your database credentials
```

#### 2. Backend Setup
```bash
cd server
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Start development server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### 3. Frontend Setup
```bash
cd client
npm install
npm run dev
```

#### 4. Database Setup
```bash
# Create PostgreSQL database
createdb sisyphus_db

# Or use Docker for PostgreSQL
docker run --name sisyphus_postgres \
  -e POSTGRES_DB=sisyphus_db \
  -e POSTGRES_USER=sisyphus_user \
  -e POSTGRES_PASSWORD=sisyphus_password \
  -p 5432:5432 \
  -d postgres:15-alpine
```

### Docker Setup (Alternative)
```bash
# Start all services
docker-compose up --build

# Access the application
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
# Database: localhost:5432
```

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/sisyphus_db

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Redis (Optional)
REDIS_URL=redis://localhost:6379
REDIS_ENABLED=True

# Server Configuration
HOST=0.0.0.0
PORT=8000
DEBUG=True
ENVIRONMENT=development

# CORS Origins
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

## 📝 API Documentation

### Interactive Documentation
Once the backend is running, visit:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### Key Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh access token

#### Tasks
- `GET /api/tasks/` - Get all tasks (with filtering)
- `POST /api/tasks/` - Create new task
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task
- `POST /api/tasks/{id}/toggle` - Toggle completion
- `POST /api/tasks/bulk/delete` - Bulk delete
- `POST /api/tasks/bulk/complete` - Bulk complete
- `PUT /api/tasks/bulk/priority` - Bulk priority update

#### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `PUT /api/users/reset-time` - Update reset time

### Authentication
All protected endpoints require a JWT Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## 🧪 Testing

### Backend Tests
```bash
cd server
pytest
pytest --cov=app --cov-report=html
```

### Frontend Tests
```bash
cd client
npm test
npm run test:coverage
```

### Integration Tests
```bash
# Run full test suite
docker-compose -f docker-compose.test.yml up --build
```

## 🚀 Deployment

### Production Setup

#### 1. Environment Configuration
```bash
# Set production environment variables
cp .env.example .env.production
# Edit .env.production with production values
```

#### 2. Docker Deployment
```bash
# Build and deploy with Docker Compose
docker-compose -f docker-compose.prod.yml up -d

# Or build individual services
docker build -t sisyphus-frontend ./client
docker build -t sisyphus-backend ./server
```

#### 3. Manual Deployment
```bash
# Backend
cd server
pip install -r requirements.txt
alembic upgrade head
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker

# Frontend
cd client
npm run build
# Serve with nginx or similar
```

### Environment Variables for Production
| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Yes | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Secret key for JWT tokens | Yes | `your-super-secret-key` |
| `REDIS_URL` | Redis connection string | No | `redis://host:6379` |
| `ENVIRONMENT` | Environment name | Yes | `production` |
| `ALLOWED_ORIGINS` | CORS allowed origins | Yes | `https://yourdomain.com` |

## 📊 Performance & Monitoring

### Performance Metrics
- **Frontend**: React 18 with Vite for fast development and builds
- **Backend**: FastAPI with async/await for high concurrency
- **Database**: PostgreSQL with proper indexing and query optimization
- **Caching**: Redis for session management and task scheduling

### Monitoring
- **Health Checks**: `/health` endpoint for service monitoring
- **Logging**: Structured logging with different levels
- **Error Tracking**: Comprehensive error handling and reporting

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow the existing code style and conventions
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

## 📈 Roadmap

### Planned Features
- [ ] **Dark/Light Theme**: User preference for UI themes
- [ ] **Mobile App**: React Native version
- [ ] **Team Collaboration**: Shared tasks and team management
- [ ] **Advanced Analytics**: Detailed productivity insights
- [ ] **API Rate Limiting**: Protect against abuse
- [ ] **WebSocket Support**: Real-time notifications
- [ ] **Offline Support**: PWA capabilities

### Performance Improvements
- [ ] **Database Optimization**: Query performance tuning
- [ ] **Caching Strategy**: Advanced Redis caching
- [ ] **CDN Integration**: Static asset optimization
- [ ] **Image Optimization**: WebP and lazy loading

## 🐛 Troubleshooting

### Common Issues

#### Database Connection
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Test connection
psql -h localhost -U username -d sisyphus_db
```

#### Redis Connection
```bash
# Check if Redis is running
redis-cli ping

# Should return: PONG
```

#### Port Conflicts
```bash
# Check what's using port 8000
lsof -i :8000

# Kill process if needed
kill -9 <PID>
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **FastAPI** team for the excellent web framework
- **React** team for the amazing UI library
- **TailwindCSS** for the utility-first CSS framework
- **PostgreSQL** for the robust database system

## 👨🏻‍💻 About Me

Hi, I'm **Fidel Fúnez**. I'm an independent full-stack developer and Bitcoin educator based in Tegucigalpa, Honduras 🇭🇳, and The Woodlands, Texas 🇺🇸, currently building my portfolio while helping others understand tech and financial freedom!

### Connect With Me
- **LinkedIn**: https://linkedin.com/in/fidel-funez
- **GitHub**: https://github.com/fidelfunez
- **Portfolio**: [Your Portfolio Website]
- **Bitcoin Education**: https://www.youtube.com/live/EV2_UlSQoAU?si=JoUqFyw8gSYBLClk&t=1292

### What I'm Working On
- Building robust, scalable web applications
- Teaching others about Bitcoin and financial sovereignty
- Contributing to open-source projects
- Exploring new technologies and best practices

---

**Built with 🧡 for productivity** | **Sisyphus II** | **© 2025** 
