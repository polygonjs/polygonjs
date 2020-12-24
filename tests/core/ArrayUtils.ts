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
