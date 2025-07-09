module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jest-environment-jsdom',

    transform: {
        '^.+\\.(ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
    },

    testMatch: [
        '<rootDir>/__tests__/**/*.test.ts',
        '<rootDir>/__tests__/**/*.test.tsx'
    ],

    moduleNameMapper: {
        '\\.(css|less|sass|scss|png|jpg|svg)$': 'identity-obj-proxy',
    },

    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
