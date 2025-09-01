# ALX Polling App

A modern, feature-rich polling application built with Next.js 15, TypeScript, and Shadcn UI components.

## 🚀 Features

- **User Authentication**: Login and registration system
- **Poll Management**: Create, view, and manage polls
- **Voting System**: Interactive voting with real-time results
- **Dashboard**: Comprehensive overview of user's polls and analytics
- **Responsive Design**: Modern UI that works on all devices
- **TypeScript**: Full type safety throughout the application

## 🏗️ Project Structure

```
alx-polly/
├── app/                          # Next.js app directory
│   ├── (auth)/                  # Authentication route group
│   │   ├── login/               # Login page
│   │   └── register/            # Registration page
│   ├── (dashboard)/             # Dashboard route group
│   │   └── dashboard/           # User dashboard
│   ├── polls/                   # Polls routes
│   │   ├── page.tsx            # Polls listing page
│   │   ├── create/             # Create new poll
│   │   └── [id]/               # Individual poll view
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Home page
├── components/                  # Reusable components
│   ├── ui/                     # Shadcn UI components
│   ├── forms/                  # Form components
│   ├── polls/                  # Poll-related components
│   └── layout/                 # Layout components
├── lib/                        # Utility libraries
│   ├── auth/                   # Authentication utilities
│   ├── db/                     # Database utilities
│   ├── types/                  # TypeScript type definitions
│   └── utils.ts                # General utilities
├── public/                     # Static assets
└── package.json                # Dependencies and scripts
```

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Shadcn UI
- **Icons**: Lucide React
- **Authentication**: Placeholder (ready for implementation)
- **Database**: Placeholder (ready for implementation)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd alx-polly
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Component Overview

### Authentication Components
- `LoginForm`: User login form with validation
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
