import React from 'react'
import '@testing-library/jest-dom'

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return React.createElement('img', props)
  },
}))

// Mock Next.js Link component
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, ...props }: any) => {
    return React.createElement('a', props, children)
  },
}))

// Setup global fetch mock
Object.defineProperty(window, 'fetch', {
  writable: true,
  value: jest.fn(),
})
