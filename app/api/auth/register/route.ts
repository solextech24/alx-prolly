import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db/prisma'
import { RegisterData } from '@/lib/types'

/**
 * User Registration API Route Handler
 * 
 * This API endpoint handles new user registration with comprehensive validation
 * and security measures. It creates new user accounts in the database with
 * properly hashed passwords and generates avatar images.
 * 
 * Security features:
 * - Password hashing with bcryptjs (12 rounds for security vs performance balance)
 * - Email uniqueness validation to prevent duplicate accounts
 * - Password confirmation matching
 * - Minimum password length requirements
 * - Input sanitization and validation
 * - Error handling without information leakage
 * 
 * @param request - NextRequest containing registration form data
 * @returns NextResponse with success/error status and user data
 * 
 * @example
 * ```ts
 * // Client-side usage
 * const response = await fetch('/api/auth/register', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     name: 'John Doe',
 *     email: 'john@example.com',
 *     password: 'securePassword123',
 *     confirmPassword: 'securePassword123'
 *   })
 * })
 * 
 * const result = await response.json()
 * if (response.ok) {
 *   // Registration successful, redirect to login or dashboard
 * } else {
 *   // Show error message from result.error
 * }
 * ```
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body: RegisterData = await request.json()
    const { name, email, password, confirmPassword } = body

    // Comprehensive input validation
    // All fields are required for complete user registration
    if (!name || !email || !password || !confirmPassword) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Password confirmation validation
    // Ensures user typed password correctly and prevents typos
    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      )
    }

    // Password strength validation
    // Minimum 6 characters provides basic security without being overly restrictive
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Check for existing user to prevent duplicate accounts
    // Email uniqueness is enforced at both application and database levels
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password using bcrypt with 12 rounds
    // 12 rounds provides strong security while maintaining reasonable performance
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user with secure password and generated avatar
    // Avatar uses initials API for consistent, professional-looking profile images
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${name}`
      }
    })

    // Remove password from response for security
    // Never send password hashes to the client, even if hashed
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(
      { 
        message: 'User created successfully',
        user: userWithoutPassword
      },
      { status: 201 }
    )
  } catch (error) {
    // Log detailed error for debugging while returning generic message to client
    // This prevents leaking implementation details that could aid attackers
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}



