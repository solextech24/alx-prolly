import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import { CreatePollForm } from './create-poll-form'

// Mock Next.js router
jest.mock('next/navigation', () => ({
        useRouter: jest.fn(),
}))

// Mock fetch
global.fetch = jest.fn()

const mockPush = jest.fn()
const mockRouter = {
        push: mockPush,
}

describe('CreatePollForm onSubmit', () => {
        beforeEach(() => {
                jest.clearAllMocks()
                ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
                ;(global.fetch as jest.Mock).mockClear()
        })

        // Unit Test 1: Validation - empty question
        test('should show error when question is empty', async () => {
                render(<CreatePollForm />)
                
                const submitButton = screen.getByRole('button', { name: /create poll/i })
                fireEvent.click(submitButton)

                await waitFor(() => {
                        expect(screen.getByText('Question is required')).toBeInTheDocument()
                })
        })

        // Unit Test 2: Validation - insufficient options
        test('should show error when less than 2 valid options provided', async () => {
                render(<CreatePollForm />)
                
                const questionInput = screen.getByLabelText(/question/i)
                fireEvent.change(questionInput, { target: { value: 'Test question?' } })
                
                const optionInputs = screen.getAllByPlaceholderText(/option/i)
                fireEvent.change(optionInputs[0], { target: { value: 'Option 1' } })
                fireEvent.change(optionInputs[1], { target: { value: '' } })
                
                const submitButton = screen.getByRole('button', { name: /create poll/i })
                fireEvent.click(submitButton)

                await waitFor(() => {
                        expect(screen.getByText('At least 2 options are required')).toBeInTheDocument()
                })
        })

        // Integration Test: Successful poll creation and redirect
        test('should create poll successfully and redirect', async () => {
                const mockResponse = {
                        ok: true,
                        json: jest.fn().mockResolvedValue({
                                poll: { id: '123' }
                        })
                }
                ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

                // Mock setTimeout
                jest.useFakeTimers()

                render(<CreatePollForm />)
                
                const questionInput = screen.getByLabelText(/question/i)
                const descriptionInput = screen.getByLabelText(/description/i)
                const optionInputs = screen.getAllByPlaceholderText(/option/i)
                
                fireEvent.change(questionInput, { target: { value: 'What is your favorite color?' } })
                fireEvent.change(descriptionInput, { target: { value: 'Choose your preferred color' } })
                fireEvent.change(optionInputs[0], { target: { value: 'Red' } })
                fireEvent.change(optionInputs[1], { target: { value: 'Blue' } })
                
                const submitButton = screen.getByRole('button', { name: /create poll/i })
                fireEvent.click(submitButton)

                await waitFor(() => {
                        expect(global.fetch).toHaveBeenCalledWith('/api/polls', {
                                method: 'POST',
                                headers: {
                                        'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                        question: 'What is your favorite color?',
                                        description: 'Choose your preferred color',
                                        options: ['Red', 'Blue'],
                                        category: 'General'
                                }),
                        })
                })

                await waitFor(() => {
                        expect(screen.getByText('Poll created successfully! Redirecting...')).toBeInTheDocument()
                })

                // Fast-forward timers
                jest.advanceTimersByTime(2000)

                await waitFor(() => {
                        expect(mockPush).toHaveBeenCalledWith('/polls/123')
                })

                jest.useRealTimers()
        })
})