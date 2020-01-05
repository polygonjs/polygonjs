import 'qunit'
// https://qunitjs.com/cookbook/#custom-assertions

declare global {
	// namespace QUnit {
	interface Assert {
		null: (num: number, message: string) => void
		not_null: (num: number, message: string) => void
		includes: (array: any[], element: any, message: string) => void
		in_delta: (
			val1: number,
			val2: number,
			max_delta: number,
			message: string
		) => void
		less_than: (val1: number, max_val: number, message: string) => void
		less_than_or_equal: (
			val1: number,
			max_val: number,
			message: string
		) => void
		more_than: (val1: number, max_val: number, message: string) => void
		more_than_or_equal: (
			val1: number,
			max_val: number,
			message: string
		) => void
	}
	// }
}
export {}
// import * as _ from 'lodash'

QUnit.assert.null = function(val1: number, message: string = 'NOT null') {
	const result = val1 == null
	const actual = val1
	const expected: boolean = null
	this.pushResult({result, actual, expected, message})
}
QUnit.assert.not_null = function(val1: number, message: string = 'IS null') {
	const result = val1 != null
	const actual = val1
	const expected = !null
	this.pushResult({result, actual, expected, message})
}

QUnit.assert.includes = function(
	array: any[],
	element: any,
	message: string = 'DOES NOT INCLUDE'
) {
	const result = array.includes(element)
	const actual = array
	const expected = [element]
	this.pushResult({result, actual, expected, message})
}

QUnit.assert.in_delta = function(
	val1: number,
	val2: number,
	max_delta: number = 0.001,
	message: string = 'NOT in delta'
) {
	// var actual = haystack.indexOf(needle) > -1;
	const delta = Math.abs(val1 - val2)
	const in_delta = delta < max_delta
	const result = in_delta
	const actual = delta
	const expected = max_delta
	this.pushResult({result, actual, expected, message})
}

QUnit.assert.less_than = function(
	val1: number,
	max_val: number,
	message: string = 'NOT less than'
) {
	const result = val1 < max_val
	const actual = val1
	const expected = max_val
	this.pushResult({result, actual, expected, message})
}
QUnit.assert.less_than_or_equal = function(
	val1: number,
	max_val: number,
	message: string = 'NOT less than'
) {
	const result = val1 <= max_val
	const actual = val1
	const expected = max_val
	this.pushResult({result, actual, expected, message})
}

QUnit.assert.more_than = function(
	val1: number,
	max_val: number,
	message: string = 'NOT more than'
) {
	const result = val1 > max_val
	const actual = val1
	const expected = max_val
	this.pushResult({result, actual, expected, message})
}
QUnit.assert.more_than_or_equal = function(
	val1: number,
	max_val: number,
	message: string = 'NOT more than'
) {
	const result = val1 >= max_val
	const actual = val1
	const expected = max_val
	this.pushResult({result, actual, expected, message})
}
