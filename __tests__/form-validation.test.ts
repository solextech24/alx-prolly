import { CreatePollData } from '@/lib/types'

// Form validation functions to test
export function validatePollForm(data: Partial<CreatePollData>): {
  isValid: boolean
  errors: Record<string, string>
} {
  const errors: Record<string, string> = {}
  
  // Validate question
  if (!data.question?.trim()) {
    errors.question = 'Question is required'
  } else if (data.question.trim().length < 10) {
    errors.question = 'Question must be at least 10 characters long'
  } else if (data.question.trim().length > 200) {
    errors.question = 'Question must be less than 200 characters'
  }
  
  // Validate description
  if (data.description && data.description.length > 500) {
    errors.description = 'Description must be less than 500 characters'
  }
  
  // Validate options
  if (!data.options || !Array.isArray(data.options)) {
    errors.options = 'Options are required'
  } else {
    const validOptions = data.options.filter(opt => opt?.trim())
    if (validOptions.length < 2) {
      errors.options = 'At least 2 options are required'
    } else if (validOptions.length > 10) {
      errors.options = 'Maximum 10 options allowed'
    } else {
      // Check for duplicate options
      const uniqueOptions = new Set(validOptions.map(opt => opt.trim().toLowerCase()))
      if (uniqueOptions.size !== validOptions.length) {
        errors.options = 'Duplicate options are not allowed'
      }
      
      // Check option length
      const invalidOptions = validOptions.filter(opt => opt.trim().length > 100)
      if (invalidOptions.length > 0) {
        errors.options = 'Each option must be less than 100 characters'
      }
    }
  }
  
  // Validate category
  if (data.category && data.category.length > 50) {
    errors.category = 'Category must be less than 50 characters'
  }
  
  // Validate expiration date
  if (data.expiresAt && data.expiresAt <= new Date()) {
    errors.expiresAt = 'Expiration date must be in the future'
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

export function sanitizePollData(data: Partial<CreatePollData>): Partial<CreatePollData> {
  return {
    question: data.question?.trim(),
    description: data.description?.trim() || undefined,
    options: data.options?.filter(opt => opt?.trim()).map(opt => opt.trim()) || [],
    category: data.category?.trim() || 'General',
    expiresAt: data.expiresAt
  }
}

// Tests
describe('Form Validation Functions', () => {
  describe('validatePollForm', () => {
    const validData: CreatePollData = {
      question: 'What is your favorite programming language?',
      description: 'Choose your preferred language',
      options: ['JavaScript', 'Python', 'TypeScript'],
      category: 'Technology'
    }

    describe('Question validation', () => {
      it('should pass with valid question', () => {
        const result = validatePollForm(validData)
        expect(result.isValid).toBe(true)
        expect(result.errors.question).toBeUndefined()
      })

      it('should fail when question is empty', () => {
        const data = { ...validData, question: '' }
        const result = validatePollForm(data)
        
        expect(result.isValid).toBe(false)
        expect(result.errors.question).toBe('Question is required')
      })

      it('should fail when question is only whitespace', () => {
        const data = { ...validData, question: '   ' }
        const result = validatePollForm(data)
        
        expect(result.isValid).toBe(false)
        expect(result.errors.question).toBe('Question is required')
      })

      it('should fail when question is too short', () => {
        const data = { ...validData, question: 'Short?' }
        const result = validatePollForm(data)
        
        expect(result.isValid).toBe(false)
        expect(result.errors.question).toBe('Question must be at least 10 characters long')
      })

      it('should fail when question is too long', () => {
        const data = { ...validData, question: 'A'.repeat(201) }
        const result = validatePollForm(data)
        
        expect(result.isValid).toBe(false)
        expect(result.errors.question).toBe('Question must be less than 200 characters')
      })

      it('should pass with minimum valid question length', () => {
        const data = { ...validData, question: 'Valid question?' }
        const result = validatePollForm(data)
        
        expect(result.isValid).toBe(true)
        expect(result.errors.question).toBeUndefined()
      })
    })

    describe('Description validation', () => {
      it('should pass with valid description', () => {
        const result = validatePollForm(validData)
        expect(result.isValid).toBe(true)
        expect(result.errors.description).toBeUndefined()
      })

      it('should pass with no description', () => {
        const data = { ...validData, description: undefined }
        const result = validatePollForm(data)
        
        expect(result.isValid).toBe(true)
        expect(result.errors.description).toBeUndefined()
      })

      it('should fail when description is too long', () => {
        const data = { ...validData, description: 'A'.repeat(501) }
        const result = validatePollForm(data)
        
        expect(result.isValid).toBe(false)
        expect(result.errors.description).toBe('Description must be less than 500 characters')
      })
    })

    describe('Options validation', () => {
      it('should pass with valid options', () => {
        const result = validatePollForm(validData)
        expect(result.isValid).toBe(true)
        expect(result.errors.options).toBeUndefined()
      })

      it('should fail when options is undefined', () => {
        const data = { ...validData, options: undefined }
        const result = validatePollForm(data)
        
        expect(result.isValid).toBe(false)
        expect(result.errors.options).toBe('Options are required')
      })

      it('should fail when options is not an array', () => {
        const data = { ...validData, options: 'not an array' as unknown as string[] }
        const result = validatePollForm(data)
        
        expect(result.isValid).toBe(false)
        expect(result.errors.options).toBe('Options are required')
      })

      it('should fail with only one valid option', () => {
        const data = { ...validData, options: ['Only one', '', '   '] }
        const result = validatePollForm(data)
        
        expect(result.isValid).toBe(false)
        expect(result.errors.options).toBe('At least 2 options are required')
      })

      it('should fail with too many options', () => {
        const data = { ...validData, options: Array(11).fill(0).map((_, i) => `Option ${i + 1}`) }
        const result = validatePollForm(data)
        
        expect(result.isValid).toBe(false)
        expect(result.errors.options).toBe('Maximum 10 options allowed')
      })

      it('should fail with duplicate options', () => {
        const data = { ...validData, options: ['Option 1', 'Option 2', 'Option 1'] }
        const result = validatePollForm(data)
        
        expect(result.isValid).toBe(false)
        expect(result.errors.options).toBe('Duplicate options are not allowed')
      })

      it('should fail with case-insensitive duplicate options', () => {
        const data = { ...validData, options: ['Option 1', 'OPTION 1', 'Option 2'] }
        const result = validatePollForm(data)
        
        expect(result.isValid).toBe(false)
        expect(result.errors.options).toBe('Duplicate options are not allowed')
      })

      it('should fail when option is too long', () => {
        const data = { ...validData, options: ['Short', 'A'.repeat(101)] }
        const result = validatePollForm(data)
        
        expect(result.isValid).toBe(false)
        expect(result.errors.options).toBe('Each option must be less than 100 characters')
      })

      it('should pass with exactly 2 options', () => {
        const data = { ...validData, options: ['Option 1', 'Option 2'] }
        const result = validatePollForm(data)
        
        expect(result.isValid).toBe(true)
        expect(result.errors.options).toBeUndefined()
      })

      it('should pass with exactly 10 options', () => {
        const data = { ...validData, options: Array(10).fill(0).map((_, i) => `Option ${i + 1}`) }
        const result = validatePollForm(data)
        
        expect(result.isValid).toBe(true)
        expect(result.errors.options).toBeUndefined()
      })
    })

    describe('Category validation', () => {
      it('should pass with valid category', () => {
        const result = validatePollForm(validData)
        expect(result.isValid).toBe(true)
        expect(result.errors.category).toBeUndefined()
      })

      it('should pass with no category', () => {
        const data = { ...validData, category: undefined }
        const result = validatePollForm(data)
        
        expect(result.isValid).toBe(true)
        expect(result.errors.category).toBeUndefined()
      })

      it('should fail when category is too long', () => {
        const data = { ...validData, category: 'A'.repeat(51) }
        const result = validatePollForm(data)
        
        expect(result.isValid).toBe(false)
        expect(result.errors.category).toBe('Category must be less than 50 characters')
      })
    })

    describe('Expiration date validation', () => {
      it('should pass with future expiration date', () => {
        const data = { ...validData, expiresAt: new Date(Date.now() + 86400000) } // tomorrow
        const result = validatePollForm(data)
        
        expect(result.isValid).toBe(true)
        expect(result.errors.expiresAt).toBeUndefined()
      })

      it('should pass with no expiration date', () => {
        const data = { ...validData, expiresAt: undefined }
        const result = validatePollForm(data)
        
        expect(result.isValid).toBe(true)
        expect(result.errors.expiresAt).toBeUndefined()
      })

      it('should fail with past expiration date', () => {
        const data = { ...validData, expiresAt: new Date(Date.now() - 86400000) } // yesterday
        const result = validatePollForm(data)
        
        expect(result.isValid).toBe(false)
        expect(result.errors.expiresAt).toBe('Expiration date must be in the future')
      })
    })

    describe('Multiple validation errors', () => {
      it('should return multiple errors when multiple fields are invalid', () => {
        const data = {
          question: 'Short',
          description: 'A'.repeat(501),
          options: ['Only one'],
          category: 'A'.repeat(51)
        }
        const result = validatePollForm(data)
        
        expect(result.isValid).toBe(false)
        expect(Object.keys(result.errors)).toHaveLength(4)
        expect(result.errors.question).toBeTruthy()
        expect(result.errors.description).toBeTruthy()
        expect(result.errors.options).toBeTruthy()
        expect(result.errors.category).toBeTruthy()
      })
    })
  })

  describe('sanitizePollData', () => {
    it('should trim whitespace from all string fields', () => {
      const data = {
        question: '  What is your favorite color?  ',
        description: '  Choose your preferred color  ',
        options: ['  Red  ', '  Blue  ', '  Green  '],
        category: '  Preferences  '
      }
      const sanitized = sanitizePollData(data)
      
      expect(sanitized.question).toBe('What is your favorite color?')
      expect(sanitized.description).toBe('Choose your preferred color')
      expect(sanitized.options).toEqual(['Red', 'Blue', 'Green'])
      expect(sanitized.category).toBe('Preferences')
    })

    it('should filter out empty options', () => {
      const data = {
        question: 'Test question',
        options: ['Valid option', '', '   ', 'Another valid option'].filter(Boolean)
      }
      const sanitized = sanitizePollData(data)
      
      expect(sanitized.options).toEqual(['Valid option', 'Another valid option'])
    })

    it('should set default category when empty', () => {
      const data = {
        question: 'Test question',
        options: ['Option 1', 'Option 2'],
        category: ''
      }
      const sanitized = sanitizePollData(data)
      
      expect(sanitized.category).toBe('General')
    })

    it('should set default category when undefined', () => {
      const data = {
        question: 'Test question',
        options: ['Option 1', 'Option 2']
      }
      const sanitized = sanitizePollData(data)
      
      expect(sanitized.category).toBe('General')
    })

    it('should remove empty description', () => {
      const data = {
        question: 'Test question',
        description: '',
        options: ['Option 1', 'Option 2']
      }
      const sanitized = sanitizePollData(data)
      
      expect(sanitized.description).toBeUndefined()
    })

    it('should preserve expiration date', () => {
      const expirationDate = new Date(Date.now() + 86400000)
      const data = {
        question: 'Test question',
        options: ['Option 1', 'Option 2'],
        expiresAt: expirationDate
      }
      const sanitized = sanitizePollData(data)
      
      expect(sanitized.expiresAt).toEqual(expirationDate)
    })

    it('should handle completely empty data', () => {
      const data = {}
      const sanitized = sanitizePollData(data)
      
      expect(sanitized.question).toBeUndefined()
      expect(sanitized.description).toBeUndefined()
      expect(sanitized.options).toEqual([])
      expect(sanitized.category).toBe('General')
      expect(sanitized.expiresAt).toBeUndefined()
    })
  })
})
