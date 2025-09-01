import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create a test user
  const hashedPassword = await bcrypt.hash('password123', 12)
  
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
      password: hashedPassword,
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Test+User'
    }
  })

  // Create some sample polls
  const poll1 = await prisma.poll.create({
    data: {
      question: 'What is your favorite programming language?',
      description: 'Choose the language you enjoy working with the most',
      category: 'Technology',
      authorId: user.id,
      options: {
        create: [
          { text: 'JavaScript' },
          { text: 'Python' },
          { text: 'TypeScript' },
          { text: 'Rust' },
          { text: 'Go' }
        ]
      }
    }
  })

  const poll2 = await prisma.poll.create({
    data: {
      question: 'Which framework should we use for the next project?',
      description: 'Help us decide on the best framework for our team',
      category: 'Development',
      authorId: user.id,
      options: {
        create: [
          { text: 'React' },
          { text: 'Vue' },
          { text: 'Angular' },
          { text: 'Svelte' }
        ]
      }
    }
  })

  console.log('Seed data created successfully!')
  console.log('Test user:', user.email)
  console.log('Sample polls created:', poll1.id, poll2.id)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


