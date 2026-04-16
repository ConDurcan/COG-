module.exports = {
  preset: 'jest-expo',
  roots: ['<rootDir>/Tests', '<rootDir>/app'],
  setupFilesAfterEnv: ['./jest.setup.js'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '\\.vscode/',
  ],
  moduleNameMapper: {
    '^../app/League$': '<rootDir>/app/League.tsx',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
};