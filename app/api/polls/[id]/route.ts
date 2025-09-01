import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client with service role for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const pollId = resolvedParams.id

    // Fetch poll with options and votes from Supabase
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .select(`
        id,
        question,
        description,
        category,
        isActive,
        expiresAt,
        createdAt,
        updatedAt,
        authorId,
        users!polls_authorId_fkey (
          id,
          name,
          email,
          avatar
        ),
        poll_options (
          id,
          text,
          votes (
            id,
            userId
          )
        )
      `)
      .eq('id', pollId)
      .single()

    if (pollError) {
      console.error('Error fetching poll:', pollError)
      return NextResponse.json({ error: 'Poll not found' }, { status: 404 })
    }

    if (!poll) {
      return NextResponse.json({ error: 'Poll not found' }, { status: 404 })
    }

    // Calculate vote counts and percentages
    const totalVotes = poll.poll_options.reduce((sum: number, option: any) => {
      return sum + (option.votes?.length || 0)
    }, 0)

    const pollWithStats = {
      id: poll.id,
      question: poll.question,
      description: poll.description,
      category: poll.category,
      isActive: poll.isActive,
      expiresAt: poll.expiresAt,
      createdAt: poll.createdAt,
      updatedAt: poll.updatedAt,
      totalVotes,
      options: poll.poll_options.map((option: any) => {
        const votes = option.votes?.length || 0
        const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0
        
        return {
          id: option.id,
          text: option.text,
          votes,
          percentage: Math.round(percentage * 10) / 10 // Round to 1 decimal place
        }
      }),
      author: {
        id: poll.users[0]?.id || poll.authorId,
        name: poll.users[0]?.name || 'Unknown',
        email: poll.users[0]?.email || 'unknown@example.com',
        avatar: poll.users[0]?.avatar || null
      }
    }

    return NextResponse.json({ poll: pollWithStats })
  } catch (error) {
    console.error('Error fetching poll:', error)
    return NextResponse.json(
      { error: 'Failed to fetch poll' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const pollId = resolvedParams.id
    const body = await request.json()
    const { optionId, userId } = body

    // Validation
    if (!optionId || !userId) {
      return NextResponse.json(
        { error: 'Option ID and User ID are required' },
        { status: 400 }
      )
    }

    // Check if poll exists and is active
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .select('id, isActive, expiresAt')
      .eq('id', pollId)
      .single()

    if (pollError || !poll) {
      return NextResponse.json({ error: 'Poll not found' }, { status: 404 })
    }

    if (!poll.isActive) {
      return NextResponse.json({ error: 'Poll is not active' }, { status: 400 })
    }

    if (poll.expiresAt && new Date(poll.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'Poll has expired' }, { status: 400 })
    }

    // Check if option exists
    const { data: option, error: optionError } = await supabase
      .from('poll_options')
      .select('id')
      .eq('id', optionId)
      .eq('pollId', pollId)
      .single()

    if (optionError || !option) {
      return NextResponse.json({ error: 'Option not found' }, { status: 404 })
    }

    // Check if user already voted on this poll
    const { data: existingVote, error: voteCheckError } = await supabase
      .from('votes')
      .select('id')
      .eq('pollId', pollId)
      .eq('userId', userId)
      .single()

    if (voteCheckError && voteCheckError.code !== 'PGRST116') {
      console.error('Error checking existing vote:', voteCheckError)
      return NextResponse.json({ error: 'Failed to check vote status' }, { status: 500 })
    }

    if (existingVote) {
      // Update existing vote
      const { data: updatedVote, error: updateError } = await supabase
        .from('votes')
        .update({ optionId })
        .eq('id', existingVote.id)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating vote:', updateError)
        return NextResponse.json({ error: 'Failed to update vote' }, { status: 500 })
      }

      return NextResponse.json({ 
        vote: updatedVote,
        message: 'Vote updated successfully' 
      }, { status: 200 })
    } else {
      // Create new vote
      const { data: newVote, error: createError } = await supabase
        .from('votes')
        .insert({
          pollId,
          optionId,
          userId
        })
        .select()
        .single()

      if (createError) {
        console.error('Error creating vote:', createError)
        return NextResponse.json({ error: 'Failed to create vote' }, { status: 500 })
      }

      return NextResponse.json({ 
        vote: newVote,
        message: 'Vote created successfully' 
      }, { status: 201 })
    }

  } catch (error) {
    console.error('Error voting on poll:', error)
    return NextResponse.json(
      { error: 'Failed to vote on poll' },
      { status: 500 }
    )
  }
}
