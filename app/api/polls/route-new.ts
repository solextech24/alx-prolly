import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client with service role for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  try {
    // Fetch polls with their options and vote counts from Supabase
    const { data: polls, error: pollsError } = await supabase
      .from('polls')
      .select(`
        id,
        question,
        description,
        category,
        isActive,
        expiresAt,
        createdAt,
        authorId,
        users!polls_authorId_fkey (
          id,
          name,
          email
        ),
        poll_options (
          id,
          text,
          votes (count)
        )
      `)
      .eq('isActive', true)
      .order('createdAt', { ascending: false })

    if (pollsError) {
      console.error('Error fetching polls:', pollsError)
      return NextResponse.json({ error: 'Failed to fetch polls' }, { status: 500 })
    }

    // Transform the data to match the expected format
    const transformedPolls = polls?.map(poll => {
      const totalVotes = poll.poll_options.reduce((sum: number, option: any) => {
        return sum + (option.votes?.length || 0)
      }, 0)

      return {
        id: poll.id,
        question: poll.question,
        description: poll.description,
        category: poll.category,
        isActive: poll.isActive,
        expiresAt: poll.expiresAt,
        createdAt: poll.createdAt,
        totalVotes,
        options: poll.poll_options.map((option: any) => ({
          id: option.id,
          text: option.text,
          votes: option.votes?.length || 0
        })),
        author: {
          id: poll.users[0]?.id || poll.authorId,
          name: poll.users[0]?.name || 'Unknown',
          email: poll.users[0]?.email || 'unknown@example.com'
        }
      }
    }) || []

    return NextResponse.json({ polls: transformedPolls })
  } catch (error) {
    console.error('Error in GET /api/polls:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { question, description, options, category } = body

    // Validation
    if (!question || !options || options.length < 2) {
      return NextResponse.json(
        { error: 'Question and at least 2 options are required' },
        { status: 400 }
      )
    }

    // For demo purposes, we'll use a hardcoded user ID
    // In a real app, this would come from authentication
    const demoUserId = 'user-1' // This matches our sample data

    // Create the poll
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .insert({
        question: question.trim(),
        description: description?.trim() || null,
        category: category || 'General',
        authorId: demoUserId,
        isActive: true
      })
      .select()
      .single()

    if (pollError) {
      console.error('Error creating poll:', pollError)
      return NextResponse.json(
        { error: 'Failed to create poll' },
        { status: 500 }
      )
    }

    // Create poll options
    const pollOptions = options.map((text: string) => ({
      text: text.trim(),
      pollId: poll.id
    }))

    const { data: createdOptions, error: optionsError } = await supabase
      .from('poll_options')
      .insert(pollOptions)
      .select()

    if (optionsError) {
      console.error('Error creating poll options:', optionsError)
      // If options creation fails, clean up the poll
      await supabase.from('polls').delete().eq('id', poll.id)
      return NextResponse.json(
        { error: 'Failed to create poll options' },
        { status: 500 }
      )
    }

    // Return the created poll with options
    const pollWithOptions = {
      ...poll,
      options: createdOptions.map(option => ({
        id: option.id,
        text: option.text,
        votes: 0
      })),
      totalVotes: 0
    }

    return NextResponse.json(
      { 
        poll: pollWithOptions,
        message: 'Poll created successfully' 
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Error in POST /api/polls:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
