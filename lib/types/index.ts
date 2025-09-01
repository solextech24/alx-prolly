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

export interface AuthCredentials {
  email: string
  password: string
}

export interface RegisterData extends AuthCredentials {
  name: string
  confirmPassword: string
}
