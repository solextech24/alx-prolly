'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Icons } from '@/components/ui/icons'
import { useSupabase } from '../providers/auth-provider'

export function LoginForm() {
  const { supabase } = useSupabase()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setIsLoading(true)
    setError('')

    console.log('Login form submitted') // Debug log

    const formData = new FormData(event.target as HTMLFormElement)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    console.log('Email:', email, 'Password:', password ? '***' : 'empty') // Debug log

    // Demo login - accept any email/password for testing
    // In production, this would use real authentication
    try {
      if (email && password) {
        console.log('Valid email and password, proceeding with demo login') // Debug log
        
        // Simulate a slight delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Store user info in localStorage for demo purposes
        const userData = {
          id: '1',
          email,
          name: email.split('@')[0], // Use email prefix as name
          avatar: null
        }
        
        console.log('Storing user data:', userData) // Debug log
        localStorage.setItem('demo-user', JSON.stringify(userData))
        
        console.log('Redirecting to dashboard') // Debug log
        // Redirect to dashboard
        router.push('/dashboard')
      } else {
        throw new Error('Please enter both email and password')
      }
    } catch (err) {
      console.error('Login error:', err) // Debug log
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setIsLoading(false)
    }

    // Original Supabase code (commented out for demo)
    /*
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setIsLoading(false)
    } else {
      router.push('/dashboard')
    }
    */
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>
          Enter your email and password to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit}>
          <div className="grid w-full items-center gap-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                disabled={isLoading}
                required
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                disabled={isLoading}
                required
              />
            </div>
            <Button disabled={isLoading}>
              {isLoading && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              Sign In
            </Button>
          </div>
        </form>
        <div className="mt-4 text-center text-sm">
          <a href="/register" className="text-primary hover:underline">
            Don't have an account? Sign up
          </a>
        </div>
      </CardContent>
    </Card>
  )
}
