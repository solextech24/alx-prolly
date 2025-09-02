import {
  createPoll,
  getPolls,
  getPollById,
  getUserPolls,
  voteOnPoll,
  getPollResults,
  getPollStats,
  deactivatePoll,
  clearAllData,
  seedTestData
} from '@/lib/actions/poll-actions'
import { CreatePollData } from '@/lib/types'

describe('Poll Actions', () => {
  beforeEach(() => {
    clearAllData()
  })

  describe('createPoll', () => {
    const validPollData: CreatePollData = {
      question: 'What is your favorite color?',
      description: 'Choose your preferred color',
      options: ['Red', 'Blue', 'Green'],
      category: 'Preferences'
    }

    it('should create a poll with valid data', async () => {
      const poll = await createPoll(validPollData, 'user-1')
      
      expect(poll).not.toBeNull()
      expect(poll!.question).toBe(validPollData.question)
      expect(poll!.description).toBe(validPollData.description)
      expect(poll!.category).toBe(validPollData.category)
      expect(poll!.options).toHaveLength(3)
      expect(poll!.totalVotes).toBe(0)
      expect(poll!.isActive).toBe(true)
      expect(poll!.authorId).toBe('user-1')
    })

    it('should fail when question is empty', async () => {
      const invalidData = { ...validPollData, question: '' }
      const poll = await createPoll(invalidData, 'user-1')
      
      expect(poll).toBeNull()
    })

    it('should fail when question is only whitespace', async () => {
      const invalidData = { ...validPollData, question: '   ' }
      const poll = await createPoll(invalidData, 'user-1')
      
      expect(poll).toBeNull()
    })

    it('should fail when less than 2 options provided', async () => {
      const invalidData = { ...validPollData, options: ['Only one'] }
      const poll = await createPoll(invalidData, 'user-1')
      
      expect(poll).toBeNull()
    })

    it('should fail when more than 10 options provided', async () => {
      const invalidData = {
        ...validPollData,
        options: Array(11).fill(0).map((_, i) => `Option ${i + 1}`)
      }
      const poll = await createPoll(invalidData, 'user-1')
      
      expect(poll).toBeNull()
    })

    it('should fail when duplicate options provided', async () => {
      const invalidData = { ...validPollData, options: ['Red', 'Blue', 'Red'] }
      const poll = await createPoll(invalidData, 'user-1')
      
      expect(poll).toBeNull()
    })

    it('should fail when author does not exist', async () => {
      const poll = await createPoll(validPollData, 'nonexistent-user')
      
      expect(poll).toBeNull()
    })

    it('should trim whitespace from question and description', async () => {
      const dataWithWhitespace = {
        ...validPollData,
        question: '  What is your favorite color?  ',
        description: '  Choose your preferred color  '
      }
      const poll = await createPoll(dataWithWhitespace, 'user-1')
      
      expect(poll!.question).toBe('What is your favorite color?')
      expect(poll!.description).toBe('Choose your preferred color')
    })

    it('should filter out empty options', async () => {
      const dataWithEmptyOptions = {
        ...validPollData,
        options: ['Red', '', 'Blue', '   ', 'Green']
      }
      const poll = await createPoll(dataWithEmptyOptions, 'user-1')
      
      expect(poll!.options).toHaveLength(3)
      expect(poll!.options.map(o => o.text)).toEqual(['Red', 'Blue', 'Green'])
    })

    it('should set default category when not provided', async () => {
      const dataWithoutCategory = { ...validPollData, category: '' }
      const poll = await createPoll(dataWithoutCategory, 'user-1')
      
      expect(poll!.category).toBe('General')
    })

    it('should set expiration date when provided', async () => {
      const expirationDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      const dataWithExpiration = { ...validPollData, expiresAt: expirationDate }
      const poll = await createPoll(dataWithExpiration, 'user-1')
      
      expect(poll!.expiresAt).toEqual(expirationDate)
    })
  })

  describe('getPolls', () => {
    beforeEach(async () => {
      seedTestData()
    })

    it('should return all polls when no filters provided', async () => {
      const polls = await getPolls()
      
      expect(polls).toHaveLength(2)
    })

    it('should filter by category', async () => {
      const polls = await getPolls({ category: 'Technology' })
      
      expect(polls).toHaveLength(1)
      expect(polls[0].category).toBe('Technology')
    })

    it('should filter by search term in question', async () => {
      const polls = await getPolls({ search: 'programming' })
      
      expect(polls).toHaveLength(1)
      expect(polls[0].question).toContain('programming')
    })

    it('should filter by search term in description', async () => {
      const polls = await getPolls({ search: 'web development' })
      
      expect(polls).toHaveLength(1)
      expect(polls[0].description).toContain('web development')
    })

    it('should filter by active status', async () => {
      const polls = await getPolls({ activeOnly: true })
      
      expect(polls.every(poll => poll.isActive)).toBe(true)
    })

    it('should sort by newest first', async () => {
      const polls = await getPolls({ sortBy: 'newest' })
      
      expect(polls[0].createdAt.getTime()).toBeGreaterThanOrEqual(polls[1].createdAt.getTime())
    })

    it('should sort by oldest first', async () => {
      const polls = await getPolls({ sortBy: 'oldest' })
      
      expect(polls[0].createdAt.getTime()).toBeLessThanOrEqual(polls[1].createdAt.getTime())
    })

    it('should limit results', async () => {
      const polls = await getPolls({ limit: 1 })
      
      expect(polls).toHaveLength(1)
    })

    it('should handle multiple filters', async () => {
      const polls = await getPolls({ 
        category: 'Technology',
        limit: 1,
        sortBy: 'newest'
      })
      
      expect(polls).toHaveLength(1)
      expect(polls[0].category).toBe('Technology')
    })

    it('should return empty array when no polls match filters', async () => {
      const polls = await getPolls({ category: 'NonexistentCategory' })
      
      expect(polls).toHaveLength(0)
    })
  })

  describe('getPollById', () => {
    beforeEach(async () => {
      seedTestData()
    })

    it('should return poll when valid ID provided', async () => {
      const polls = await getPolls()
      const pollId = polls[0].id
      
      const poll = await getPollById(pollId)
      
      expect(poll).not.toBeNull()
      expect(poll!.id).toBe(pollId)
    })

    it('should return null when poll not found', async () => {
      const poll = await getPollById('nonexistent-id')
      
      expect(poll).toBeNull()
    })

    it('should return null when empty ID provided', async () => {
      const poll = await getPollById('')
      
      expect(poll).toBeNull()
    })

    it('should return null when whitespace ID provided', async () => {
      const poll = await getPollById('   ')
      
      expect(poll).toBeNull()
    })
  })

  describe('getUserPolls', () => {
    beforeEach(async () => {
      seedTestData()
    })

    it('should return polls for valid user', async () => {
      const polls = await getUserPolls('user-1')
      
      expect(polls).toHaveLength(1)
      expect(polls[0].authorId).toBe('user-1')
    })

    it('should return empty array for user with no polls', async () => {
      const polls = await getUserPolls('user-3')
      
      expect(polls).toHaveLength(0)
    })

    it('should return empty array for nonexistent user', async () => {
      const polls = await getUserPolls('nonexistent-user')
      
      expect(polls).toHaveLength(0)
    })

    it('should return empty array when empty user ID provided', async () => {
      const polls = await getUserPolls('')
      
      expect(polls).toHaveLength(0)
    })
  })

  describe('voteOnPoll', () => {
    let pollId: string
    let optionId: string

    beforeEach(async () => {
      seedTestData()
      const polls = await getPolls()
      pollId = polls[0].id
      optionId = polls[0].options[0].id
    })

    it('should record vote successfully', async () => {
      const success = await voteOnPoll(pollId, optionId, 'user-1')
      
      expect(success).toBe(true)
      
      const poll = await getPollById(pollId)
      expect(poll!.totalVotes).toBe(1)
      expect(poll!.options[0].votes).toBe(1)
      expect(poll!.options[0].percentage).toBe(100)
    })

    it('should update existing vote', async () => {
      // Cast initial vote
      await voteOnPoll(pollId, optionId, 'user-1')
      
      // Change vote to different option
      const secondOptionId = (await getPollById(pollId))!.options[1].id
      const success = await voteOnPoll(pollId, secondOptionId, 'user-1')
      
      expect(success).toBe(true)
      
      const poll = await getPollById(pollId)
      expect(poll!.totalVotes).toBe(1) // Still only 1 vote total
      expect(poll!.options[0].votes).toBe(0) // First option should have 0 votes
      expect(poll!.options[1].votes).toBe(1) // Second option should have 1 vote
    })

    it('should calculate percentages correctly with multiple votes', async () => {
      const poll = await getPollById(pollId)
      const option1Id = poll!.options[0].id
      const option2Id = poll!.options[1].id
      
      // Cast votes
      await voteOnPoll(pollId, option1Id, 'user-1')
      await voteOnPoll(pollId, option1Id, 'user-2')
      await voteOnPoll(pollId, option2Id, 'user-3')
      
      const updatedPoll = await getPollById(pollId)
      expect(updatedPoll!.totalVotes).toBe(3)
      expect(updatedPoll!.options[0].votes).toBe(2)
      expect(updatedPoll!.options[0].percentage).toBe(67) // 2/3 rounded
      expect(updatedPoll!.options[1].votes).toBe(1)
      expect(updatedPoll!.options[1].percentage).toBe(33) // 1/3 rounded
    })

    it('should fail when poll not found', async () => {
      const success = await voteOnPoll('nonexistent-poll', optionId, 'user-1')
      
      expect(success).toBe(false)
    })

    it('should fail when option not found', async () => {
      const success = await voteOnPoll(pollId, 'nonexistent-option', 'user-1')
      
      expect(success).toBe(false)
    })

    it('should fail when poll is inactive', async () => {
      // Deactivate poll first
      await deactivatePoll(pollId, 'user-1')
      
      const success = await voteOnPoll(pollId, optionId, 'user-1')
      
      expect(success).toBe(false)
    })

    it('should fail when required parameters are empty', async () => {
      expect(await voteOnPoll('', optionId, 'user-1')).toBe(false)
      expect(await voteOnPoll(pollId, '', 'user-1')).toBe(false)
      expect(await voteOnPoll(pollId, optionId, '')).toBe(false)
    })
  })

  describe('getPollResults', () => {
    let pollId: string

    beforeEach(async () => {
      seedTestData()
      const polls = await getPolls()
      pollId = polls[0].id
      
      // Add some votes for testing
      const poll = await getPollById(pollId)
      await voteOnPoll(pollId, poll!.options[0].id, 'user-1')
      await voteOnPoll(pollId, poll!.options[1].id, 'user-2')
      await voteOnPoll(pollId, poll!.options[0].id, 'user-3')
    })

    it('should return poll results successfully', async () => {
      const results = await getPollResults(pollId)
      
      expect(results).not.toBeNull()
      expect(results!.pollId).toBe(pollId)
      expect(results!.totalVotes).toBe(3)
      expect(results!.topOption).toBe('JavaScript') // First option should be top
      expect(results!.topOptionVotes).toBe(2)
      expect(results!.topOptionPercentage).toBe(67)
      expect(results!.recentVotes).toHaveLength(3)
    })

    it('should return null for nonexistent poll', async () => {
      const results = await getPollResults('nonexistent-poll')
      
      expect(results).toBeNull()
    })

    it('should return null for empty poll ID', async () => {
      const results = await getPollResults('')
      
      expect(results).toBeNull()
    })

    it('should handle poll with no votes', async () => {
      clearAllData()
      const pollData: CreatePollData = {
        question: 'Test poll with no votes',
        options: ['Option 1', 'Option 2'],
        category: 'Test'
      }
      const poll = await createPoll(pollData, 'user-1')
      
      const results = await getPollResults(poll!.id)
      
      expect(results).not.toBeNull()
      expect(results!.totalVotes).toBe(0)
      expect(results!.topOptionVotes).toBe(0)
      expect(results!.recentVotes).toHaveLength(0)
    })
  })

  describe('getPollStats', () => {
    beforeEach(async () => {
      seedTestData()
      // Add some votes
      const polls = await getPolls()
      await voteOnPoll(polls[0].id, polls[0].options[0].id, 'user-1')
      await voteOnPoll(polls[1].id, polls[1].options[0].id, 'user-2')
    })

    it('should return global stats when no user ID provided', async () => {
      const stats = await getPollStats()
      
      expect(stats.totalPolls).toBe(2)
      expect(stats.activePolls).toBe(2)
      expect(stats.totalVotes).toBe(2)
      expect(stats.averageEngagement).toBe(1) // 2 votes / 2 polls
    })

    it('should return user-specific stats when user ID provided', async () => {
      const stats = await getPollStats('user-1')
      
      expect(stats.totalPolls).toBe(1) // user-1 created 1 poll
      expect(stats.activePolls).toBe(1)
      expect(stats.totalVotes).toBe(1) // 1 vote on user-1's poll
      expect(stats.averageEngagement).toBe(1)
    })

    it('should return zero stats for user with no polls', async () => {
      const stats = await getPollStats('user-3')
      
      expect(stats.totalPolls).toBe(0)
      expect(stats.activePolls).toBe(0)
      expect(stats.totalVotes).toBe(0)
      expect(stats.averageEngagement).toBe(0)
    })
  })

  describe('deactivatePoll', () => {
    let pollId: string

    beforeEach(async () => {
      seedTestData()
      const polls = await getPolls()
      pollId = polls[0].id
    })

    it('should deactivate poll successfully when user is author', async () => {
      const success = await deactivatePoll(pollId, 'user-1')
      
      expect(success).toBe(true)
      
      const poll = await getPollById(pollId)
      expect(poll!.isActive).toBe(false)
    })

    it('should fail when user is not the author', async () => {
      const success = await deactivatePoll(pollId, 'user-2')
      
      expect(success).toBe(false)
      
      const poll = await getPollById(pollId)
      expect(poll!.isActive).toBe(true) // Should remain active
    })

    it('should fail when poll not found', async () => {
      const success = await deactivatePoll('nonexistent-poll', 'user-1')
      
      expect(success).toBe(false)
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('should handle concurrent votes correctly', async () => {
      seedTestData()
      const polls = await getPolls()
      const pollId = polls[0].id
      const optionId = polls[0].options[0].id
      
      // Simulate concurrent votes
      const votePromises = [
        voteOnPoll(pollId, optionId, 'user-1'),
        voteOnPoll(pollId, optionId, 'user-2'),
        voteOnPoll(pollId, optionId, 'user-3')
      ]
      
      const results = await Promise.all(votePromises)
      
      expect(results.every(result => result === true)).toBe(true)
      
      const poll = await getPollById(pollId)
      expect(poll!.totalVotes).toBe(3)
    })

    it('should handle expired polls correctly', async () => {
      const expiredPollData: CreatePollData = {
        question: 'Expired poll',
        options: ['Option 1', 'Option 2'],
        category: 'Test',
        expiresAt: new Date(Date.now() - 1000) // 1 second ago
      }
      
      const poll = await createPoll(expiredPollData, 'user-1')
      const success = await voteOnPoll(poll!.id, poll!.options[0].id, 'user-1')
      
      expect(success).toBe(false)
    })

    it('should maintain data consistency across operations', async () => {
      clearAllData()
      
      // Create poll
      const pollData: CreatePollData = {
        question: 'Consistency test',
        options: ['A', 'B', 'C'],
        category: 'Test'
      }
      
      const poll = await createPoll(pollData, 'user-1')
      expect(poll).not.toBeNull()
      
      // Vote on poll
      const voteSuccess = await voteOnPoll(poll!.id, poll!.options[0].id, 'user-1')
      expect(voteSuccess).toBe(true)
      
      // Check consistency
      const retrievedPoll = await getPollById(poll!.id)
      const userPolls = await getUserPolls('user-1')
      const results = await getPollResults(poll!.id)
      const stats = await getPollStats('user-1')
      
      expect(retrievedPoll!.totalVotes).toBe(1)
      expect(userPolls).toHaveLength(1)
      expect(results!.totalVotes).toBe(1)
      expect(stats.totalVotes).toBe(1)
    })
  })
})
