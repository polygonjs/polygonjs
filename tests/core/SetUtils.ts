import type {QUnit} from '../helpers/QUnit';
import {setToArray, setUnion, setIntersection, setDifference, setXOR} from '../../src/core/SetUtils';
export function testcoreSetUtils(qUnit: QUnit) {
	const _numbersSet: Set<number> = new Set();
	const _strings: string[] = [];
	const _numbers: number[] = [];

	qUnit.test('SetUtils.setToArray', (assert) => {
		assert.deepEqual(setToArray(new Set([0, 1, 2, 3]), _numbers), [0, 1, 2, 3]);
		assert.deepEqual(setToArray(new Set(['a', 'b']), _strings), ['a', 'b']);
	});

	qUnit.test('SetUtils.setUnion', (assert) => {
		assert.deepEqual(
			setToArray(setUnion(new Set([0, 1, 2, 3]), new Set([3, 4, 5]), _numbersSet), _numbers),
			[0, 1, 2, 3, 4, 5]
		);
	});
	qUnit.test('SetUtils.setUnion', (assert) => {
		assert.deepEqual(
			setToArray(setUnion(new Set([0, 1, 2, 3]), new Set([3, 4, 5]), _numbersSet), _numbers),
			[0, 1, 2, 3, 4, 5]
		);
	});
	qUnit.test('SetUtils.setIntersection', (assert) => {
		assert.deepEqual(
			setToArray(setIntersection(new Set([0, 1, 2, 3]), new Set([3, 4, 5]), _numbersSet), _numbers),
			[3]
		);
	});
	qUnit.test('SetUtils.setDifference', (assert) => {
		assert.deepEqual(
			setToArray(setDifference(new Set([0, 1, 2, 3]), new Set([3, 4, 5]), _numbersSet), _numbers),
			[0, 1, 2]
		);
		assert.deepEqual(
			setToArray(setDifference(new Set([3, 4, 5]), new Set([0, 1, 2, 3]), _numbersSet), _numbers),
			[4, 5]
		);
	});
	qUnit.test('SetUtils.setDifference', (assert) => {
		assert.deepEqual(
			setToArray(setXOR(new Set([0, 1, 2, 3]), new Set([3, 4, 5]), _numbersSet), _numbers),
			[0, 1, 2, 4, 5]
		);
	});
}
