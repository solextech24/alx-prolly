'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Icons } from '@/components/ui/icons'

export function CreatePollForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [options, setOptions] = useState(['', ''])

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

    // TODO: Implement poll creation logic
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Poll</CardTitle>
        <CardDescription>
          Design your poll with a question and multiple choice options
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit}>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="question">Poll Question</Label>
              <Textarea
                id="question"
                placeholder="What would you like to ask?"
                disabled={isLoading}
                required
                rows={3}
              />
            </div>
            
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Add more context about your poll..."
                disabled={isLoading}
                rows={2}
              />
            </div>

            <div className="flex flex-col space-y-1.5">
              <Label>Poll Options</Label>
              <div className="space-y-2">
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
                        size="sm"
                        onClick={() => removeOption(index)}
                        disabled={isLoading}
                      >
                        <Icons.x className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addOption}
                  disabled={isLoading}
                  className="w-fit"
                >
                  <Icons.plus className="mr-2 h-4 w-4" />
                  Add Option
                </Button>
              </div>
            </div>

            <Button disabled={isLoading} className="w-full">
              {isLoading && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Poll
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
