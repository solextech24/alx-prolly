# Test Poll Creation
# This file demonstrates how to test poll creation functionality

## Required Environment Variables

Before testing, make sure your `.env.local` file contains:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Database URL for Prisma
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
```

## Testing Steps

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Navigate to the create poll page:**
   Open http://localhost:3000/polls/create

3. **Fill out the form:**
   - Question: "What's your favorite frontend framework?"
   - Description: "Help us choose our next project stack"
   - Category: "Technology"
   - Options: "React", "Vue.js", "Angular", "Svelte"

4. **Submit the poll:**
   Click "Create Poll" button

## Expected Behavior

✅ **Success Case:**
- Poll creates successfully
- Redirects to the new poll page
- Poll appears in the polls list
- Data is stored in Supabase database

❌ **Error Cases:**
- Missing environment variables → "Failed to create poll"
- Database connection issues → Check Supabase connection
- Validation errors → Form shows specific error messages

## API Endpoints Updated

- `GET /api/polls` - Fetches all active polls from Supabase
- `POST /api/polls` - Creates new poll with options in Supabase
- `GET /api/polls/[id]` - Fetches individual poll with vote counts
- `POST /api/polls/[id]` - Handles voting on polls

## Database Integration

All API routes now:
- ✅ Connect to real Supabase database
- ✅ Handle proper error responses
- ✅ Include data validation
- ✅ Support voting and poll creation
- ✅ Calculate vote percentages dynamically
