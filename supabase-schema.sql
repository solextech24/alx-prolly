-- ALX Polly - Supabase Database Schema
-- This schema matches the Prisma schema for polls and voting functionality

-- Enable UUID extension for generating unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password TEXT NOT NULL,
  avatar TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Polls table
CREATE TABLE polls (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  question TEXT NOT NULL,
  description TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  category TEXT NOT NULL,
  "expiresAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "authorId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- Poll options table
CREATE TABLE poll_options (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  text TEXT NOT NULL,
  "pollId" TEXT NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Votes table
CREATE TABLE votes (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "pollId" TEXT NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  "optionId" TEXT NOT NULL REFERENCES poll_options(id) ON DELETE CASCADE,
  "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Ensure user can only vote once per poll
  UNIQUE("pollId", "userId")
);

-- Create indexes for better performance
CREATE INDEX idx_polls_author ON polls("authorId");
CREATE INDEX idx_polls_active ON polls("isActive");
CREATE INDEX idx_polls_category ON polls(category);
CREATE INDEX idx_polls_expires ON polls("expiresAt");
CREATE INDEX idx_poll_options_poll ON poll_options("pollId");
CREATE INDEX idx_votes_poll ON votes("pollId");
CREATE INDEX idx_votes_option ON votes("optionId");
CREATE INDEX idx_votes_user ON votes("userId");

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers to update the updatedAt column automatically
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_polls_updated_at 
  BEFORE UPDATE ON polls 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_poll_options_updated_at 
  BEFORE UPDATE ON poll_options 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies for secure access
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid()::text = id);

-- Users can update their own data
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid()::text = id);

-- Everyone can read active polls
CREATE POLICY "Everyone can read active polls" ON polls
  FOR SELECT USING ("isActive" = true);

-- Users can create polls
CREATE POLICY "Users can create polls" ON polls
  FOR INSERT WITH CHECK (auth.uid()::text = "authorId");

-- Poll authors can update their own polls
CREATE POLICY "Authors can update own polls" ON polls
  FOR UPDATE USING (auth.uid()::text = "authorId");

-- Poll authors can delete their own polls
CREATE POLICY "Authors can delete own polls" ON polls
  FOR DELETE USING (auth.uid()::text = "authorId");

-- Everyone can read poll options for active polls
CREATE POLICY "Everyone can read poll options" ON poll_options
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM polls 
      WHERE polls.id = poll_options."pollId" 
      AND polls."isActive" = true
    )
  );

-- Poll authors can manage their poll options
CREATE POLICY "Authors can manage poll options" ON poll_options
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM polls 
      WHERE polls.id = poll_options."pollId" 
      AND polls."authorId" = auth.uid()::text
    )
  );

-- Users can read votes for active polls
CREATE POLICY "Users can read votes for active polls" ON votes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM polls 
      WHERE polls.id = votes."pollId" 
      AND polls."isActive" = true
    )
  );

-- Users can create votes for active polls
CREATE POLICY "Users can vote on active polls" ON votes
  FOR INSERT WITH CHECK (
    auth.uid()::text = "userId" AND
    EXISTS (
      SELECT 1 FROM polls 
      WHERE polls.id = votes."pollId" 
      AND polls."isActive" = true
      AND (polls."expiresAt" IS NULL OR polls."expiresAt" > NOW())
    )
  );

-- Users can update their own votes
CREATE POLICY "Users can update own votes" ON votes
  FOR UPDATE USING (auth.uid()::text = "userId");

-- Users can delete their own votes
CREATE POLICY "Users can delete own votes" ON votes
  FOR DELETE USING (auth.uid()::text = "userId");

-- Insert some sample data for testing
INSERT INTO users (id, email, name, password) VALUES
  ('user-1', 'alice@example.com', 'Alice Johnson', '$2a$12$placeholder'),
  ('user-2', 'bob@example.com', 'Bob Smith', '$2a$12$placeholder'),
  ('user-3', 'carol@example.com', 'Carol Davis', '$2a$12$placeholder');

INSERT INTO polls (id, question, description, category, "authorId", "expiresAt") VALUES
  ('poll-1', 'What is your favorite programming language?', 'Choose your preferred programming language for web development', 'Technology', 'user-1', NOW() + INTERVAL '7 days'),
  ('poll-2', 'Best time for team meetings?', 'Help us decide the optimal time for our weekly team meetings', 'Work', 'user-2', NOW() + INTERVAL '3 days'),
  ('poll-3', 'Preferred project management tool?', 'Vote for the tool you think would work best for our team', 'Productivity', 'user-1', NOW() + INTERVAL '5 days');

INSERT INTO poll_options (id, text, "pollId") VALUES
  ('option-1', 'JavaScript', 'poll-1'),
  ('option-2', 'Python', 'poll-1'),
  ('option-3', 'TypeScript', 'poll-1'),
  ('option-4', 'Go', 'poll-1'),
  ('option-5', '9:00 AM', 'poll-2'),
  ('option-6', '2:00 PM', 'poll-2'),
  ('option-7', '4:00 PM', 'poll-2'),
  ('option-8', 'Trello', 'poll-3'),
  ('option-9', 'Asana', 'poll-3'),
  ('option-10', 'Notion', 'poll-3'),
  ('option-11', 'Linear', 'poll-3');

INSERT INTO votes (id, "pollId", "optionId", "userId") VALUES
  ('vote-1', 'poll-1', 'option-3', 'user-1'),
  ('vote-2', 'poll-1', 'option-2', 'user-2'),
  ('vote-3', 'poll-2', 'option-6', 'user-1'),
  ('vote-4', 'poll-2', 'option-6', 'user-3'),
  ('vote-5', 'poll-3', 'option-10', 'user-2');
