import { NextRequest, NextResponse } from 'next/server'
import { getPollStats } from '@/lib/actions/poll-actions'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || undefined
    
    const stats = await getPollStats(userId)

    return NextResponse.json({ stats })
  } catch (error)
  {
    console.error('Error in GET /api/stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
