/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',            // use ts-jest for .ts files
    testEnvironment: 'node',      // Node for backend
    roots: ['<rootDir>/__tests__'],
    transform: {
        '^.+\\.ts$': 'ts-jest',
    },
    moduleFileExtensions: ['ts', 'js', 'json', 'node']
};
