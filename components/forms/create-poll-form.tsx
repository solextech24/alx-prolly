'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Icons } from '@/components/ui/icons'

        export function CreatePollForm() {
        const router = useRouter()
        const [isLoading, setIsLoading] = useState(false)
        const [options, setOptions] = useState(['', ''])
        const [error, setError] = useState('')
        const [success, setSuccess] = useState(false)

        const addOption = () => {
        setOptions([...options, ''])
        }

        const removeOption = (index: number) => {
        if (options.length > 2) {
        setOptions(options.filter((_, i) => i !== index))
        }
        }

        const updateOption = (index: number, value: string) => {
        const newOptions = [...options]
        newOptions[index] = value
        setOptions(newOptions)
        }

        async function onSubmit(event: React.FormEvent) {
        event.preventDefault()
        setIsLoading(true)
        setError('')
        setSuccess(false)

        const formData = new FormData(event.target as HTMLFormElement)
        const question = formData.get('question') as string
        const description = formData.get('description') as string
        const category = formData.get('category') as string

        // Filter out empty options
        const validOptions = options.filter(option => option.trim() !== '')

        // Validation
        if (!question.trim()) {
        setError('Question is required')
        setIsLoading(false)
        return
        }

        if (validOptions.length < 2) {
        setError('At least 2 options are required')
        setIsLoading(false)
        return
        }

        try {
        const response = await fetch('/api/polls', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                question: question.trim(),
                description: description.trim(),
                options: validOptions,
                category: category || 'General'
                }),
        })

        if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to create poll')
        }

        const data = await response.json()
        setSuccess(true)
        
        // Redirect to the new poll after a short delay
        setTimeout(() => {
                router.push(`/polls/${data.poll.id}`)
        }, 2000)

        } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create poll')
        } finally {
        setIsLoading(false)
        }
        }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Poll</CardTitle>
        <CardDescription>
          Create a poll to gather opinions from the community
        </CardDescription>
      </CardHeader>
      <CardContent>
        {success ? (
          <div className="text-center space-y-4">
            <div className="p-4 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
              Poll created successfully! Redirecting...
            </div>
            <Icons.checkCircle className="h-12 w-12 text-green-600 mx-auto" />
          </div>
        ) : (
          <form onSubmit={onSubmit}>
            <div className="grid w-full items-center gap-4">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                  {error}
                </div>
              )}
              
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="question">Question *</Label>
                <Input
                  id="question"
                  name="question"
                  type="text"
                  placeholder="What would you like to ask?"
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Provide additional context for your poll"
                  disabled={isLoading}
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="category">Category</Label>
                <Select name="category" disabled={isLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General">General</SelectItem>
                    <SelectItem value="Technology">Technology</SelectItem>
                    <SelectItem value="Development">Development</SelectItem>
                    <SelectItem value="Team">Team</SelectItem>
                    <SelectItem value="Business">Business</SelectItem>
                    <SelectItem value="Entertainment">Entertainment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col space-y-1.5">
                <Label>Options *</Label>
                {options.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder={`Option ${index + 1}`}
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      disabled={isLoading}
                      required
                    />
                    {options.length > 2 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeOption(index)}
                        disabled={isLoading}
                      >
                        <Icons.trash className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addOption}
                  disabled={isLoading || options.length >= 10}
                  className="w-fit"
                >
                  <Icons.plus className="mr-2 h-4 w-4" />
                  Add Option
                </Button>
              </div>

              <Button disabled={isLoading}>
                {isLoading && (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Poll
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
