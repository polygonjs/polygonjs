import {ArrayUtils} from '../../src/core/ArrayUtils';
import '../../tests/helpers/assertions';

import lodash_range from 'lodash/range';

QUnit.test('ArrayUtils.min', (assert) => {
	assert.deepEqual(ArrayUtils.min([7, 3.1, 8, -1]), -1);
});
QUnit.test('ArrayUtils.max', (assert) => {
	assert.deepEqual(ArrayUtils.max([7, 3.1, 8, -1]), 8);
});
QUnit.test('ArrayUtils.sum', (assert) => {
	assert.equal(ArrayUtils.sum([7, 3, 8, -1]), 17);
});
QUnit.test('ArrayUtils.compact', (assert) => {
	assert.deepEqual(ArrayUtils.compact([7, null, undefined, 0, null, 3, 7]), [7, 0, 3, 7]);
});
QUnit.test('ArrayUtils.uniq', (assert) => {
	assert.deepEqual(ArrayUtils.uniq([7, 3, 7]), [7, 3]);
	assert.deepEqual(ArrayUtils.uniq(['7', '3', '7']), ['7', '3']);
});
QUnit.test('ArrayUtils.uniq preserves order', (assert) => {
	assert.deepEqual(ArrayUtils.uniq(['restP', 'pti', 'restN']), ['restP', 'pti', 'restN']);
	assert.deepEqual(ArrayUtils.uniq(['restP', 'restN', 'pti']), ['restP', 'restN', 'pti']);
	assert.deepEqual(ArrayUtils.uniq(['a', 'b', 'c', 'd', 'e']), ['a', 'b', 'c', 'd', 'e']);
	assert.deepEqual(ArrayUtils.uniq(['a', 'b', 'c', 'd', 'e', 'f', 'c']), ['a', 'b', 'c', 'd', 'e', 'f']);
});
QUnit.test('ArrayUtils.uniqWithoutPreservingOrder', (assert) => {
	assert.deepEqual(ArrayUtils.uniqWithoutPreservingOrder([7, 3, 7]), [7, 3]);
	assert.deepEqual(ArrayUtils.uniqWithoutPreservingOrder(['7', '3', '7']), ['7', '3']);
	assert.deepEqual(ArrayUtils.uniqWithoutPreservingOrder(['restP', 'pti', 'restN']), ['restP', 'pti', 'restN']);
	assert.deepEqual(ArrayUtils.uniqWithoutPreservingOrder(['restP', 'restN', 'pti']), ['restP', 'restN', 'pti']);
	assert.deepEqual(ArrayUtils.uniqWithoutPreservingOrder(['a', 'b', 'c', 'd', 'e']), ['a', 'b', 'c', 'd', 'e']);
	assert.deepEqual(ArrayUtils.uniqWithoutPreservingOrder(['a', 'b', 'c', 'd', 'e', 'f', 'c']), [
		'a',
		'b',
		'c',
		'd',
		'e',
		'f',
	]);
});
QUnit.test('ArrayUtils.chunk', (assert) => {
	assert.deepEqual(ArrayUtils.chunk([0, 1, 2, 3, 4, 5, 6], 2), [[0, 1], [2, 3], [4, 5], [6]]);
});
QUnit.test('ArrayUtils.union', (assert) => {
	assert.deepEqual(ArrayUtils.union([0, 1, 2], [2, 3, 4]), [0, 1, 2, 3, 4]);
});
QUnit.test('ArrayUtils.intersection', (assert) => {
	assert.deepEqual(ArrayUtils.intersection([0, 1, 2], [2, 3, 4]), [2]);
});
QUnit.test('ArrayUtils.difference', (assert) => {
	assert.deepEqual(ArrayUtils.difference([0, 1, 2], [2, 3, 4]), [0, 1, 3, 4]);
});
QUnit.test('ArrayUtils.isEqual', (assert) => {
	assert.deepEqual(ArrayUtils.isEqual([7, 3, 7], [7, 3, 7]), true);
	assert.deepEqual(ArrayUtils.isEqual([7, 3, 7], [7, 3, 7, 4]), false);
	assert.deepEqual(ArrayUtils.isEqual([7, 3, 7], [7, 2, 7]), false);
	assert.deepEqual(ArrayUtils.isEqual([7, 3, 7, 4], [7, 2, 7]), false);

	assert.deepEqual(ArrayUtils.isEqual(['7', '3', '7'], ['7', '3', '7']), true);
	assert.deepEqual(ArrayUtils.isEqual(['7', '3', '7', '4'], ['7', '2', '7']), false);
});
QUnit.test('ArrayUtils.sortBy', (assert) => {
	assert.deepEqual(
		ArrayUtils.sortBy([-5, -1, 3, 7], (e) => e * e),
		[-1, 3, -5, 7]
	);

	assert.deepEqual(
		ArrayUtils.sortBy([{a: 'tube'}, {a: 'box'}, {a: 'sphere'}], (e) => e.a),
		[{a: 'box'}, {a: 'sphere'}, {a: 'tube'}]
	);
});

QUnit.test('ArrayUtils.range', (assert) => {
	assert.deepEqual(lodash_range(5), [0, 1, 2, 3, 4]);
	assert.deepEqual(ArrayUtils.range(5), [0, 1, 2, 3, 4]);

	assert.deepEqual(lodash_range(1, 5), [1, 2, 3, 4]);
	assert.deepEqual(ArrayUtils.range(1, 5), [1, 2, 3, 4]);

	assert.deepEqual(lodash_range(1, 5, 2), [1, 3]);
	assert.deepEqual(ArrayUtils.range(1, 5, 2), [1, 3]);

	assert.deepEqual(lodash_range(7, 10), [7, 8, 9]);
	assert.deepEqual(ArrayUtils.range(7, 10), [7, 8, 9]);
});
