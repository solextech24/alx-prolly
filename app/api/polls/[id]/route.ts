import { NextRequest, NextResponse } from 'next/server'
import { getPollById, deactivatePoll } from '@/lib/actions/poll-actions'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const poll = await getPollById(id)

    if (!poll) {
      return NextResponse.json({ error: 'Poll not found' }, { status: 404 })
    }

    return NextResponse.json({ poll })
  } catch (error) {
    console.error(`Error in GET /api/polls/[id]:`, error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    let userId: string | undefined
    try {
      const body = await request.json()
      userId = typeof body?.userId === 'string' ? body.userId : undefined
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const result = await deactivatePoll(id, userId)

    if (!result.ok) {
      // Log the detailed error information server-side
      console.error(`Deactivate poll failed for poll ${id} by user ${userId}:`, result)
      
      // Map error reasons to appropriate HTTP status codes with generic messages
      switch (result.reason) {
        case 'forbidden':
          return NextResponse.json({ 
            error: 'Forbidden', 
            reason: result.reason 
          }, { status: 403 })
        
        case 'not_found':
          return NextResponse.json({ 
            error: 'Poll not found', 
            reason: result.reason 
          }, { status: 404 })
        
        case 'conflict':
          return NextResponse.json({ 
            error: 'Conflict', 
            reason: result.reason 
          }, { status: 409 })
        
        case 'server_error':
        default:
          return NextResponse.json({ 
            error: 'Internal server error', 
            reason: result.reason 
          }, { status: 500 })
      }
    }

    return NextResponse.json({ message: 'Poll deactivated successfully' })
  } catch (error) {
    console.error(`Error in DELETE /api/polls/[id]:`, error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}