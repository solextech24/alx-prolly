# Authentication System Setup Guide

This guide will help you set up the authentication system for your polling app.

## 🚀 Quick Start

### 1. Environment Variables

Create a `.env.local` file in your project root with the following variables:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/polling_app"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

**Generate a secret key:**
```bash
openssl rand -base64 32
```

### 2. Database Setup

#### Option A: PostgreSQL (Recommended)
1. Install PostgreSQL
2. Create a database:
```sql
CREATE DATABASE polling_app;
```

#### Option B: SQLite (Development)
Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

### 3. Initialize Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed with sample data
npm run db:seed
```

### 4. Test the System

1. Start the development server:
```bash
npm run dev
```

2. Visit `http://localhost:3000`
3. You'll be redirected to `/polls`
4. Click "Sign Up" to create an account
5. Or use the test account:
   - Email: `test@example.com`
   - Password: `password123`

## 🔧 Configuration Details

### NextAuth Configuration

The authentication system is configured in `lib/auth/auth-config.ts`:

- **Provider**: Credentials (email/password)
- **Adapter**: Prisma (for database integration)
- **Session Strategy**: JWT
- **Custom Pages**: Login and Register routes

### Protected Routes

The following routes require authentication:
- `/dashboard/*` - User dashboard
- `/polls/create/*` - Poll creation

### Middleware

Route protection is handled by `middleware.ts` using NextAuth's `withAuth` function.

## 🗄️ Database Schema

### Users
- Basic user information (name, email, password)
- Avatar support with DiceBear integration
- Timestamps for creation and updates

### Polls
- Question and description
- Category and status
- Expiration dates
- Author relationship

### Poll Options
- Text content
- Relationship to polls
- Vote tracking

### Votes
- User voting records
- Unique constraint per user per poll
- Timestamps

## 🔐 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Sessions**: Secure token-based authentication
- **Route Protection**: Middleware-based access control
- **Input Validation**: Server-side validation for all forms
- **CSRF Protection**: Built-in NextAuth protection

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check your `DATABASE_URL`
   - Ensure database is running
   - Verify credentials

2. **NextAuth Secret Error**
   - Generate a new secret key
   - Ensure it's at least 32 characters

3. **Prisma Client Error**
   - Run `npm run db:generate`
   - Restart your development server

4. **Authentication Not Working**
   - Check browser console for errors
   - Verify environment variables
   - Check database connection

### Debug Mode

Enable debug logging by adding to `.env.local`:
```bash
NEXTAUTH_DEBUG=true
```

## 📱 Features

### Authentication
- ✅ User registration
- ✅ User login
- ✅ Session management
- ✅ Route protection
- ✅ Logout functionality

### User Experience
- ✅ Form validation
- ✅ Error handling
- ✅ Loading states
- ✅ Responsive design
- ✅ Navigation based on auth status

### Security
- ✅ Password hashing
- ✅ JWT tokens
- ✅ Protected routes
- ✅ Input sanitization

## 🔄 Next Steps

After setting up authentication:

1. **Database Integration**: Replace mock data with real database queries
2. **Poll Management**: Implement CRUD operations for polls
3. **Voting System**: Add real-time voting functionality
4. **User Profiles**: Enhance user management features
5. **Analytics**: Add poll statistics and user insights

## 📚 Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Shadcn UI](https://ui.shadcn.com/)


