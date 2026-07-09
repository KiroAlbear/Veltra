// Mock PrismaClient for tests — avoids needing a real database
class MockPrismaClient {
  constructor() {}
  $queryRaw() { return Promise.resolve([]); }
  $connect() { return Promise.resolve(); }
  $disconnect() { return Promise.resolve(); }
  patient = { findMany: () => [], findUnique: () => null, create: () => ({}), update: () => ({}), delete: () => ({}) };
  user = { findMany: () => [], findUnique: () => null, create: () => ({}), update: () => ({}) };
  appointment = { findMany: () => [], create: () => ({}), update: () => ({}) };
  auditLog = { findMany: () => [], create: () => ({}) };
  tenant = { upsert: () => ({}) };
  location = { upsert: () => ({}) };
}

module.exports = { PrismaClient: MockPrismaClient };
