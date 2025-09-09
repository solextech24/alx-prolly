import { NextRequest, NextResponse } from 'next/server'
import { getUserPolls } from '@/lib/actions/poll-actions'
import { z, ZodError } from 'zod'

// Schema for validating route parameters
const ParamsSchema = z.object({
  userId: z.string()
    .min(1, 'User ID is required')
    .trim()
    .regex(/^[a-zA-Z0-9_-]+$/, 'User ID must contain only alphanumeric characters, hyphens, and underscores')
    .max(50, 'User ID must not exceed 50 characters')
})

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  // Extract userId early for error logging
  const userIdParam = params.userId

  try {
    // Validate params before proceeding
    const validationResult = ParamsSchema.safeParse(params)
    
    if (!validationResult.success) {
      return NextResponse.json({ 
        error: 'Invalid parameters', 
        details: validationResult.error.issues 
      }, { status: 400 })
    }
    
    const { userId } = validationResult.data
    const polls = await getUserPolls(userId)

    return NextResponse.json({ polls })
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      return NextResponse.json({ 
        error: 'Invalid request', 
        details: error.issues 
      }, { status: 400 })
    }

    // Handle not found errors (user doesn't exist or has no polls)
    if (error instanceof Error && (
      error.name === 'NotFoundError' || 
      error.message.includes('not found') || 
      error.message.includes('User not found')
    )) {
      return NextResponse.json({ 
        error: 'Not found' 
      }, { status: 404 })
    }

    // Log error with userId for traceability and return generic 500 response
    console.error(`Error in GET /api/users/${userIdParam}/polls:`, error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
