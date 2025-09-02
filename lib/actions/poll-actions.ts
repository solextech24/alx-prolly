import { Poll, CreatePollData, PollResult, PollStats, Vote, User } from '@/lib/types'

// Mock data for testing
const mockUsers: User[] = [
  {
    id: 'user-1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'user-2',
    name: 'Bob Smith',
    email: 'bob@example.com',
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02')
  }
]

// In-memory storage for testing
let pollsStore: Poll[] = []
let votesStore: Vote[] = []
let pollIdCounter = 1
let voteIdCounter = 1

/**
 * Creates a new poll with the provided data
 * @param pollData - The poll data to create
 * @param authorId - The ID of the user creating the poll
 * @returns Promise<Poll | null> - The created poll or null if creation failed
 */
export async function createPoll(pollData: CreatePollData, authorId: string): Promise<Poll | null> {
  try {
    // Validation
    if (!pollData.question?.trim()) {
      throw new Error('Question is required')
    }
    
    if (!pollData.options || pollData.options.length < 2) {
      throw new Error('At least 2 options are required')
    }
    
    if (pollData.options.length > 10) {
      throw new Error('Maximum 10 options allowed')
    }
    
    // Check for duplicate options
    const uniqueOptions = [...new Set(pollData.options.filter(opt => opt.trim()))]
    if (uniqueOptions.length !== pollData.options.filter(opt => opt.trim()).length) {
      throw new Error('Duplicate options are not allowed')
    }
    
    // Find author
    const author = mockUsers.find(user => user.id === authorId)
    if (!author) {
      throw new Error('Author not found')
    }
    
    // Create poll
    const poll: Poll = {
      id: `poll-${pollIdCounter++}`,
      question: pollData.question.trim(),
      description: pollData.description?.trim(),
      options: pollData.options
        .filter(opt => opt.trim())
        .map((text, index) => ({
          id: `option-${Date.now()}-${index}`,
          text: text.trim(),
          votes: 0,
          percentage: 0
        })),
      totalVotes: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: pollData.expiresAt,
      isActive: true,
      category: pollData.category || 'General',
      authorId,
      author
    }
    
    // Store poll
    pollsStore.push(poll)
    
    return poll
  } catch (error) {
    console.error('Error creating poll:', error)
    return null
  }
}

/**
 * Fetches all polls with optional filtering
 * @param filters - Optional filters for polls
 * @returns Promise<Poll[]> - Array of polls
 */
export async function getPolls(filters?: {
  category?: string
  search?: string
  sortBy?: string
  limit?: number
  activeOnly?: boolean
}): Promise<Poll[]> {
  try {
    let filteredPolls = [...pollsStore]
    
    // Filter by active status
    if (filters?.activeOnly) {
      filteredPolls = filteredPolls.filter(poll => 
        poll.isActive && (!poll.expiresAt || poll.expiresAt > new Date())
      )
    }
    
    // Filter by category
    if (filters?.category) {
      filteredPolls = filteredPolls.filter(poll => 
        poll.category.toLowerCase() === filters.category!.toLowerCase()
      )
    }
    
    // Filter by search term
    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase()
      filteredPolls = filteredPolls.filter(poll =>
        poll.question.toLowerCase().includes(searchTerm) ||
        poll.description?.toLowerCase().includes(searchTerm) ||
        poll.category.toLowerCase().includes(searchTerm)
      )
    }
    
    // Sort polls
    if (filters?.sortBy) {
      switch (filters.sortBy) {
        case 'newest':
          filteredPolls.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          break
        case 'oldest':
          filteredPolls.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
          break
        case 'mostVotes':
          filteredPolls.sort((a, b) => b.totalVotes - a.totalVotes)
          break
        case 'leastVotes':
          filteredPolls.sort((a, b) => a.totalVotes - b.totalVotes)
          break
      }
    }
    
    // Limit results
    if (filters?.limit && filters.limit > 0) {
      filteredPolls = filteredPolls.slice(0, filters.limit)
    }
    
    return filteredPolls
  } catch (error) {
    console.error('Error fetching polls:', error)
    return []
  }
}

/**
 * Fetches a single poll by ID
 * @param id - The poll ID
 * @returns Promise<Poll | null> - The poll or null if not found
 */
export async function getPollById(id: string): Promise<Poll | null> {
  try {
    if (!id?.trim()) {
      throw new Error('Poll ID is required')
    }
    
    const poll = pollsStore.find(p => p.id === id)
    return poll || null
  } catch (error) {
    console.error('Error fetching poll by ID:', error)
    return null
  }
}

/**
 * Fetches all polls created by a specific user
 * @param userId - The user ID
 * @returns Promise<Poll[]> - Array of user's polls
 */
export async function getUserPolls(userId: string): Promise<Poll[]> {
  try {
    if (!userId?.trim()) {
      throw new Error('User ID is required')
    }
    
    return pollsStore.filter(poll => poll.authorId === userId)
  } catch (error) {
    console.error('Error fetching user polls:', error)
    return []
  }
}

/**
 * Records a vote on a poll
 * @param pollId - The poll ID
 * @param optionId - The option ID being voted for
 * @param userId - The user ID casting the vote
 * @returns Promise<boolean> - True if vote was recorded successfully
 */
export async function voteOnPoll(pollId: string, optionId: string, userId: string): Promise<boolean> {
  try {
    // Validation
    if (!pollId?.trim() || !optionId?.trim() || !userId?.trim()) {
      throw new Error('Poll ID, option ID, and user ID are required')
    }
    
    // Find poll
    const poll = pollsStore.find(p => p.id === pollId)
    if (!poll) {
      throw new Error('Poll not found')
    }
    
    // Check if poll is active
    if (!poll.isActive) {
      throw new Error('Poll is not active')
    }
    
    // Check if poll is expired
    if (poll.expiresAt && poll.expiresAt <= new Date()) {
      throw new Error('Poll has expired')
    }
    
    // Find option
    const option = poll.options.find(opt => opt.id === optionId)
    if (!option) {
      throw new Error('Option not found')
    }
    
    // Check if user already voted
    const existingVote = votesStore.find(vote => 
      vote.pollId === pollId && vote.userId === userId
    )
    
    if (existingVote) {
      // Update existing vote
      existingVote.optionId = optionId
      existingVote.createdAt = new Date()
    } else {
      // Create new vote
      const vote: Vote = {
        id: `vote-${voteIdCounter++}`,
        pollId,
        optionId,
        userId,
        createdAt: new Date()
      }
      votesStore.push(vote)
    }
    
    // Update poll statistics
    updatePollStats(pollId)
    
    return true
  } catch (error) {
    console.error('Error voting on poll:', error)
    return false
  }
}

/**
 * Updates poll statistics based on current votes
 * @param pollId - The poll ID to update
 */
function updatePollStats(pollId: string): void {
  const poll = pollsStore.find(p => p.id === pollId)
  if (!poll) return
  
  // Get all votes for this poll
  const pollVotes = votesStore.filter(vote => vote.pollId === pollId)
  
  // Reset option votes
  poll.options.forEach(option => {
    option.votes = 0
  })
  
  // Count votes for each option
  pollVotes.forEach(vote => {
    const option = poll.options.find(opt => opt.id === vote.optionId)
    if (option) {
      option.votes++
    }
  })
  
  // Calculate total votes
  poll.totalVotes = pollVotes.length
  
  // Calculate percentages
  poll.options.forEach(option => {
    option.percentage = poll.totalVotes > 0 
      ? Math.round((option.votes / poll.totalVotes) * 100)
      : 0
  })
  
  // Update poll timestamp
  poll.updatedAt = new Date()
}

/**
 * Gets detailed results for a poll
 * @param pollId - The poll ID
 * @returns Promise<PollResult | null> - Poll results or null if not found
 */
export async function getPollResults(pollId: string): Promise<PollResult | null> {
  try {
    if (!pollId?.trim()) {
      throw new Error('Poll ID is required')
    }
    
    const poll = pollsStore.find(p => p.id === pollId)
    if (!poll) {
      return null
    }
    
    const pollVotes = votesStore.filter(vote => vote.pollId === pollId)
    
    // Find top option
    const topOption = poll.options.reduce((max, option) => 
      option.votes > max.votes ? option : max, poll.options[0]
    )
    
    // Get recent votes (last 5)
    const recentVotes = pollVotes
      .slice(-5)
      .reverse()
      .map(vote => {
        const option = poll.options.find(opt => opt.id === vote.optionId)
        const user = mockUsers.find(u => u.id === vote.userId)
        return {
          user: user?.name || 'Anonymous',
          option: option?.text || 'Unknown',
          time: getTimeAgo(vote.createdAt)
        }
      })
    
    return {
      pollId,
      totalVotes: poll.totalVotes,
      participationRate: 75, // Mock participation rate
      averageTimeToVote: '2.5 minutes',
      topOption: topOption.text,
      topOptionVotes: topOption.votes,
      topOptionPercentage: topOption.percentage,
      recentVotes
    }
  } catch (error) {
    console.error('Error getting poll results:', error)
    return null
  }
}

/**
 * Gets overall poll statistics
 * @param userId - Optional user ID for user-specific stats
 * @returns Promise<PollStats> - Statistics object
 */
export async function getPollStats(userId?: string): Promise<PollStats> {
  try {
    let targetPolls = pollsStore
    let targetVotes = votesStore
    
    if (userId) {
      targetPolls = pollsStore.filter(poll => poll.authorId === userId)
      targetVotes = votesStore.filter(vote => 
        targetPolls.some(poll => poll.id === vote.pollId)
      )
    }
    
    const activePolls = targetPolls.filter(poll => 
      poll.isActive && (!poll.expiresAt || poll.expiresAt > new Date())
    ).length
    
    const totalVotes = targetVotes.length
    const averageEngagement = targetPolls.length > 0 
      ? Math.round(totalVotes / targetPolls.length * 100) / 100
      : 0
    
    return {
      totalPolls: targetPolls.length,
      activePolls,
      totalVotes,
      averageEngagement
    }
  } catch (error) {
    console.error('Error getting poll stats:', error)
    return {
      totalPolls: 0,
      activePolls: 0,
      totalVotes: 0,
      averageEngagement: 0
    }
  }
}

/**
 * Deactivates a poll
 * @param pollId - The poll ID to deactivate
 * @param userId - The user ID requesting deactivation
 * @returns Promise<boolean> - True if deactivated successfully
 */
export async function deactivatePoll(pollId: string, userId: string): Promise<boolean> {
  try {
    const poll = pollsStore.find(p => p.id === pollId)
    if (!poll) {
      throw new Error('Poll not found')
    }
    
    // Check if user is the author
    if (poll.authorId !== userId) {
      throw new Error('Only the poll author can deactivate the poll')
    }
    
    poll.isActive = false
    poll.updatedAt = new Date()
    
    return true
  } catch (error) {
    console.error('Error deactivating poll:', error)
    return false
  }
}

/**
 * Utility function to get time ago string
 * @param date - The date to compare
 * @returns string - Time ago representation
 */
function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffMinutes < 1) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
}

/**
 * Clears all data (for testing purposes)
 */
export function clearAllData(): void {
  pollsStore = []
  votesStore = []
  pollIdCounter = 1
  voteIdCounter = 1
}

/**
 * Seeds initial data for testing
 */
export function seedTestData(): void {
  clearAllData()
  
  // Create sample polls
  const pollData1: CreatePollData = {
    question: 'What is your favorite programming language?',
    description: 'Choose your preferred programming language for web development',
    options: ['JavaScript', 'Python', 'TypeScript', 'Go', 'Rust'],
    category: 'Technology'
  }
  
  const pollData2: CreatePollData = {
    question: 'Best time for team meetings?',
    description: 'Help us decide the optimal time for our weekly team meetings',
    options: ['9:00 AM', '2:00 PM', '4:00 PM'],
    category: 'Work',
    expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days from now
  }
  
  // Create polls
  createPoll(pollData1, 'user-1')
  createPoll(pollData2, 'user-2')
}
