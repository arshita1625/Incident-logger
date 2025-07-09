// frontend/jest.config.js
/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',                       // compile TS & TSX
    testEnvironment: 'jest-environment-jsdom',// browser globals

    // globs for where your tests live
    testMatch: [
        '<rootDir>/__tests__/**/*.test.ts',
        '<rootDir>/__tests__/**/*.test.tsx'
    ],

    // Transform any TS/TSX files via ts-jest
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
    },

    // Allow importing CSS/images in your components
    moduleNameMapper: {
        '\\.(css|less|sass|scss|png|jpg|svg)$': 'identity-obj-proxy',
    },

    // Register custom matchers (toBeInTheDocument, etc)
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

    // File extensions Jest will handle
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
