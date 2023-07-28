import {sortedNumber3} from '../../src/core/geometry/tet/utils/sortedIndices';
import {Number3} from '../../src/types/GlobalTypes';

let target: Number3 = [0, 0, 0];

function _sortedNumber3(x: number, y: number, z: number): Number3 {
	sortedNumber3(x, y, z, target);
	return target;
}

QUnit.test('sortedNumber3', (assert) => {
	assert.deepEqual(_sortedNumber3(0, 1, 2), [0, 1, 2]);
	assert.deepEqual(_sortedNumber3(0, 2, 1), [0, 1, 2]);
	assert.deepEqual(_sortedNumber3(2, 0, 1), [0, 1, 2]);
	assert.deepEqual(_sortedNumber3(2, 1, 0), [0, 1, 2]);
	assert.deepEqual(_sortedNumber3(1, 2, 0), [0, 1, 2]);
	assert.deepEqual(_sortedNumber3(1, 4, 0), [0, 1, 4]);
	assert.deepEqual(_sortedNumber3(2, 1, 3), [1, 2, 3]);
});
