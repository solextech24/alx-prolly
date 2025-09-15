import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

/**
 * Environment variable helper that fails fast on missing required variables.
 * This ensures the application doesn't start with incomplete configuration,
 * preventing runtime errors and providing clear feedback during deployment.
 * 
 * @param name - The name of the environment variable to retrieve
 * @returns The environment variable value
 * @throws Error if the environment variable is not set
 */
function env(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

/**
 * NextAuth.js configuration for the polling application.
 * 
 * This configuration sets up JWT-based authentication with Google OAuth provider.
 * JWT strategy is chosen over database sessions for simplicity and scalability,
 * as it doesn't require session storage and works well with serverless deployments.
 * 
 * Key features:
 * - Google OAuth integration for seamless user authentication
 * - JWT token management with user ID persistence
 * - Custom sign-in page redirection
 * - Access token preservation for potential Google API usage
 * 
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  // Secret used to encrypt JWT tokens - critical for security
  secret: env('NEXTAUTH_SECRET'),
  
  providers: [
    GoogleProvider({
      clientId: env('GOOGLE_CLIENT_ID'),
      clientSecret: env('GOOGLE_CLIENT_SECRET')
    })
  ],
  
  session: {
    // Use JWT strategy instead of database sessions for simplicity
    // This avoids the need for session storage but requires secure token handling
    strategy: 'jwt'
  },
  
  pages: {
    // Redirect to custom login page instead of NextAuth default
    signIn: '/login'
  },
  
  callbacks: {
    /**
     * JWT callback - Handles token creation and updates.
     * 
     * This callback is invoked whenever a JWT token is created, updated, or accessed.
     * It's responsible for persisting user data in the token and maintaining
     * OAuth provider tokens for potential API access.
     * 
     * @param token - The JWT token object
     * @param user - User object (only available during sign-in)
     * @param account - Account object from OAuth provider (only during sign-in)
     * @returns Modified token object
     */
    async jwt({ token, user, account }) {
      // Use token.sub as the stable subject identifier when no DB adapter is present
      if (user) {
        // Ensure we have a stable user ID for the session
        token.id = token.sub || user.id
        
        // Persist Google API tokens if available for future API access
        // This enables potential features like calendar integration or profile syncing
        if (account?.provider === 'google') {
          token.access_token = account.access_token
          token.refresh_token = account.refresh_token
          token.expires_at = account.expires_at
        }
      }
      return token
    },
    
    /**
     * Session callback - Shapes the session object returned to the client.
     * 
     * This callback is called whenever a session is checked. It determines
     * what session data is exposed to the client-side application.
     * We include the user ID to enable user-specific features like poll ownership.
     * 
     * @param session - The session object
     * @param token - The JWT token object
     * @returns Modified session object
     */
    async session({ session, token }) {
      if (session.user && token.id) {
        // Use the stable token.id (which is token.sub) without type assertion
        // This ID is consistent across sessions and can be used for data relationships
        session.user.id = token.id
      }
      return session
    }
  }
}
