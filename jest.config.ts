import type { Config } from 'jest'
import nextJest from 'next/jest.js'
 
import { defaults } from "jest-config";
import { compilerOptions } from "./tsconfig.json";
import { pathsToModuleNameMapper } from "ts-jest";

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})
 
// Add any custom config to be passed to Jest
const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'node',
  // Add more setup options before each test is run
  setupFiles: ['<rootDir>/jest.setup.ts'],

  // Add TypeScript support
  preset: 'ts-jest',
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/' }),
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.jest.json',
    },
  },

  moduleFileExtensions: [...defaults.moduleFileExtensions, 'ts', 'tsx'],
  modulePaths: ['<rootDir>'],
}
 
// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(config)
