module.exports = {
  testEnvironment: 'node',
  setupFiles: ['dotenv/config'],
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/tests/'
  ],
  setupFilesAfterEnv: ['./tests/setup.js'],
  testEnvironment: 'node',
  globals: {
    'NODE_ENV': 'test'
  },
  verbose: true,
  moduleNameMapper: {
    '^@prisma/client$': '<rootDir>/node_modules/@prisma/client'
  }
}; 