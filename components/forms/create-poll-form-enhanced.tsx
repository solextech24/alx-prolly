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
import { Badge } from '@/components/ui/badge'

// Zod schema for form validation
import { z } from 'zod'

const pollSchema = z.object({
  question: z.string().min(1, 'Question is required').max(200, 'Question must be less than 200 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  category: z.string().min(1, 'Category is required'),
  options: z.array(z.string().min(1, 'Option cannot be empty')).min(2, 'At least 2 options are required').max(10, 'Maximum 10 options allowed')
})

type PollFormData = z.infer<typeof pollSchema>

const POLL_CATEGORIES = [
  'General',
  'Technology',
  'Development',
  'Team',
  'Business',
  'Entertainment',
  'Education',
  'Politics',
  'Sports',
  'Other'
] as const

export function CreatePollFormEnhanced() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [options, setOptions] = useState(['', ''])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState<Partial<PollFormData>>({
    question: '',
    description: '',
    category: '',
    options: ['', '']
  })

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, ''])
      setFormData(prev => ({
        ...prev,
        options: [...(prev.options || []), '']
      }))
    }
  }

  const removeOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index)
      setOptions(newOptions)
      setFormData(prev => ({
        ...prev,
        options: newOptions
      }))
      // Clear error for removed option
      const newErrors = { ...errors }
      delete newErrors[`option-${index}`]
      setErrors(newErrors)
    }
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
    setFormData(prev => ({
      ...prev,
      options: newOptions
    }))
    
    // Clear error for this option if it's now valid
    if (value.trim() && errors[`option-${index}`]) {
      const newErrors = { ...errors }
      delete newErrors[`option-${index}`]
      setErrors(newErrors)
    }
  }

  const handleInputChange = (field: keyof PollFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error for this field if it's now valid
    if (errors[field]) {
      const newErrors = { ...errors }
      delete newErrors[field]
      setErrors(newErrors)
    }
  }

  const validateForm = (): boolean => {
    try {
      pollSchema.parse({
        question: formData.question || '',
        description: formData.description || '',
        category: formData.category || '',
        options: options.filter(opt => opt.trim() !== '')
      })
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {}
        error.errors.forEach(err => {
          const field = err.path[0] as string
          if (field === 'options') {
            // Handle options validation
            options.forEach((opt, index) => {
              if (!opt.trim()) {
                newErrors[`option-${index}`] = 'Option cannot be empty'
              }
            })
          } else {
            newErrors[field] = err.message
          }
        })
        setErrors(newErrors)
      }
      return false
    }
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      const response = await fetch('/api/polls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: formData.question?.trim(),
          description: formData.description?.trim(),
          options: options.filter(option => option.trim() !== ''),
          category: formData.category || 'General'
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
      setErrors({ submit: err instanceof Error ? err.message : 'Failed to create poll' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icons.vote className="h-5 w-5" />
          Create New Poll
        </CardTitle>
        <CardDescription>
          Create a poll to gather opinions from the community. Make it engaging and clear!
        </CardDescription>
      </CardHeader>
      <CardContent>
        {success ? (
          <div className="text-center space-y-4">
            <div className="p-4 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center gap-2">
                <Icons.checkCircle className="h-4 w-4" />
                Poll created successfully! Redirecting...
              </div>
            </div>
            <Icons.checkCircle className="h-12 w-12 text-green-600 mx-auto" />
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-6">
            {errors.submit && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {errors.submit}
              </div>
            )}
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="question" className="flex items-center gap-2">
                  Question <Badge variant="destructive" className="text-xs">Required</Badge>
                </Label>
                <Input
                  id="question"
                  name="question"
                  type="text"
                  placeholder="What would you like to ask the community?"
                  value={formData.question || ''}
                  onChange={(e) => handleInputChange('question', e.target.value)}
                  disabled={isLoading}
                  className={errors.question ? 'border-red-500' : ''}
                />
                {errors.question && (
                  <p className="text-sm text-red-600">{errors.question}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description <span className="text-gray-500 text-sm">(Optional)</span></Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Provide additional context to help people understand your poll better"
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  disabled={isLoading}
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && (
                  <p className="text-sm text-red-600">{errors.description}</p>
                )}
                <p className="text-xs text-gray-500">
                  {formData.description?.length || 0}/500 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="flex items-center gap-2">
                  Category <Badge variant="destructive" className="text-xs">Required</Badge>
                </Label>
                <Select 
                  value={formData.category || ''} 
                  onValueChange={(value) => handleInputChange('category', value)}
                  disabled={isLoading}
                >
                  <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select a category for your poll" />
                  </SelectTrigger>
                  <SelectContent>
                    {POLL_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-red-600">{errors.category}</p>
                )}
              </div>

              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  Poll Options <Badge variant="destructive" className="text-xs">Required</Badge>
                  <span className="text-gray-500 text-sm">({options.filter(opt => opt.trim()).length}/10)</span>
                </Label>
                
                {options.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        placeholder={`Option ${index + 1}`}
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        disabled={isLoading}
                        className={errors[`option-${index}`] ? 'border-red-500' : ''}
                      />
                      {errors[`option-${index}`] && (
                        <p className="text-sm text-red-600 mt-1">{errors[`option-${index}`]}</p>
                      )}
                    </div>
                    {options.length > 2 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeOption(index)}
                        disabled={isLoading}
                        className="shrink-0"
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
                
                <p className="text-xs text-gray-500">
                  You need at least 2 options and can have up to 10 options.
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                type="submit" 
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading && (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Poll
              </Button>
              
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.back()}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
