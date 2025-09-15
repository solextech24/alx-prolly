import { getServerSession } from 'next-auth'
import { authOptions } from './auth-config'

/**
 * Extended user interface that includes the ID field from JWT token.
 * This interface is used for type safety when accessing user data from sessions
 * that have been extended with custom JWT callbacks.
 */
interface ExtendedUser {
  /** Unique user identifier from JWT token */
  id?: string
  /** User's display name */
  name?: string | null
  /** User's email address */
  email?: string | null
  /** User's profile image URL */
  image?: string | null
}

/**
 * Server-side utility to get the authenticated user's ID.
 * 
 * This function is designed for use in API routes, server components, and
 * middleware where server-side session access is required. It safely extracts
 * the user ID from the NextAuth session, providing a consistent way to identify
 * the current user for data operations.
 * 
 * Key features:
 * - Server-side session access without client-side hooks
 * - Safe error handling with null return on failure
 * - Type-safe access to extended user properties
 * - Logging for debugging authentication issues
 * 
 * @returns Promise resolving to user ID string if authenticated, null otherwise
 * 
 * @example
 * ```ts
 * // In an API route
 * export async function GET() {
 *   const userId = await getAuthenticatedUserId()
 *   if (!userId) {
 *     return new Response('Unauthorized', { status: 401 })
 *   }
 *   
 *   const userPolls = await getUserPolls(userId)
 *   return Response.json(userPolls)
 * }
 * ```
 * 
 * @example
 * ```ts
 * // In a server component
 * export default async function UserDashboard() {
 *   const userId = await getAuthenticatedUserId()
 *   if (!userId) {
 *     redirect('/login')
 *   }
 *   
 *   return <DashboardContent userId={userId} />
 * }
 * ```
 */
export async function getAuthenticatedUserId(): Promise<string | null> {
  try {
    // Get the current session using NextAuth's server-side session access
    const session = await getServerSession(authOptions)
    
    // Cast to our extended session type that includes id from JWT callback
    // This is safe because our JWT callback always adds the id field
    const user = session?.user as ExtendedUser
    
    // Return the user ID if available, ensuring we have a valid session
    return user?.id || null
  } catch (error) {
    // Log authentication errors for debugging while avoiding exposure of sensitive details
    console.error('Error getting authenticated user:', error)
    return null
  }
}
