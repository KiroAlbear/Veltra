/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@prisma/client$": "<rootDir>/src/__tests__/mocks/prisma-mock.js",
  },
  transform: {
    "^.+\\.tsx?$": ["ts-jest", {
      tsconfig: {
        jsx: "react-jsx",
        esModuleInterop: true,
        module: "commonjs",
        target: "es2017",
        paths: { "@/*": ["src/*"] },
      },
    }],
  },
  setupFiles: ["<rootDir>/src/__tests__/mocks/setup.js"],
  collectCoverageFrom: [
    "src/lib/**/*.ts",
    "!src/lib/**/*.d.ts",
    "!src/lib/db.ts",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov"],
};
