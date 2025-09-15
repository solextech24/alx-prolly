# ALX Polling App

A modern, feature-rich polling application built with Next.js 15, TypeScript, and Shadcn UI components. This application provides a complete polling platform with user authentication, poll creation, voting systems, and comprehensive analytics.

## 🚀 Features

- **🔐 User Authentication**: Secure login and registration with NextAuth.js integration
- **📊 Poll Management**: Create, edit, and manage polls with comprehensive validation
- **🗳️ Interactive Voting**: Real-time voting system with progress visualization
- **📈 Dashboard**: User-specific dashboard with analytics and quick actions
- **🎨 Modern UI**: Clean, responsive design with Shadcn UI components
- **🔒 Type Safety**: Full TypeScript implementation for robust development
- **🚀 Performance**: Optimized with Next.js 15 and modern React patterns

## 🏗️ Project Architecture

```
alx-polly/
├── app/                          # Next.js App Router structure
│   ├── (auth)/                  # Authentication routes group
│   │   ├── login/               # User login page
│   │   └── register/            # User registration page
│   ├── (dashboard)/             # Protected dashboard routes
│   │   └── dashboard/           # Main user dashboard
│   ├── api/                     # API routes
│   │   ├── auth/               # Authentication endpoints
│   │   └── polls/              # Poll management APIs
│   ├── polls/                   # Public poll routes
│   │   ├── page.tsx            # Polls listing page
│   │   ├── create/             # Poll creation interface
│   │   ├── [id]/               # Individual poll view/voting
│   │   └── voting-demo/        # Interactive voting demonstration
│   ├── globals.css             # Global styles and CSS variables
│   ├── layout.tsx              # Root application layout
│   └── page.tsx                # Landing/home page
├── components/                  # Reusable UI components
│   ├── ui/                     # Shadcn UI components (Button, Card, etc.)
│   ├── forms/                  # Form components (Login, Register, Poll Creation)
│   ├── polls/                  # Poll-specific components (PollView, Results)
│   ├── auth/                   # Authentication components (ProtectedRoute)
│   └── layout/                 # Layout components (Header, Navigation)
├── lib/                        # Utility libraries and business logic
│   ├── auth/                   # Authentication configuration and utilities
│   ├── actions/                # Server actions and business logic
│   ├── db/                     # Database utilities and configurations
│   ├── types/                  # TypeScript type definitions
│   └── utils/                  # General utility functions
├── __tests__/                  # Test suites
├── public/                     # Static assets and resources
└── prisma/                     # Database schema and migrations
```

## 🛠️ Technology Stack

### Core Framework
- **Framework**: Next.js 15 (App Router with React Server Components)
- **Language**: TypeScript 5.x with strict mode
- **Runtime**: Node.js 18+

### Frontend
- **Styling**: Tailwind CSS v4 with custom design system
- **UI Components**: Shadcn UI (Radix UI primitives)
- **Icons**: Lucide React for consistent iconography
- **State Management**: React hooks and server state

### Backend & Database
- **Authentication**: NextAuth.js with Google OAuth
- **Database**: PostgreSQL with Prisma ORM
- **API**: Next.js API routes with comprehensive validation
- **Validation**: Zod for runtime type checking

### Development Tools
- **Testing**: Jest with React Testing Library
- **Linting**: ESLint with TypeScript rules
- **Code Formatting**: Prettier
- **Package Manager**: npm/yarn

## 🚀 Quick Start Guide

### Prerequisites

Ensure you have the following installed:
- **Node.js**: Version 18.0.0 or higher
- **Package Manager**: npm (comes with Node.js) or yarn
- **Database**: PostgreSQL 13+ (optional for demo mode)
- **Git**: For version control

### Installation & Setup

1. **Clone the Repository**
```bash
git clone https://github.com/your-username/alx-polly.git
cd alx-polly
```

2. **Install Dependencies**
```bash
# Using npm
npm install

# Or using yarn
yarn install
```

3. **Environment Configuration**
```bash
# Copy the environment template
cp env.example .env.local

# Edit .env.local with your configuration
```

**Required Environment Variables:**
```env
# Authentication (Required)
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Google OAuth (Optional for demo)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Database (Optional for demo mode)
DATABASE_URL=postgresql://username:password@localhost:5432/alx_polly
```

4. **Database Setup (Optional)**
```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed with sample data
npx prisma db seed
```

5. **Start Development Server**
```bash
npm run dev
# or
yarn dev
```

6. **Access the Application**
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 🎮 Demo Mode

The application includes a comprehensive demo mode that works without database setup:

**Demo Authentication:**
- Navigate to `/login`
- Use any email/password combination (e.g., `demo@example.com` / `password123`)
- Click "Login" to access the demo user dashboard

**Available Demo Features:**
- ✅ Browse and view polls
- ✅ Cast votes with real-time results
- ✅ Create new polls with validation
- ✅ Access personalized dashboard
- ✅ View poll analytics and statistics

## 📖 Usage Examples

### Creating a Poll

1. **Navigate to Poll Creation**
```typescript
// Access via dashboard or direct URL
window.location.href = '/polls/create'
```

2. **Fill Poll Form**
```typescript
interface PollData {
  question: string;           // "What's your favorite programming language?"
  description?: string;       // "Help us understand developer preferences"
  options: string[];          // ["JavaScript", "Python", "TypeScript"]
  category?: string;          // "Technology"
  expiresAt?: Date;          // Optional expiration date
}
```

3. **Submit and Share**
After creation, you'll receive a unique poll URL to share.

### Voting on a Poll

1. **Visit Poll Page**
```bash
# Example poll URL
http://localhost:3000/polls/poll-123
```

2. **Cast Your Vote**
- Select your preferred option using radio buttons
- Click "Submit Vote" to record your choice
- View real-time results with progress bars

### Accessing Dashboard

```bash
# Dashboard URL (requires authentication)
http://localhost:3000/dashboard
```

**Dashboard Features:**
- Poll overview with statistics
- Quick action buttons for common tasks
- User profile management
- Recent voting activity

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Structure

```
__tests__/
├── api-polls.test.ts           # API endpoint testing
├── poll-actions.test.ts        # Business logic testing
├── create-poll-form.test.tsx   # Component testing
└── setup.ts                    # Test configuration
```

### Testing Features

- **Unit Tests**: Component and function testing
- **Integration Tests**: API endpoint validation
- **Form Validation**: Input validation and error handling
- **User Interactions**: Voting and poll creation flows

## 🏛️ Architecture Overview

### Authentication Flow
```
User Login → NextAuth Session → Protected Routes → Dashboard Access
```

### Poll Creation Flow
```
Form Input → Validation → API Call → Database Save → Redirect to Poll
```

### Voting Flow
```
Option Selection → Form Validation → API Request → Vote Recording → Results Update
```

### Data Flow
```
Client Components ↔ API Routes ↔ Business Logic ↔ Database/Memory Store
```
- `RegisterForm`: User registration form
- `auth-utils.ts`: Authentication utility functions

### Poll Components
- `PollsList`: Grid display of available polls
- `PollsFilter`: Search and filter functionality
- `PollView`: Individual poll display with voting
- `PollResults`: Detailed poll results and analytics
- `CreatePollForm`: Form for creating new polls

### Layout Components
- `DashboardHeader`: Dashboard header with user menu
- `QuickActions`: Quick action cards for common tasks
- `PollsOverview`: Dashboard overview with statistics

### UI Components
All Shadcn UI components are available in `components/ui/`:
- Button, Card, Input, Label, Textarea
- Select, Dialog, Badge, Avatar
- Dropdown Menu, Form components

## 🔧 Configuration

### Shadcn UI
The project is configured with Shadcn UI components. To add new components:

```bash
npx shadcn@latest add <component-name>
```

### Tailwind CSS
Tailwind CSS v4 is configured with the project. Custom styles can be added to `app/globals.css`.

## 🚧 Implementation Status

### ✅ Completed
- Project structure and routing
- Component scaffolding with Shadcn UI
- TypeScript type definitions
- Mock data and placeholder functions
- Responsive design and modern UI

### 🚧 In Progress
- Authentication system implementation
- Database integration
- Real-time voting functionality
- User management features

### 📋 Next Steps
1. Implement authentication system (NextAuth.js, Clerk, or custom)
2. Set up database (PostgreSQL, MongoDB, or Supabase)
3. Add real-time features with WebSockets
4. Implement user roles and permissions
5. Add analytics and reporting features
6. Set up testing framework
7. Deploy to production

## 🎨 Customization

### Adding New Poll Types
1. Extend the `Poll` interface in `lib/types/index.ts`
2. Create new components in `components/polls/`
3. Update the database utilities in `lib/db/db-utils.ts`

### Styling
- Modify `app/globals.css` for global styles
- Use Tailwind CSS classes for component-specific styling
- Customize Shadcn UI theme in `components.json`

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🤝 Support

For questions or support, please open an issue in the repository.
