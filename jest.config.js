/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/backend-tests"],
  testMatch: ["**/*.spec.ts"],
  setupFiles: ["<rootDir>/backend-tests/jest.setup.ts"],
  moduleFileExtensions: ["ts", "js", "json", "mjs"],
  // @faker-js/faker@9+ ships ESM-only; allow Jest to transform it
  transformIgnorePatterns: ["node_modules/(?!@faker-js/faker/)"],
  transform: {
    "^.+\\.(t|j)sx?$": [
      "ts-jest",
      {
        diagnostics: { ignoreCodes: [151002] },
        tsconfig: { allowJs: true },
      },
    ],
  },
};
