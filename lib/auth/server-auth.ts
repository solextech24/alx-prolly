import { getServerSession } from 'next-auth'
import { authOptions } from './auth-config'

interface ExtendedUser {
  id?: string
  name?: string | null
  email?: string | null
  image?: string | null
}

export async function getAuthenticatedUserId(): Promise<string | null> {
  try {
    const session = await getServerSession(authOptions)
    // Cast to our extended session type that includes id
    const user = session?.user as ExtendedUser
    return user?.id || null
  } catch (error) {
    console.error('Error getting authenticated user:', error)
    return null
  }
}
