import '@testing-library/jest-dom'
import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Extends Vitest's expect method with methods from react-testing-library
expect.extend({})

// Runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup()
})

// Mock environment variables for testing
process.env.NEXTAUTH_URL = 'http://localhost:9999'
process.env.NEXTAUTH_SECRET = 'test-secret'
process.env.DATABASE_HOST = 'localhost'
process.env.DATABASE_USER = 'test'
process.env.DATABASE_PASSWORD = 'test'
process.env.DATABASE_NAME = 'test'
process.env.DATABASE_PORT = '3306'