import { NextRequest, NextResponse } from 'next/server'
import { createPoll, getPolls, seedTestData } from '@/lib/actions/poll-actions'
import { getAuthenticatedUserId } from '@/lib/auth/server-auth'

/**
 * Polls API Route Handlers
 * 
 * This module provides REST API endpoints for poll management operations.
 * It handles both poll retrieval with filtering/sorting and poll creation
 * with comprehensive validation and authentication.
 * 
 * Features:
 * - Poll listing with filtering, searching, and sorting
 * - Poll creation with authentication and validation
 * - Test data seeding for development
 * - Comprehensive error handling and logging
 */

// Seed initial data for testing and development
// This populates the in-memory store with sample polls for demonstration
seedTestData()

/**
 * GET /api/polls - Retrieve polls with optional filtering and sorting
 * 
 * This endpoint fetches polls from the system with comprehensive filtering,
 * searching, and sorting capabilities. It supports pagination through limits
 * and can filter by various criteria to provide targeted poll lists.
 * 
 * Query Parameters:
 * - category: Filter polls by category (case-insensitive)
 * - search: Search in poll questions, descriptions, and categories
 * - sortBy: Sort order ('newest', 'oldest', 'mostVotes', 'leastVotes')
 * - limit: Maximum number of polls to return (1-100, enforced)
 * - activeOnly: Only return active, non-expired polls (true/false/'1'/'')
 * 
 * @param request - NextRequest containing query parameters
 * @returns NextResponse with polls array or error message
 * 
 * @example
 * ```ts
 * // Get active technology polls, newest first, limit 10
 * const response = await fetch('/api/polls?category=technology&activeOnly=true&sortBy=newest&limit=10')
 * const { polls } = await response.json()
 * ```
 * 
 * Response format:
 * ```json
 * {
 *   "polls": [
 *     {
 *       "id": "poll-1",
 *       "question": "What's your favorite programming language?",
 *       "options": [...],
 *       "totalVotes": 156,
 *       "category": "Technology",
 *       "isActive": true,
 *       ...
 *     }
 *   ]
 * }
 * ```
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Extract and validate query parameters
    const category = searchParams.get('category') || undefined
    const search = searchParams.get('search') || undefined
    const sortBy = searchParams.get('sortBy') || undefined

    // Parse and validate limit parameter with bounds checking
    const limitParam = searchParams.get('limit')
    const parsedLimit = limitParam != null
      ? Number.parseInt(limitParam, 10)
      : undefined

    // Parse activeOnly parameter - supports multiple truthy formats
    const activeOnlyParam = searchParams.get('activeOnly')
    const activeOnly =
      activeOnlyParam === '' ||
      activeOnlyParam?.toLowerCase() === 'true' ||
      activeOnlyParam === '1'

    // Enforce limit bounds: minimum 1, maximum 100 to prevent abuse
    const limit =
      Number.isFinite(parsedLimit as number)
        ? Math.max(1, Math.min(100, parsedLimit as number))
        : undefined

    // Build filters object for poll retrieval
    const filters = { category, search, sortBy, limit, activeOnly }
    const polls = await getPolls(filters)
    
    return NextResponse.json({ polls })
  } catch (error) {
    console.error('Error in GET /api/polls:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/polls - Create a new poll with authentication and validation
 * 
 * This endpoint creates new polls with comprehensive validation, authentication,
 * and data sanitization. It ensures data integrity and security while providing
 * detailed error messages for validation failures.
 * 
 * Authentication: Requires valid user session (401 if not authenticated)
 * 
 * Request body validation:
 * - question: Required, non-empty string (trimmed)
 * - description: Optional string (trimmed if provided)
 * - options: Required array, minimum 2 valid options, duplicates removed
 * - category: Optional category classification
 * - expiresAt: Optional future date for poll expiration
 * 
 * Security features:
 * - Input sanitization (trimming, deduplication)
 * - Authentication requirement
 * - Date validation for expiration
 * - Maximum option limits (enforced in poll actions)
 * 
 * @param request - NextRequest containing poll creation data
 * @returns NextResponse with created poll data or error details
 * 
 * @example
 * ```ts
 * const response = await fetch('/api/polls', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     question: 'What is your favorite programming language?',
 *     description: 'Help us understand developer preferences',
 *     options: ['JavaScript', 'Python', 'TypeScript', 'Go', 'Rust'],
 *     category: 'Technology',
 *     expiresAt: '2024-12-31T23:59:59.000Z'
 *   })
 * })
 * 
 * const result = await response.json()
 * if (response.ok) {
 *   console.log('Poll created:', result.poll)
 * }
 * ```
 */
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user ID from server-side auth helper
    // This ensures only authenticated users can create polls
    const authorIdFromAuth = await getAuthenticatedUserId()
    
    if (!authorIdFromAuth) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const { question, description, options, category, expiresAt } = body

    // Validate required fields - question is mandatory for poll creation
    if (!question) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      )
    }

    // Validate and normalize options array
    // Options must be provided as an array for poll choices
    if (!options || !Array.isArray(options)) {
      return NextResponse.json(
        { error: 'Options must be provided as an array' },
        { status: 400 }
      )
    }

    // Trim, filter empty strings, and deduplicate options
    // This ensures clean data and prevents duplicate choices
    const normalizedOptions = [...new Set(
      options
        .map(option => typeof option === 'string' ? option.trim() : '')
        .filter(option => option.length > 0)
    )]

    // Minimum 2 options required for a meaningful poll
    if (normalizedOptions.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 valid options are required' },
        { status: 400 }
      )
    }

    // Validate expiresAt date if provided
    let validatedExpiresAt: Date | undefined = undefined
    if (expiresAt) {
      const parsedDate = new Date(expiresAt)
      
      // Check if date string parses to a valid date
      if (isNaN(parsedDate.getTime())) {
        return NextResponse.json(
          { error: 'Invalid expiresAt date format' },
          { status: 400 }
        )
      }

      // Ensure expiration date is in the future to prevent immediate expiry
      if (parsedDate <= new Date()) {
        return NextResponse.json(
          { error: 'expiresAt must be a future date' },
          { status: 400 }
        )
      }

      validatedExpiresAt = parsedDate
    }

    // Build poll data object with sanitized and validated values
    const pollData = {
      question: question.trim(),
      description: description?.trim(),
      options: normalizedOptions,
      category,
      expiresAt: validatedExpiresAt,
    }

    // Create poll using validated data and authenticated user ID
    const poll = await createPoll(pollData, authorIdFromAuth)

    // Handle poll creation failure
    if (!poll) {
      return NextResponse.json({ error: 'Failed to create poll' }, { status: 500 })
    }

    // Return success response with created poll data
    return NextResponse.json({ poll, message: 'Poll created successfully' }, { status: 201 })
  } catch (error) {
    // Log detailed error for debugging while returning generic message to client
    console.error('Error in POST /api/polls:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}