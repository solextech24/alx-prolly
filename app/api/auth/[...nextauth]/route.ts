import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth/auth-config'

/**
 * NextAuth.js API Route Handler
 * 
 * This file sets up the NextAuth.js API routes using the App Router structure.
 * It creates a single handler that responds to all NextAuth-related API requests
 * including sign-in, sign-out, session management, and OAuth callbacks.
 * 
 * The handler uses the authentication configuration defined in auth-config.ts
 * to provide consistent authentication behavior across the application.
 * 
 * Routes handled:
 * - GET /api/auth/signin - Sign in page and provider endpoints
 * - POST /api/auth/signin - Sign in form submission
 * - GET /api/auth/signout - Sign out confirmation
 * - POST /api/auth/signout - Sign out action
 * - GET /api/auth/session - Current session data
 * - GET /api/auth/callback/[provider] - OAuth provider callbacks
 * - POST /api/auth/callback/[provider] - OAuth provider token exchange
 * 
 * @see https://next-auth.js.org/configuration/initialization#route-handlers-app
 */
const handler = NextAuth(authOptions)

// Export the same handler for both GET and POST requests
// NextAuth handles the routing internally based on the request path and method
export { handler as GET, handler as POST }
