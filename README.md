# AI-Powered Todo Scheduler

A comprehensive task management application with AI-powered scheduling, team collaboration, and real-time updates.

## Features

### Phase 1: Authentication & Core Todo CRUD
- User registration and login with JWT authentication
- Profile setup wizard with timezone configuration
- Create, read, update, delete todos
- Priority and status management
- Real-time dashboard with today's tasks

### Phase 2: Calendar & Scheduling System
- Month and week calendar views
- Drag-and-drop task scheduling
- Completion feedback form
- Task completion probability tracking
- Overdue and upcoming task indicators
- Optimal scheduling recommendations

### Phase 3: AI Integration with Gemini
- AI-powered subtask generation using Google Gemini Pro
- Intelligent scheduling suggestions considering existing tasks
- Virtual AI assistant with conversation history
- Tool-based assistant that can:
  - Get todo statistics
  - Search todos by keyword
  - Provide priority breakdowns

### Phase 4: Team Management & Delegation
- Add team members by email
- Delegate tasks with custom messages
- Accept/reject delegated assignments
- Real-time notifications with WebSockets
- Assignment request workflow

### Phase 5: Polish & Advanced Features
- Dashboard analytics and completion trends
- Notification center with real-time updates
- Advanced search and filtering
- User settings for preferences
- Responsive design across all devices

## Technology Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **UI Components**: shadcn/ui with Radix UI
- **Styling**: Tailwind CSS v4
- **Real-time**: Socket.IO Client
- **Data Fetching**: SWR for client-side caching
- **Form Handling**: React Hook Form + Zod validation
- **Charts**: Recharts for analytics

### Backend
- **Runtime**: Node.js with Next.js API Routes
- **Database**: MongoDB
- **Authentication**: JWT with HTTP-only cookies
- **Password Hashing**: bcryptjs
- **Real-time**: Socket.IO
- **AI/LLM**: Google Generative AI (Gemini Pro)

### AI & Integration
- **AI SDK**: Vercel AI SDK v6
- **LLM Model**: Google Gemini 2.0 Flash
- **Chat Transport**: DefaultChatTransport for streaming

## Project Structure

```
/app
  /(auth)              # Authentication pages
    /login
    /signup
    /onboarding
  /(app)               # Protected routes
    /dashboard         # Main task view
    /calendar          # Calendar & scheduling
    /assistant         # AI assistant
    /team              # Team management
    /assignments       # Task assignments
    /settings          # User settings
  /api
    /auth              # Authentication endpoints
    /todos             # Todo CRUD operations
    /ai                # AI features (subtasks, scheduling, chat)
    /team              # Team management
    /assignments       # Delegation workflow
    /feedback          # Completion feedback
    /notifications     # Notification system

/components
  /ui                  # shadcn/ui components
  /[feature-components] # Feature-specific components

/lib
  /db.ts              # MongoDB connection
  /schemas.ts         # Zod validation schemas
  /auth.ts            # JWT utilities
  /types.ts           # TypeScript interfaces
  /api.ts             # API client utilities
  /socket-client.ts   # WebSocket client
  /socket-server.ts   # WebSocket server

/hooks
  /useAuth.ts         # Authentication hook
  /useTodos.ts        # Todo management hook
  /useSocket.ts       # WebSocket initialization
  /useNotifications.ts # Notifications hook
```

## Environment Variables

Required environment variables (set in Vercel):

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NEXT_PUBLIC_API_URL=http://localhost:3000  # For development
```

## Getting Started

### Prerequisites
- Node.js 18+ and pnpm
- MongoDB instance (local or Atlas)
- Vercel account (for deployment)

### Installation

1. Clone the repository and install dependencies:
```bash
pnpm install
```

2. Set environment variables in `.env.local`:
```bash
cp .env.example .env.local
# Edit .env.local with your values
```

3. Run the development server:
```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## API Routes

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Todos
- `GET /api/todos` - List all todos
- `POST /api/todos` - Create todo
- `GET /api/todos/[id]` - Get todo details
- `PUT /api/todos/[id]` - Update todo
- `DELETE /api/todos/[id]` - Delete todo
- `POST /api/todos/schedule` - Schedule todo
- `GET /api/todos/schedule` - Get scheduled todos

### AI Features
- `POST /api/ai/subtasks` - Generate subtasks
- `POST /api/ai/schedule` - Get scheduling suggestions
- `POST /api/ai/chat` - AI assistant chat

### Team & Delegation
- `GET /api/team` - Get team info
- `POST /api/team` - Add team member
- `GET /api/assignments` - Get assignments
- `POST /api/assignments` - Create assignment
- `PATCH /api/assignments/[id]` - Respond to assignment

### Other
- `GET /api/notifications` - Get notifications
- `PATCH /api/notifications` - Mark notification as read
- `POST /api/feedback` - Submit task feedback

## Authentication Flow

1. User signs up with email and password
2. Password hashed with bcryptjs
3. JWT token generated and stored in HTTP-only cookie
4. Token validated on protected routes via middleware
5. User profile setup wizard on first login

## Real-time Features

WebSocket integration for:
- Live task updates
- Real-time notifications
- Assignment request events
- Team member presence

## AI Features Explained

### Subtask Generation
- Uses Google Gemini Pro to analyze task
- Generates 3-5 actionable subtasks
- Provides estimated time for each step
- Logical ordering of tasks

### Smart Scheduling
- Considers existing tasks and conflicts
- Respects work hours configuration
- Matches priority level appropriately
- Provides 3 scheduling alternatives

### Virtual Assistant
- Chat interface with AI
- Tool calling for statistics
- Conversational task management
- Continuous learning from interactions

## Database Schema

### Users
- email, name, password hash
- timezone, work hours
- profile setup status

### Todos
- title, description, priority
- status, due date, scheduled date
- estimated minutes, subtasks
- completion probability

### Assignments
- todo ID, assigned by, assigned to
- status (pending/accepted/rejected)
- delegation message

### CompletionFeedback
- todo ID, time spent, difficulty
- completion status, notes

### Notifications
- user ID, type, title, message
- read status, created at

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push

```bash
git push origin main
```

## Performance Optimizations

- Server-side rendering for initial load
- SWR caching for API responses
- Real-time updates via WebSockets
- Lazy loading of components
- Image optimization
- CSS-in-JS minimization

## Security Features

- JWT authentication with HTTP-only cookies
- Password hashing with bcryptjs
- Input validation with Zod
- SQL injection prevention (using MongoDB)
- CORS configuration
- Route protection middleware

## Future Enhancements

- Email notifications for tasks
- Recurring tasks and templates
- Advanced analytics dashboard
- Mobile app (React Native)
- Dark mode refinements
- Offline mode with Service Workers
- Multi-language support
- Integration with calendar apps (Google Calendar, Outlook)

## Troubleshooting

### MongoDB Connection Issues
- Verify connection string is correct
- Check MongoDB Atlas IP whitelist
- Ensure credentials are valid

### JWT Errors
- Verify JWT_SECRET is set
- Check token expiration
- Clear cookies if needed

### AI API Errors
- Verify Google API credentials
- Check rate limiting
- Ensure proper JSON format for requests

## Support

For issues and support, please open an issue on GitHub or contact the development team.

## License

MIT License - see LICENSE file for details
