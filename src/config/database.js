const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/language_app?schema=public'
    }
  },
  log: ['query', 'info', 'warn', 'error']
});

module.exports = prisma; 