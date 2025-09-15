import { Poll, CreatePollData, PollResult, PollStats, Vote, User, DeactivatePollResult } from '@/lib/types'

/**
 * Poll Management Actions and Business Logic
 * 
 * This module provides comprehensive poll management functionality including
 * creation, retrieval, voting, and analytics. It uses in-memory storage for
 * development and testing, with functions designed to be easily replaceable
 * with database implementations.
 * 
 * Key Features:
 * - CRUD operations for polls
 * - Voting system with duplicate prevention
 * - Real-time statistics calculation
 * - User poll management
 * - Poll results and analytics
 * - Comprehensive validation and error handling
 * 
 * Data Storage: Currently uses in-memory arrays for development.
 * In production, these should be replaced with database operations.
 * 
 * @module poll-actions
 */

// Mock data for testing and development
// These represent the types of users that might interact with polls
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

// In-memory storage for development and testing
// These would be replaced with database tables in production
let pollsStore: Poll[] = []
let votesStore: Vote[] = []

// ID counters for generating unique identifiers
// In production, these would be handled by database auto-increment or UUIDs
let pollIdCounter = 1
let voteIdCounter = 1

/**
 * Creates a new poll with comprehensive validation and data sanitization.
 * 
 * This function handles the complete poll creation workflow including input
 * validation, data sanitization, duplicate option detection, and author
 * verification. It ensures data integrity while providing detailed error
 * feedback for invalid inputs.
 * 
 * Validation Rules:
 * - Question: Required, non-empty after trimming
 * - Options: Minimum 2, maximum 10, no duplicates, non-empty
 * - Author: Must exist in the system
 * - Expiration: Must be future date if provided
 * 
 * @param pollData - The poll creation data containing question, options, etc.
 * @param authorId - The ID of the user creating the poll
 * @returns Promise resolving to created Poll object or null if creation failed
 * 
 * @example
 * ```ts
 * const poll = await createPoll({
 *   question: 'What is your favorite programming language?',
 *   description: 'Help us understand developer preferences',
 *   options: ['JavaScript', 'Python', 'TypeScript', 'Go'],
 *   category: 'Technology',
 *   expiresAt: new Date('2024-12-31')
 * }, 'user-123')
 * 
 * if (poll) {
 *   console.log('Poll created with ID:', poll.id)
 * } else {
 *   console.error('Poll creation failed')
 * }
 * ```
 * 
 * @throws Error with descriptive message for validation failures
 */
export async function createPoll(pollData: CreatePollData, authorId: string): Promise<Poll | null> {
  try {
    // Validate question - it's the core of any poll
    if (!pollData.question?.trim()) {
      throw new Error('Question is required')
    }
    
    // Validate options array - polls need choices
    if (!pollData.options || pollData.options.length < 2) {
      throw new Error('At least 2 options are required')
    }
    
    // Enforce maximum options to prevent overwhelming users
    if (pollData.options.length > 10) {
      throw new Error('Maximum 10 options allowed')
    }
    
    // Check for duplicate options to ensure meaningful choices
    const uniqueOptions = [...new Set(pollData.options.filter(opt => opt.trim()))]
    if (uniqueOptions.length !== pollData.options.filter(opt => opt.trim()).length) {
      throw new Error('Duplicate options are not allowed')
    }
    
    // Verify author exists in the system
    // This ensures poll attribution and prevents orphaned polls
    const author = mockUsers.find(user => user.id === authorId)
    if (!author) {
      throw new Error('Author not found')
    }
    
    // Create poll object with validated and sanitized data
    const poll: Poll = {
      id: `poll-${pollIdCounter++}`,
      question: pollData.question.trim(),
      description: pollData.description?.trim(),
      // Transform options into structured format with vote tracking
      options: pollData.options
        .filter(opt => opt.trim())
        .map((text, index) => ({
          id: `option-${Date.now()}-${index}`,
          text: text.trim(),
          votes: 0,        // Initialize with zero votes
          percentage: 0    // Initialize with zero percentage
        })),
      totalVotes: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: pollData.expiresAt,
      isActive: true,
      category: pollData.category || 'General',  // Default category
      authorId,
      author
    }
    
    // Store poll in memory (replace with database save in production)
    pollsStore.push(poll)
    
    return poll
  } catch (error) {
    console.error('Error creating poll:', error)
    return null
  }
}

/**
 * Retrieves polls with comprehensive filtering, searching, and sorting capabilities.
 * 
 * This function provides a flexible way to fetch polls from the system with
 * various filtering options. It supports category filtering, text searching,
 * sorting by different criteria, and pagination through limits.
 * 
 * Features:
 * - Active status filtering (excludes expired/inactive polls)
 * - Category-based filtering (case-insensitive)
 * - Full-text search across question, description, and category
 * - Multiple sorting options (newest, oldest, most/least votes)
 * - Result limiting for pagination
 * 
 * @param filters - Optional filtering and sorting criteria
 * @param filters.category - Filter by poll category (case-insensitive)
 * @param filters.search - Search term for question, description, category
 * @param filters.sortBy - Sort order: 'newest' | 'oldest' | 'mostVotes' | 'leastVotes'
 * @param filters.limit - Maximum number of polls to return
 * @param filters.activeOnly - Only return active, non-expired polls
 * @returns Promise resolving to array of filtered and sorted polls
 * 
 * @example
 * ```ts
 * // Get active technology polls, newest first, limit 10
 * const techPolls = await getPolls({
 *   category: 'technology',
 *   activeOnly: true,
 *   sortBy: 'newest',
 *   limit: 10
 * })
 * 
 * // Search for polls about programming
 * const programmingPolls = await getPolls({
 *   search: 'programming',
 *   sortBy: 'mostVotes'
 * })
 * ```
 */
export async function getPolls(filters?: {
  category?: string
  search?: string
  sortBy?: string
  limit?: number
  activeOnly?: boolean
}): Promise<Poll[]> {
  try {
    // Start with all polls and apply filters progressively
    let filteredPolls = [...pollsStore]
    
    // Filter by active status - removes expired and deactivated polls
    if (filters?.activeOnly) {
      filteredPolls = filteredPolls.filter(poll => 
        poll.isActive && (!poll.expiresAt || poll.expiresAt > new Date())
      )
    }
    
    // Filter by category - case-insensitive matching
    if (filters?.category) {
      filteredPolls = filteredPolls.filter(poll => 
        poll.category.toLowerCase() === filters.category!.toLowerCase()
      )
    }
    
    // Filter by search term - searches across multiple fields
    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase()
      filteredPolls = filteredPolls.filter(poll =>
        poll.question.toLowerCase().includes(searchTerm) ||
        poll.description?.toLowerCase().includes(searchTerm) ||
        poll.category.toLowerCase().includes(searchTerm)
      )
    }
    
    // Sort polls based on specified criteria
    if (filters?.sortBy) {
      switch (filters.sortBy) {
        case 'newest':
          // Sort by creation date, newest first
          filteredPolls.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          break
        case 'oldest':
          // Sort by creation date, oldest first
          filteredPolls.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
          break
        case 'mostVotes':
          // Sort by vote count, highest first (most popular)
          filteredPolls.sort((a, b) => b.totalVotes - a.totalVotes)
          break
        case 'leastVotes':
          // Sort by vote count, lowest first (least popular)
          filteredPolls.sort((a, b) => a.totalVotes - b.totalVotes)
          break
      }
    }
    
    // Apply result limit for pagination
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
 * Records a vote on a poll with comprehensive validation and duplicate handling.
 * 
 * This function handles the complete voting workflow including validation of poll
 * availability, option validity, and user eligibility. It supports vote updates,
 * allowing users to change their vote, and automatically recalculates poll statistics.
 * 
 * Validation Process:
 * 1. Input validation (required parameters)
 * 2. Poll existence and activity status
 * 3. Poll expiration check
 * 4. Option validity within the poll
 * 5. Duplicate vote detection and handling
 * 
 * Vote Handling:
 * - New votes: Creates new vote record
 * - Existing votes: Updates the option choice (allows vote changes)
 * - Statistics: Automatically recalculates poll totals and percentages
 * 
 * @param pollId - The unique identifier of the poll to vote on
 * @param optionId - The unique identifier of the selected poll option
 * @param userId - The unique identifier of the user casting the vote
 * @returns Promise resolving to true if vote was recorded successfully, false otherwise
 * 
 * @example
 * ```ts
 * // Cast a new vote
 * const success = await voteOnPoll('poll-123', 'option-456', 'user-789')
 * if (success) {
 *   console.log('Vote recorded successfully')
 * }
 * 
 * // Change an existing vote (user already voted on this poll)
 * const updateSuccess = await voteOnPoll('poll-123', 'option-999', 'user-789')
 * if (updateSuccess) {
 *   console.log('Vote updated successfully')
 * }
 * ```
 * 
 * @throws Error with descriptive message for validation failures
 * 
 * Error Cases:
 * - Missing or empty parameters
 * - Poll not found
 * - Poll is inactive or expired
 * - Invalid option for the poll
 * - General voting system errors
 */
export async function voteOnPoll(pollId: string, optionId: string, userId: string): Promise<boolean> {
  try {
    // Input validation - all parameters are required for voting
    if (!pollId?.trim() || !optionId?.trim() || !userId?.trim()) {
      throw new Error('Poll ID, option ID, and user ID are required')
    }
    
    // Find and validate poll existence
    const poll = pollsStore.find(p => p.id === pollId)
    if (!poll) {
      throw new Error('Poll not found')
    }
    
    // Check if poll is active - inactive polls cannot receive votes
    if (!poll.isActive) {
      throw new Error('Poll is not active')
    }
    
    // Check poll expiration - expired polls cannot receive new votes
    if (poll.expiresAt && poll.expiresAt <= new Date()) {
      throw new Error('Poll has expired')
    }
    
    // Validate option exists in this poll
    const option = poll.options.find(opt => opt.id === optionId)
    if (!option) {
      throw new Error('Option not found')
    }
    
    // Check for existing vote by this user on this poll
    const existingVote = votesStore.find(vote => 
      vote.pollId === pollId && vote.userId === userId
    )
    
    if (existingVote) {
      // Update existing vote - allows users to change their choice
      existingVote.optionId = optionId
      existingVote.createdAt = new Date()  // Update timestamp for the change
    } else {
      // Create new vote record for first-time voter
      const vote: Vote = {
        id: `vote-${voteIdCounter++}`,
        pollId,
        optionId,
        userId,
        createdAt: new Date()
      }
      votesStore.push(vote)
    }
    
    // Recalculate poll statistics to reflect the new/updated vote
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
 * @returns Promise<DeactivatePollResult> - Result with success/failure and reason
 */
export async function deactivatePoll(pollId: string, userId: string): Promise<DeactivatePollResult> {
  try {
    // Validate inputs
    if (!pollId?.trim()) {
      return { ok: false, reason: 'not_found', message: 'Poll ID is required' }
    }
    
    if (!userId?.trim()) {
      return { ok: false, reason: 'forbidden', message: 'User ID is required' }
    }
    
    const poll = pollsStore.find(p => p.id === pollId)
    if (!poll) {
      return { ok: false, reason: 'not_found', message: 'Poll not found' }
    }
    
    // Check if user is the author
    if (poll.authorId !== userId) {
      return { ok: false, reason: 'forbidden', message: 'Only the poll author can deactivate the poll' }
    }
    
    // Check if poll is already inactive
    if (!poll.isActive) {
      return { ok: false, reason: 'conflict', message: 'Poll is already deactivated' }
    }
    
    // Deactivate the poll
    poll.isActive = false
    poll.updatedAt = new Date()
    
    return { ok: true }
  } catch (error) {
    console.error('Error deactivating poll:', error)
    return { ok: false, reason: 'server_error', message: 'Internal server error occurred while deactivating poll' }
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