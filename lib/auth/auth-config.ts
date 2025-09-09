import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

// Fail-fast helper for required environment variables
function env(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

export const authOptions: NextAuthOptions = {
  secret: env('NEXTAUTH_SECRET'),
  providers: [
    GoogleProvider({
      clientId: env('GOOGLE_CLIENT_ID'),
      clientSecret: env('GOOGLE_CLIENT_SECRET')
    })
  ],
  session: {
    strategy: 'jwt'
  },
  pages: {
    signIn: '/login'
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // Use token.sub as the stable subject identifier when no DB adapter is present
      if (user) {
        token.id = token.sub || user.id
        
        // Persist Google API tokens if available for future API access
        if (account?.provider === 'google') {
          token.access_token = account.access_token
          token.refresh_token = account.refresh_token
          token.expires_at = account.expires_at
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        // Use the stable token.id (which is token.sub) without type assertion
        session.user.id = token.id
      }
      return session
    }
  }
}
