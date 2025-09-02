export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

export interface Poll {
  id: string
  question: string
  description?: string
  options: PollOption[]
  totalVotes: number
  createdAt: Date
  updatedAt: Date
  expiresAt?: Date
  isActive: boolean
  category: string
  authorId: string
  author: User
}

export interface PollOption {
  id: string
  text: string
  votes: number
  percentage: number
}

export interface Vote {
  id: string
  pollId: string
  optionId: string
  userId: string
  createdAt: Date
}

export interface PollResult {
  pollId: string
  totalVotes: number
  participationRate: number
  averageTimeToVote: string
  topOption: string
  topOptionVotes: number
  topOptionPercentage: number
  recentVotes: RecentVote[]
}

export interface RecentVote {
  user: string
  option: string
  time: string
}

export interface PollStats {
  totalPolls: number
  activePolls: number
  totalVotes: number
  averageEngagement: number
}

export interface CreatePollData {
  question: string
  description?: string
  options: string[]
  category: string
  expiresAt?: Date
}

// Branch-only types matching the mock API shape in app/api/polls/route.ts
// Use these when consuming data returned by the branch mock endpoints.
export interface BranchAuthor {
  id: string
  name: string
  email: string
}

export interface BranchPollOption {
  id: string
  text: string
  votes: number
}

export interface BranchPoll {
  id: string
  question: string
  description?: string
  options: BranchPollOption[]
  totalVotes: number
  createdAt: string // mock API returns date as string
  isActive: boolean
  category: string
  author: BranchAuthor
}

export interface AuthCredentials {
  email: string
  password: string
}

export interface RegisterData extends AuthCredentials {
  name: string
  confirmPassword: string
}
