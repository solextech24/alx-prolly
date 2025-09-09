import { NextRequest, NextResponse } from 'next/server'
import { createPoll, getPolls, seedTestData } from '@/lib/actions/poll-actions'
import { getAuthenticatedUserId } from '@/lib/auth/server-auth'

// Seed initial data for testing
seedTestData()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || undefined
    const search = searchParams.get('search') || undefined
    const sortBy = searchParams.get('sortBy') || undefined

    const limitParam = searchParams.get('limit')
    const parsedLimit = limitParam != null
      ? Number.parseInt(limitParam, 10)
      : undefined

    const activeOnlyParam = searchParams.get('activeOnly')
    const activeOnly =
      activeOnlyParam === '' ||
      activeOnlyParam?.toLowerCase() === 'true' ||
      activeOnlyParam === '1'

    const limit =
      Number.isFinite(parsedLimit as number)
        ? Math.max(1, Math.min(100, parsedLimit as number))
        : undefined

    const filters = { category, search, sortBy, limit, activeOnly }
    const polls = await getPolls(filters)
    
    return NextResponse.json({ polls })
  } catch (error) {
    console.error('Error in GET /api/polls:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user ID from server-side auth helper
    const authorIdFromAuth = await getAuthenticatedUserId()
    
    if (!authorIdFromAuth) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { question, description, options, category, expiresAt } = body

    // Validate required fields
    if (!question) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      )
    }

    // Validate and normalize options
    if (!options || !Array.isArray(options)) {
      return NextResponse.json(
        { error: 'Options must be provided as an array' },
        { status: 400 }
      )
    }

    // Trim, filter empty strings, and deduplicate options
    const normalizedOptions = [...new Set(
      options
        .map(option => typeof option === 'string' ? option.trim() : '')
        .filter(option => option.length > 0)
    )]

    if (normalizedOptions.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 valid options are required' },
        { status: 400 }
      )
    }

    // Validate expiresAt
    let validatedExpiresAt: Date | undefined = undefined
    if (expiresAt) {
      const parsedDate = new Date(expiresAt)
      
      // Check if date is valid
      if (isNaN(parsedDate.getTime())) {
        return NextResponse.json(
          { error: 'Invalid expiresAt date format' },
          { status: 400 }
        )
      }

      // Check if date is in the future (optional validation)
      if (parsedDate <= new Date()) {
        return NextResponse.json(
          { error: 'expiresAt must be a future date' },
          { status: 400 }
        )
      }

      validatedExpiresAt = parsedDate
    }

    // Build poll data with sanitized and validated values
    const pollData = {
      question: question.trim(),
      description: description?.trim(),
      options: normalizedOptions,
      category,
      expiresAt: validatedExpiresAt,
    }

    const poll = await createPoll(pollData, authorIdFromAuth)

    if (!poll) {
      return NextResponse.json({ error: 'Failed to create poll' }, { status: 500 })
    }

    return NextResponse.json({ poll, message: 'Poll created successfully' }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/polls:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}