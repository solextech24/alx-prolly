# Supabase Database Setup Guide

## 1. Access Supabase SQL Editor

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **SQL Editor** in the left sidebar

## 2. Run the Schema

1. Copy the entire contents of `supabase-schema.sql`
2. Paste it into a new SQL query in the Supabase SQL Editor
3. Click **Run** to execute the schema

## 3. Verify the Setup

After running the schema, you should see these tables created:
- `users` - User accounts
- `polls` - Poll questions and metadata
- `poll_options` - Available choices for each poll
- `votes` - User votes on poll options

## 4. Update Environment Variables

Make sure your `.env.local` file contains:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Database URL for Prisma
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
```

## 5. Test the Database

The schema includes sample data:
- 3 test users
- 3 sample polls with different categories
- Poll options for each poll
- Some sample votes

## Features Included

### Security
- **Row Level Security (RLS)** enabled on all tables
- **Policies** that ensure users can only:
  - Read their own user data
  - Create/update/delete their own polls
  - Vote on active polls
  - Update/delete their own votes

### Performance
- **Indexes** on frequently queried columns
- **Automatic timestamp updates** via triggers

### Data Integrity
- **Foreign key constraints** maintain referential integrity
- **Unique constraint** prevents multiple votes per user per poll
- **Cascade deletes** clean up related data

## Next Steps

1. Run the schema in Supabase
2. Update your API routes to use the real database
3. Test the authentication flow
4. Replace mock data with real Supabase queries

## Troubleshooting

If you encounter issues:
1. Check that all required extensions are enabled
2. Verify your database connection string
3. Ensure RLS policies match your authentication setup
4. Check the Supabase logs for detailed error messages
