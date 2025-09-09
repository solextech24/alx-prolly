import { NextRequest, NextResponse } from 'next/server'
import { voteOnPoll } from '@/lib/actions/poll-actions'
import { getAuthenticatedUserId } from '@/lib/auth/server-auth'
import { z } from 'zod'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get authenticated user ID from server-side session
    const userId = await getAuthenticatedUserId()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: pollId } = params
    if (!params?.id) {
      return NextResponse.json({ error: 'pollId is required' }, { status: 400 })
    }
    const contentType = request.headers.get('content-type') ?? ''
    if (!contentType.includes('application/json')) {
      return NextResponse.json({ error: 'Unsupported Media Type' }, { status: 415 })
    }
    const raw = await request.json().catch(() => null)
    const BodySchema = z.object({
      optionId: z.string().min(1), // switch to .uuid() if applicable
      // userId intentionally omitted; derive from server-side auth
    })
    const parsed = BodySchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }
    const { optionId } = parsed.data

    const success = await voteOnPoll(pollId, optionId, userId)

    if (!success) {
      return NextResponse.json({ error: 'Failed to record vote' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Vote recorded successfully' })
  } catch (error) {
    console.error('Error recording vote', { params, error })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
