// const {pathsToModuleNameMapper} = require('ts-jest/utils')
// const tsconfig = require('./tsconfig')
// console.log(
// 	tsconfig,
// 	pathsToModuleNameMapper(tsconfig.compilerOptions.paths, {
// 		prefix: '<rootDir>/',
// 	})
// )

module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	moduleNameMapper: {
		'^src/(.*)$': '<rootDir>/src/$1',
	},
}
