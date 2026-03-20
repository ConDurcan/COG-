module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  clearMocks: true,
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
};
