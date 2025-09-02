'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Icons } from '@/components/ui/icons'
import type { Poll, BranchPoll, CreatePollData } from '@/lib/types'

const pollSchema = z.object({
  question: z.string().min(1, 'Question is required').max(200, 'Max 200 characters'),
  description: z.string().max(500, 'Max 500 characters').optional().or(z.literal('')),
  category: z.string().min(1, 'Category is required'),
  options: z.array(z.string().min(1, 'Option cannot be empty')).min(2, 'At least 2 options').max(10, 'Max 10 options')
})

type FormValues = z.infer<typeof pollSchema>

type EditPollFormProps = {
  poll: Poll | BranchPoll
  onSubmit: (payload: { id: string } & CreatePollData) => Promise<void>
  categories?: string[]
}

const DEFAULT_CATEGORIES = [
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
]

function isBranchPoll(p: Poll | BranchPoll): p is BranchPoll {
  return typeof (p as BranchPoll).author?.email === 'string' && typeof (p as any).updatedAt === 'undefined'
}

export function EditPollForm({ poll, onSubmit, categories = DEFAULT_CATEGORIES }: EditPollFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const initialOptionTexts = isBranchPoll(poll)
    ? (poll.options || []).map(o => o.text)
    : (poll.options || []).map(o => o.text)

  const form = useForm<FormValues>({
    resolver: zodResolver(pollSchema),
    defaultValues: {
      question: poll.question || '',
      description: (poll as any).description || '',
      category: poll.category || categories[0] || 'General',
      options: initialOptionTexts.length >= 2 ? initialOptionTexts : ['', '']
    }
  })

  const values = form.watch()

  const addOption = () => {
    const current = form.getValues('options')
    if (current.length < 10) form.setValue('options', [...current, ''])
  }

  const removeOption = (index: number) => {
    const current = form.getValues('options')
    if (current.length <= 2) return
    form.setValue('options', current.filter((_, i) => i !== index), { shouldValidate: true })
  }

  async function handleSubmit(values: FormValues) {
    setIsLoading(true)
    try {
      const payload: { id: string } & CreatePollData = {
        id: poll.id,
        question: values.question.trim(),
        description: values.description?.toString().trim() || undefined,
        options: values.options.map(o => o.trim()).filter(Boolean),
        category: values.category,
        // optional expiresAt not included in the edit form by default
      }

      await onSubmit(payload)
      router.refresh()
    } catch (err) {
      // surfacing error is left to parent via onSubmit or toast systems
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icons.list className="h-5 w-5" />
          Edit Poll
        </CardTitle>
        <CardDescription>Update the poll details and options</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="question">Question</Label>
              <Input id="question" {...form.register('question')} disabled={isLoading} />
              {form.formState.errors.question && (
                <p className="text-sm text-red-600">{form.formState.errors.question.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" {...form.register('description')} disabled={isLoading} />
              {form.formState.errors.description && (
                <p className="text-sm text-red-600">{form.formState.errors.description.message}</p>
              )}
              <p className="text-xs text-gray-500">{(values.description?.length || 0)}/500 characters</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={values.category}
                onValueChange={(val) => form.setValue('category', val, { shouldValidate: true })}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {(categories.length ? categories : DEFAULT_CATEGORIES).map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.category && (
                <p className="text-sm text-red-600">{form.formState.errors.category.message}</p>
              )}
            </div>

            <div className="space-y-3">
              <Label>Options</Label>
              {form.getValues('options').map((opt, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input
                    value={opt}
                    onChange={(e) => form.setValue(
                      'options',
                      form.getValues('options').map((v, i) => i === idx ? e.target.value : v),
                      { shouldValidate: true }
                    )}
                    disabled={isLoading}
                  />
                  {form.getValues('options').length > 2 && (
                    <Button type="button" variant="outline" size="icon" onClick={() => removeOption(idx)} disabled={isLoading}>
                      <Icons.trash className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addOption} disabled={isLoading || form.getValues('options').length >= 10} className="w-fit">
                <Icons.plus className="mr-2 h-4 w-4" />
                Add Option
              </Button>
              {form.formState.errors.options && (
                <p className="text-sm text-red-600">{form.formState.errors.options.message as string}</p>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
