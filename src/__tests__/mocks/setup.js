// Set test environment variables
process.env.NODE_ENV = "test";
process.env.NEXTAUTH_SECRET = "test-secret-for-jest";
process.env.ENCRYPTION_KEY = "test-encryption-key-32bytes!!";
