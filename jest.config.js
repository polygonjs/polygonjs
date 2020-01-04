// if running in a browser is required: (from https://jestjs.io/docs/en/puppeteer)
// const merge = require('merge')
// const ts_preset = require('ts-jest/jest-preset')
// const puppeteer_preset = require('jest-puppeteer/jest-preset')

// module.exports = merge.recursive(ts_preset, puppeteer_preset, {
// 	testEnvironment: 'node',
// 	testMatch: ['**/tests/*/**/*.ts'],
// 	moduleNameMapper: {
// 		'^src/(.*)$': '<rootDir>/src/$1',
// 		'^modules/(.*)$': '<rootDir>/modules/$1',
// 		'^tests/(.*)$': '<rootDir>/tests/$1',
// 	},
// })
module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'jsdom',
	testMatch: ['**/tests/*/**/*.ts'],
	// testMatch: ['**/tests/index.ts'],
	moduleNameMapper: {
		'^src/(.*)$': '<rootDir>/src/$1',
		'^modules/(.*)$': '<rootDir>/modules/$1',
		'^tests/(.*)$': '<rootDir>/tests/$1',
	},
}
