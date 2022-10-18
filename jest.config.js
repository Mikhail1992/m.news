module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '.(ts|tsx)': 'ts-jest',
  },
  globals: {
    'ts-jest': {
      compiler: 'typescript',
    },
  },
  testMatch: ['**/*.test.ts', '**/*.spec.ts'],
  collectCoverageFrom: ['**/*.ts'],
  coverageDirectory: './coverage',
  coveragePathIgnorePatterns: ['/node_modules', '/build', '^(.*)\\.test\\.(.*)$', '/src/index.ts'],
};
