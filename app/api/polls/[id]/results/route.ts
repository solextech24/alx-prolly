import { NextRequest, NextResponse } from 'next/server'
import { getPollResults } from '@/lib/actions/poll-actions'

interface Params {
  id: string;
}

    const { id } = params
    if (!id || typeof id !== 'string' || id.trim() === '') {
      return NextResponse.json({ error: 'Invalid poll id' }, { status: 400 })
    }
    const results = await getPollResults(id)
) {
  try {
    const { id } = params
    const results = await getPollResults(id)

    if (!results) {
      return NextResponse.json({ error: 'Poll results not found' }, { status: 404 })
    }

    return NextResponse.json({ results })
  } catch (error) {
    console.error(`Error in GET /api/polls/[id]/results:`, error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}