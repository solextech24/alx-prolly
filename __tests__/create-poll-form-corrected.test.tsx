import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CreatePollForm } from '@/components/forms/create-poll-form'

// Mock Next.js router
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Mock fetch globally
global.fetch = jest.fn()

// Mock setTimeout to avoid actual delays in tests
jest.useFakeTimers()

describe('CreatePollForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ poll: { id: '123' } }),
    })
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  describe('Happy Path', () => {
    test('should render the form with all required fields', () => {
      render(<CreatePollForm />)
      
      expect(screen.getByLabelText(/question/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
      expect(screen.getByRole('combobox')).toBeInTheDocument() // Category select
      expect(screen.getByText(/options/i)).toBeInTheDocument() // Options label
      expect(screen.getByRole('button', { name: /create poll/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /add option/i })).toBeInTheDocument()
    })

    test('should have default two option inputs', () => {
      render(<CreatePollForm />)
      
      const optionInputs = screen.getAllByPlaceholderText(/option \d+/i)
      expect(optionInputs).toHaveLength(2)
      expect(optionInputs[0]).toHaveAttribute('placeholder', 'Option 1')
      expect(optionInputs[1]).toHaveAttribute('placeholder', 'Option 2')
    })

    test('should successfully create a poll with valid data', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      render(<CreatePollForm />)
      
      // Fill in form
      await user.type(screen.getByLabelText(/question/i), 'What is your favorite color?')
      await user.type(screen.getByLabelText(/description/i), 'Choose your preferred color')
      
      const optionInputs = screen.getAllByPlaceholderText(/option \d+/i)
      await user.type(optionInputs[0], 'Red')
      await user.type(optionInputs[1], 'Blue')
      
      // Select category
      await user.click(screen.getByRole('combobox'))
      await user.click(screen.getByRole('option', { name: 'General' }))
      
      // Submit form
      await user.click(screen.getByRole('button', { name: /create poll/i }))
      
      // Check that fetch was called with correct data
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/polls', expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: 'What is your favorite color?',
            description: 'Choose your preferred color',
            options: ['Red', 'Blue'],
            category: 'General'
          })
        }))
      })
      
      // Check success state
      expect(screen.getByText('Poll created successfully! Redirecting...')).toBeInTheDocument()
      
      // Fast-forward timers to trigger redirect
      jest.advanceTimersByTime(2000)
      expect(mockPush).toHaveBeenCalledWith('/polls/123')
    })

    test('should add options correctly', async () => {
      const user = userEvent.setup()
      render(<CreatePollForm />)
      
      // Should start with 2 options
      expect(screen.getAllByPlaceholderText(/option \d+/i)).toHaveLength(2)
      
      // Add an option
      await user.click(screen.getByRole('button', { name: /add option/i }))
      
      // Should now have 3 options
      expect(screen.getAllByPlaceholderText(/option \d+/i)).toHaveLength(3)
      expect(screen.getByPlaceholderText('Option 3')).toBeInTheDocument()
    })

    test('should handle maximum options limit', async () => {
      const user = userEvent.setup()
      render(<CreatePollForm />)
      
      // Add options up to limit (10)
      for (let i = 2; i < 10; i++) {
        await user.click(screen.getByRole('button', { name: /add option/i }))
      }
      
      // Should have 10 options
      expect(screen.getAllByPlaceholderText(/option \d+/i)).toHaveLength(10)
      
      // Add button should be disabled
      expect(screen.getByRole('button', { name: /add option/i })).toBeDisabled()
    })
  })

  describe('Edge Cases and Failures', () => {
    test('should show error when question is empty', async () => {
      const user = userEvent.setup()
      render(<CreatePollForm />)
      
      // Fill only options
      const optionInputs = screen.getAllByPlaceholderText(/option \d+/i)
      await user.type(optionInputs[0], 'Option 1')
      await user.type(optionInputs[1], 'Option 2')
      
      // Submit without question
      await user.click(screen.getByRole('button', { name: /create poll/i }))
      
      await waitFor(() => {
        expect(screen.getByText('Question is required')).toBeInTheDocument()
      })
      expect(global.fetch).not.toHaveBeenCalled()
    })

    test('should show error when question is only whitespace', async () => {
      const user = userEvent.setup()
      render(<CreatePollForm />)
      
      // Fill with whitespace question
      await user.type(screen.getByLabelText(/question/i), '   ')
      
      const optionInputs = screen.getAllByPlaceholderText(/option \d+/i)
      await user.type(optionInputs[0], 'Option 1')
      await user.type(optionInputs[1], 'Option 2')
      
      await user.click(screen.getByRole('button', { name: /create poll/i }))
      
      await waitFor(() => {
        expect(screen.getByText('Question is required')).toBeInTheDocument()
      })
      expect(global.fetch).not.toHaveBeenCalled()
    })

    test('should show error when less than 2 valid options', async () => {
      const user = userEvent.setup()
      render(<CreatePollForm />)
      
      await user.type(screen.getByLabelText(/question/i), 'Test question?')
      
      // Fill only one option
      const optionInputs = screen.getAllByPlaceholderText(/option \d+/i)
      await user.type(optionInputs[0], 'Only option')
      // Leave second option empty
      
      await user.click(screen.getByRole('button', { name: /create poll/i }))
      
      await waitFor(() => {
        expect(screen.getByText('At least 2 options are required')).toBeInTheDocument()
      })
      expect(global.fetch).not.toHaveBeenCalled()
    })

    test('should handle API error responses', async () => {
      const user = userEvent.setup()
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Server error occurred' }),
      })
      
      render(<CreatePollForm />)
      
      await user.type(screen.getByLabelText(/question/i), 'Test question?')
      const optionInputs = screen.getAllByPlaceholderText(/option \d+/i)
      await user.type(optionInputs[0], 'Option 1')
      await user.type(optionInputs[1], 'Option 2')
      
      await user.click(screen.getByRole('button', { name: /create poll/i }))
      
      await waitFor(() => {
        expect(screen.getByText('Server error occurred')).toBeInTheDocument()
      })
    })

    test('should handle network errors', async () => {
      const user = userEvent.setup()
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

    test('should handle API response without error message', async () => {
      const user = userEvent.setup()
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({}),
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

    test('should disable form during submission', async () => {
      const user = userEvent.setup()
      // Make fetch return a promise that resolves slowly
      ;(global.fetch as jest.Mock).mockImplementationOnce(() => 
        new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: () => Promise.resolve({ poll: { id: '123' } })
        }), 1000))
      )
      
      render(<CreatePollForm />)
      
      await user.type(screen.getByLabelText(/question/i), 'Test question?')
      const optionInputs = screen.getAllByPlaceholderText(/option \d+/i)
      await user.type(optionInputs[0], 'Option 1')
      await user.type(optionInputs[1], 'Option 2')
      
      await user.click(screen.getByRole('button', { name: /create poll/i }))
      
      // Check form elements are disabled
      expect(screen.getByLabelText(/question/i)).toBeDisabled()
      expect(screen.getByLabelText(/description/i)).toBeDisabled()
      expect(screen.getByRole('combobox')).toBeDisabled()
      expect(screen.getByRole('button', { name: /create poll/i })).toBeDisabled()
      
      // Wait for submission to complete
      await waitFor(() => {
        expect(screen.getByText('Poll created successfully! Redirecting...')).toBeInTheDocument()
      }, { timeout: 2000 })
    })

    test('should not allow removing options when only 2 remain', () => {
      render(<CreatePollForm />)
      
      // Should not show delete buttons when only 2 options
      expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument()
    })

    test('should show delete buttons when more than 2 options exist', async () => {
      const user = userEvent.setup()
      render(<CreatePollForm />)
      
      // Add a third option
      await user.click(screen.getByRole('button', { name: /add option/i }))
      
      // Now should show delete buttons (trash icons)
      const deleteButtons = screen.getAllByRole('button').filter(button => 
        button.querySelector('.lucide-trash')
      )
      expect(deleteButtons).toHaveLength(3) // One for each option
    })

    test('should NOT trim whitespace from inputs (actual behavior)', async () => {
      const user = userEvent.setup()
      render(<CreatePollForm />)
      
      await user.type(screen.getByLabelText(/question/i), 'What is your favorite color?')
      await user.type(screen.getByLabelText(/description/i), 'Choose your preferred color')
      
      const optionInputs = screen.getAllByPlaceholderText(/option \d+/i)
      await user.type(optionInputs[0], '  Red  ')
      await user.type(optionInputs[1], '  Blue  ')
      
      await user.click(screen.getByRole('combobox'))
      await user.click(screen.getByRole('option', { name: 'General' }))
      
      await user.click(screen.getByRole('button', { name: /create poll/i }))
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/polls', expect.objectContaining({
          body: JSON.stringify({
            question: 'What is your favorite color?',
            description: 'Choose your preferred color',
            options: ['  Red  ', '  Blue  '], // Whitespace preserved in options
            category: 'General'
          })
        }))
      })
    })

    test('should handle empty description gracefully', async () => {
      const user = userEvent.setup()
      render(<CreatePollForm />)
      
      await user.type(screen.getByLabelText(/question/i), 'Test question?')
      // Leave description empty
      
      const optionInputs = screen.getAllByPlaceholderText(/option \d+/i)
      await user.type(optionInputs[0], 'Option 1')
      await user.type(optionInputs[1], 'Option 2')
      
      await user.click(screen.getByRole('button', { name: /create poll/i }))
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/polls', expect.objectContaining({
          body: JSON.stringify({
            question: 'Test question?',
            description: '',
            options: ['Option 1', 'Option 2'],
            category: 'General' // Default category
          })
        }))
      })
    })

    test('should filter out completely empty options before submission', async () => {
      const user = userEvent.setup()
      render(<CreatePollForm />)
      
      await user.type(screen.getByLabelText(/question/i), 'Test question?')
      
      const optionInputs = screen.getAllByPlaceholderText(/option \d+/i)
      await user.type(optionInputs[0], 'Valid option 1')
      await user.type(optionInputs[1], 'Valid option 2')
      
      // Add more options with some empty
      await user.click(screen.getByRole('button', { name: /add option/i }))
      await user.click(screen.getByRole('button', { name: /add option/i }))
      
      // Fill third option but leave fourth empty
      const allOptionInputs = screen.getAllByPlaceholderText(/option \d+/i)
      await user.type(allOptionInputs[2], '') // Empty option
      await user.type(allOptionInputs[3], '   ') // Whitespace-only option
      
      await user.click(screen.getByRole('button', { name: /create poll/i }))
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/polls', expect.objectContaining({
          body: JSON.stringify({
            question: 'Test question?',
            description: '',
            options: ['Valid option 1', 'Valid option 2'], // Empty/whitespace options filtered
            category: 'General'
          })
        }))
      })
    })
  })

  describe('Accessibility', () => {
    test('should have proper labels for all form inputs', () => {
      render(<CreatePollForm />)
      
      expect(screen.getByLabelText(/question/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
      expect(screen.getByText(/category/i)).toBeInTheDocument() // Category has label text
      expect(screen.getByText(/options/i)).toBeInTheDocument() // Options has label text
    })

    test('should have required indicators', () => {
      render(<CreatePollForm />)
      
      expect(screen.getByText('Question *')).toBeInTheDocument()
      expect(screen.getByText('Options *')).toBeInTheDocument()
      expect(screen.getByText('Description (Optional)')).toBeInTheDocument()
    })

    test('should have proper button roles and labels', () => {
      render(<CreatePollForm />)
      
      expect(screen.getByRole('button', { name: /create poll/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /add option/i })).toBeInTheDocument()
      expect(screen.getByRole('combobox')).toBeInTheDocument() // Category select
    })

    test('should have proper form structure', () => {
      render(<CreatePollForm />)
      
      expect(screen.getByRole('form')).toBeInTheDocument()
      expect(screen.getByRole('textbox', { name: /question/i })).toBeInTheDocument()
      expect(screen.getByRole('textbox', { name: /description/i })).toBeInTheDocument()
    })
  })
})
