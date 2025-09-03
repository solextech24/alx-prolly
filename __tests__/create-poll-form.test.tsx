import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'
import { CreatePollForm } from '@/components/forms/create-poll-form'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

// Mock fetch
global.fetch = jest.fn()

const mockRouter = {
  push: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  replace: jest.fn(),
}

describe('CreatePollForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(global.fetch as jest.Mock).mockClear()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  // HAPPY PATH TESTS
  describe('Happy Path', () => {
    it('should render all form fields correctly', () => {
      render(<CreatePollForm />)
      
      expect(screen.getByLabelText(/question/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/category/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/options/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /create poll/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /add option/i })).toBeInTheDocument()
    })

    it('should have default two option inputs', () => {
      render(<CreatePollForm />)
      
      const optionInputs = screen.getAllByPlaceholderText(/option \d+/i)
      expect(optionInputs).toHaveLength(2)
      expect(screen.getByPlaceholderText('Option 1')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Option 2')).toBeInTheDocument()
    })

    it('should successfully create a poll with valid data', async () => {
      const user = userEvent.setup()
      
      // Mock successful API response
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          poll: {
            id: 'poll-123',
            question: 'What is your favorite programming language?',
            options: ['JavaScript', 'Python']
          }
        })
      })

      render(<CreatePollForm />)
      
      // Fill out the form
      await user.type(screen.getByLabelText(/question/i), 'What is your favorite programming language?')
      await user.type(screen.getByLabelText(/description/i), 'Choose your preferred language')
      
      const optionInputs = screen.getAllByPlaceholderText(/option \d+/i)
      await user.type(optionInputs[0], 'JavaScript')
      await user.type(optionInputs[1], 'Python')
      
      // Submit the form
      await user.click(screen.getByRole('button', { name: /create poll/i }))
      
      // Verify API call
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/polls', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            question: 'What is your favorite programming language?',
            description: 'Choose your preferred language',
            options: ['JavaScript', 'Python'],
            category: 'General'
          }),
        })
      })
      
      // Check success message
      expect(screen.getByText(/poll created successfully/i)).toBeInTheDocument()
      
      // Check redirect after delay
      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/polls/poll-123')
      }, { timeout: 3000 })
    })

    it('should create poll with custom category', async () => {
      const user = userEvent.setup()
      
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          poll: { id: 'poll-123' }
        })
      })

      render(<CreatePollForm />)
      
      await user.type(screen.getByLabelText(/question/i), 'Best meeting time?')
      
      // Select Technology category
      await user.click(screen.getByRole('combobox'))
      await user.click(screen.getByRole('option', { name: 'Technology' }))
      
      const optionInputs = screen.getAllByPlaceholderText(/option \d+/i)
      await user.type(optionInputs[0], '9 AM')
      await user.type(optionInputs[1], '2 PM')
      
      await user.click(screen.getByRole('button', { name: /create poll/i }))
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/polls', expect.objectContaining({
          body: expect.stringContaining('"category":"Technology"')
        }))
      })
    })

    it('should add and remove options correctly', async () => {
      const user = userEvent.setup()
      render(<CreatePollForm />)
      
      // Initially should have 2 options
      expect(screen.getAllByPlaceholderText(/option \d+/i)).toHaveLength(2)
      
      // Add option
      await user.click(screen.getByRole('button', { name: /add option/i }))
      expect(screen.getAllByPlaceholderText(/option \d+/i)).toHaveLength(3)
      expect(screen.getByPlaceholderText('Option 3')).toBeInTheDocument()
      
      // Remove option (trash button should appear when > 2 options)
      const deleteButtons = screen.getAllByRole('button', { name: '' }) // trash icon buttons
      await user.click(deleteButtons[0])
      expect(screen.getAllByPlaceholderText(/option \d+/i)).toHaveLength(2)
    })

    it('should handle maximum options limit', async () => {
      const user = userEvent.setup()
      render(<CreatePollForm />)
      
      // Add options up to the limit (10)
      for (let i = 2; i < 10; i++) {
        await user.click(screen.getByRole('button', { name: /add option/i }))
      }
      
      expect(screen.getAllByPlaceholderText(/option \d+/i)).toHaveLength(10)
      
      // Add option button should be disabled
      expect(screen.getByRole('button', { name: /add option/i })).toBeDisabled()
    })
  })

  // EDGE CASES AND FAILURE TESTS
  describe('Edge Cases and Failures', () => {
    it('should show error when question is empty', async () => {
      const user = userEvent.setup()
      render(<CreatePollForm />)
      
      // Leave question empty, fill options
      const optionInputs = screen.getAllByPlaceholderText(/option \d+/i)
      await user.type(optionInputs[0], 'Option 1')
      await user.type(optionInputs[1], 'Option 2')
      
      await user.click(screen.getByRole('button', { name: /create poll/i }))
      
      expect(screen.getByText('Question is required')).toBeInTheDocument()
      expect(global.fetch).not.toHaveBeenCalled()
    })

    it('should show error when question is only whitespace', async () => {
      const user = userEvent.setup()
      render(<CreatePollForm />)
      
      await user.type(screen.getByLabelText(/question/i), '   ')
      
      const optionInputs = screen.getAllByPlaceholderText(/option \d+/i)
      await user.type(optionInputs[0], 'Option 1')
      await user.type(optionInputs[1], 'Option 2')
      
      await user.click(screen.getByRole('button', { name: /create poll/i }))
      
      expect(screen.getByText('Question is required')).toBeInTheDocument()
    })

    it('should show error when less than 2 valid options', async () => {
      const user = userEvent.setup()
      render(<CreatePollForm />)
      
      await user.type(screen.getByLabelText(/question/i), 'Test question?')
      
      // Only fill one option
      const optionInputs = screen.getAllByPlaceholderText(/option \d+/i)
      await user.type(optionInputs[0], 'Only option')
      // Leave second option empty
      
      await user.click(screen.getByRole('button', { name: /create poll/i }))
      
      expect(screen.getByText('At least 2 options are required')).toBeInTheDocument()
      expect(global.fetch).not.toHaveBeenCalled()
    })

    it('should filter out empty options when validating', async () => {
      const user = userEvent.setup()
      render(<CreatePollForm />)
      
      await user.type(screen.getByLabelText(/question/i), 'Test question?')
      
      // Add multiple options, some empty
      await user.click(screen.getByRole('button', { name: /add option/i }))
      await user.click(screen.getByRole('button', { name: /add option/i }))
      
      const optionInputs = screen.getAllByPlaceholderText(/option \d+/i)
      await user.type(optionInputs[0], 'Valid option 1')
      await user.type(optionInputs[1], 'Valid option 2')
      await user.type(optionInputs[2], '   ') // whitespace only
      // Leave 4th option empty
      
      await user.click(screen.getByRole('button', { name: /create poll/i }))
      
      // Should not show error since we have 2 valid options
      expect(screen.queryByText('At least 2 options are required')).not.toBeInTheDocument()
    })

    it('should handle API error responses', async () => {
      const user = userEvent.setup()
      
      // Mock API error response
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: 'Server error: Unable to create poll'
        })
      })

      render(<CreatePollForm />)
      
      await user.type(screen.getByLabelText(/question/i), 'Test question?')
      
      const optionInputs = screen.getAllByPlaceholderText(/option \d+/i)
      await user.type(optionInputs[0], 'Option 1')
      await user.type(optionInputs[1], 'Option 2')
      
      await user.click(screen.getByRole('button', { name: /create poll/i }))
      
      await waitFor(() => {
        expect(screen.getByText('Server error: Unable to create poll')).toBeInTheDocument()
      })
      
      expect(mockRouter.push).not.toHaveBeenCalled()
    })

    it('should handle network errors', async () => {
      const user = userEvent.setup()
      
      // Mock network error
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

      render(<CreatePollForm />)
      
      await user.type(screen.getByLabelText(/question/i), 'Test question?')
      
      const optionInputs = screen.getAllByPlaceholderText(/option \d+/i)
      await user.type(optionInputs[0], 'Option 1')
      await user.type(optionInputs[1], 'Option 2')
      
      await user.click(screen.getByRole('button', { name: /create poll/i }))
      
      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument()
      })
    })

    it('should handle API response without error message', async () => {
      const user = userEvent.setup()
      
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({}) // No error message
      })

      render(<CreatePollForm />)
      
      await user.type(screen.getByLabelText(/question/i), 'Test question?')
      
      const optionInputs = screen.getAllByPlaceholderText(/option \d+/i)
      await user.type(optionInputs[0], 'Option 1')
      await user.type(optionInputs[1], 'Option 2')
      
      await user.click(screen.getByRole('button', { name: /create poll/i }))
      
      await waitFor(() => {
        expect(screen.getByText('Failed to create poll')).toBeInTheDocument()
      })
    })

    it('should disable form during submission', async () => {
      const user = userEvent.setup()
      
      // Mock slow API response
      ;(global.fetch as jest.Mock).mockImplementationOnce(() => 
        new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: async () => ({ poll: { id: 'poll-123' } })
        }), 1000))
      )

      render(<CreatePollForm />)
      
      await user.type(screen.getByLabelText(/question/i), 'Test question?')
      
      const optionInputs = screen.getAllByPlaceholderText(/option \d+/i)
      await user.type(optionInputs[0], 'Option 1')
      await user.type(optionInputs[1], 'Option 2')
      
      const submitButton = screen.getByRole('button', { name: /create poll/i })
      await user.click(submitButton)
      
      // Form should be disabled during submission
      expect(submitButton).toBeDisabled()
      expect(screen.getByLabelText(/question/i)).toBeDisabled()
      expect(screen.getByRole('button', { name: /add option/i })).toBeDisabled()
      
      // Should show loading spinner
      expect(screen.getByRole('button', { name: /create poll/i })).toHaveTextContent('')
    })

    it('should not allow removing options when only 2 remain', () => {
      render(<CreatePollForm />)
      
      // With only 2 options, there should be no delete buttons
      const deleteButtons = screen.queryAllByRole('button', { name: '' })
      const trashButtons = deleteButtons.filter(button => 
        button.querySelector('svg') // trash icon
      )
      expect(trashButtons).toHaveLength(0)
    })

    it('should trim whitespace from form inputs', async () => {
      const user = userEvent.setup()
      
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ poll: { id: 'poll-123' } })
      })

      render(<CreatePollForm />)
      
      // Add whitespace to inputs
      await user.type(screen.getByLabelText(/question/i), '  What is your favorite color?  ')
      await user.type(screen.getByLabelText(/description/i), '  Choose your preferred color  ')
      
      const optionInputs = screen.getAllByPlaceholderText(/option \d+/i)
      await user.type(optionInputs[0], '  Red  ')
      await user.type(optionInputs[1], '  Blue  ')
      
      await user.click(screen.getByRole('button', { name: /create poll/i }))
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/polls', expect.objectContaining({
          body: JSON.stringify({
            question: 'What is your favorite color?',
            description: 'Choose your preferred color',
            options: ['Red', 'Blue'],
            category: 'General'
          })
        }))
      })
    })

    it('should handle empty description gracefully', async () => {
      const user = userEvent.setup()
      
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ poll: { id: 'poll-123' } })
      })

      render(<CreatePollForm />)
      
      await user.type(screen.getByLabelText(/question/i), 'Test question?')
      // Leave description empty
      
      const optionInputs = screen.getAllByPlaceholderText(/option \d+/i)
      await user.type(optionInputs[0], 'Option 1')
      await user.type(optionInputs[1], 'Option 2')
      
      await user.click(screen.getByRole('button', { name: /create poll/i }))
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/polls', expect.objectContaining({
          body: expect.stringContaining('"description":""')
        }))
      })
    })
  })

  // ACCESSIBILITY TESTS
  describe('Accessibility', () => {
    it('should have proper labels for all form inputs', () => {
      render(<CreatePollForm />)
      
      expect(screen.getByLabelText(/question/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/category/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/options/i)).toBeInTheDocument()
    })

    it('should have required indicators', () => {
      render(<CreatePollForm />)
      
      // Look for asterisks or required attributes
      const questionLabel = screen.getByText(/question/i)
      const optionsLabel = screen.getByText(/options/i)
      
      expect(questionLabel.textContent).toMatch(/\*/)
      expect(optionsLabel.textContent).toMatch(/\*/)
    })

    it('should show error messages in accessible way', async () => {
      const user = userEvent.setup()
      render(<CreatePollForm />)
      
      await user.click(screen.getByRole('button', { name: /create poll/i }))
      
      const errorMessage = screen.getByText('Question is required')
      expect(errorMessage).toBeInTheDocument()
      expect(errorMessage).toHaveAttribute('role', 'alert')
    })
  })
})
