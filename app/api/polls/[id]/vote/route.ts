import { NextRequest, NextResponse } from 'next/server'
import { voteOnPoll } from '@/lib/actions/poll-actions'
import { getAuthenticatedUserId } from '@/lib/auth/server-auth'
import { z } from 'zod'

/**
 * Voting API Route Handler
 * 
 * This endpoint handles vote submission for polls with comprehensive validation,
 * authentication, and error handling. It ensures secure voting by requiring
 * authentication and validates all inputs before processing votes.
 * 
 * Features:
 * - User authentication requirement
 * - Input validation with Zod schema
 * - Content-Type validation
 * - Comprehensive error handling
 * - Server-side user ID extraction for security
 * 
 * Security measures:
 * - User ID derived from server-side authentication (not client input)
 * - Content-Type validation to prevent CSRF
 * - Input sanitization and validation
 * - Detailed error logging for debugging
 * 
 * @param request - NextRequest containing vote data (optionId)
 * @param params - Route parameters containing poll ID
 * @returns NextResponse with success/error status
 * 
 * Request body schema:
 * ```json
 * {
 *   "optionId": "option-123"
 * }
 * ```
 * 
 * Success response:
 * ```json
 * {
 *   "message": "Vote recorded successfully"
 * }
 * ```
 * 
 * Error responses:
 * - 401: User not authenticated
 * - 400: Invalid poll ID or request body
 * - 415: Invalid content type (not JSON)
 * - 500: Vote recording failed or internal error
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get authenticated user ID from server-side session
    // This ensures security by not trusting client-provided user IDs
    const userId = await getAuthenticatedUserId()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Extract and validate poll ID from route parameters
    const { id: pollId } = params
    if (!params?.id) {
      return NextResponse.json({ error: 'pollId is required' }, { status: 400 })
    }
    
    // Validate content type to prevent CSRF attacks
    const contentType = request.headers.get('content-type') ?? ''
    if (!contentType.includes('application/json')) {
      return NextResponse.json({ error: 'Unsupported Media Type' }, { status: 415 })
    }
    
    // Parse and validate request body with error handling
    const raw = await request.json().catch(() => null)
    const BodySchema = z.object({
      optionId: z.string().min(1), // Require non-empty option ID
      // userId intentionally omitted; derive from server-side auth for security
    })
    const parsed = BodySchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }
    const { optionId } = parsed.data

    // Process the vote with comprehensive error handling
    const success = await voteOnPoll(pollId, optionId, userId)

    if (!success) {
      return NextResponse.json({ error: 'Failed to record vote' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Vote recorded successfully' })
  } catch (error) {
    // Log detailed error information for debugging while protecting sensitive data
    console.error('Error recording vote', { params, error })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
