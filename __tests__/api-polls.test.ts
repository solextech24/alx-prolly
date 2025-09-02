import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/polls/route'

// Mock the NextResponse module since it's not available in test environment
jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: jest.fn((data, options) => ({
      json: () => Promise.resolve(data),
      status: options?.status || 200,
      ok: (options?.status || 200) >= 200 && (options?.status || 200) < 300
    }))
  }
}))

describe('/api/polls API Routes', () => {
  describe('GET /api/polls', () => {
    it('should return polls successfully', async () => {
      const response = await GET()
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data).toHaveProperty('polls')
      expect(Array.isArray(data.polls)).toBe(true)
      expect(data.polls.length).toBeGreaterThan(0)
    })

    it('should return polls with correct structure', async () => {
      const response = await GET()
      const data = await response.json()
      
      const poll = data.polls[0]
      expect(poll).toHaveProperty('id')
      expect(poll).toHaveProperty('question')
      expect(poll).toHaveProperty('description')
      expect(poll).toHaveProperty('category')
      expect(poll).toHaveProperty('isActive')
      expect(poll).toHaveProperty('totalVotes')
      expect(poll).toHaveProperty('options')
      expect(poll).toHaveProperty('author')
      expect(Array.isArray(poll.options)).toBe(true)
    })

    it('should return polls with valid option structure', async () => {
      const response = await GET()
      const data = await response.json()
      
      const option = data.polls[0].options[0]
      expect(option).toHaveProperty('id')
      expect(option).toHaveProperty('text')
      expect(option).toHaveProperty('votes')
      expect(typeof option.votes).toBe('number')
    })
  })

  describe('POST /api/polls', () => {
    const validPollData = {
      question: 'What is your favorite testing framework?',
      description: 'Choose your preferred testing framework for JavaScript',
      options: ['Jest', 'Mocha', 'Jasmine', 'Vitest'],
      category: 'Technology'
    }

    // Mock request helper
    const createMockRequest = (body: Record<string, unknown>) => ({
      json: () => Promise.resolve(body)
    } as NextRequest)

    it('should create poll successfully with valid data', async () => {
      const mockRequest = createMockRequest(validPollData)
      const response = await POST(mockRequest)
      const data = await response.json()
      
      expect(response.status).toBe(201)
      expect(data).toHaveProperty('poll')
      expect(data).toHaveProperty('message')
      expect(data.poll.question).toBe(validPollData.question)
      expect(data.poll.options).toHaveLength(4)
    })

    it('should fail when question is missing', async () => {
      const invalidData = { ...validPollData, question: '' }
      const mockRequest = createMockRequest(invalidData)
      const response = await POST(mockRequest)
      
      expect(response.status).toBe(400)
    })

    it('should fail when less than 2 options provided', async () => {
      const invalidData = { ...validPollData, options: ['Only one'] }
      const mockRequest = createMockRequest(invalidData)
      const response = await POST(mockRequest)
      
      expect(response.status).toBe(400)
    })

    it('should trim whitespace from inputs', async () => {
      const dataWithWhitespace = {
        ...validPollData,
        question: '  ' + validPollData.question + '  ',
        description: '  ' + validPollData.description + '  '
      }
      const mockRequest = createMockRequest(dataWithWhitespace)
      const response = await POST(mockRequest)
      const data = await response.json()
      
      expect(response.status).toBe(201)
      expect(data.poll.question).toBe(validPollData.question)
      expect(data.poll.description).toBe(validPollData.description)
    })

    it('should set default category when not provided', async () => {
      const dataWithoutCategory = { 
        question: validPollData.question,
        description: validPollData.description,
        options: validPollData.options
      }
      
      const mockRequest = createMockRequest(dataWithoutCategory)
      const response = await POST(mockRequest)
      const data = await response.json()
      
      expect(response.status).toBe(201)
      expect(data.poll.category).toBe('General')
    })

    it('should handle malformed JSON', async () => {
      const mockRequest = {
        json: () => Promise.reject(new Error('Invalid JSON'))
      } as NextRequest
      
      const response = await POST(mockRequest)
      
      expect(response.status).toBe(500)
    })

    it('should generate unique IDs for poll and options', async () => {
      const mockRequest1 = createMockRequest(validPollData)
      const mockRequest2 = createMockRequest({
        ...validPollData,
        question: 'Different question'
      })
      
      const response1 = await POST(mockRequest1)
      const response2 = await POST(mockRequest2)
      
      const data1 = await response1.json()
      const data2 = await response2.json()
      
      expect(data1.poll.id).not.toBe(data2.poll.id)
      expect(data1.poll.options[0].id).not.toBe(data2.poll.options[0].id)
    })

    it('should set correct initial values for new poll', async () => {
      const mockRequest = createMockRequest(validPollData)
      const response = await POST(mockRequest)
      const data = await response.json()
      
      expect(data.poll.totalVotes).toBe(0)
      expect(data.poll.isActive).toBe(true)
      expect(data.poll.options.every((opt: { votes: number }) => opt.votes === 0)).toBe(true)
      expect(data.poll.author).toHaveProperty('id')
      expect(data.poll.author).toHaveProperty('name')
      expect(data.poll.author).toHaveProperty('email')
    })
  })
})
