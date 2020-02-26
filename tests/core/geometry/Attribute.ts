import {CoreAttribute} from '../../../src/core/geometry/Attribute';
import '../../../tests/helpers/assertions';

QUnit.test('array to indexed array', (assert) => {
	const array = ['a', 'b', 'c', 'a', 'd', 'c'];
	const indexed_arrays = CoreAttribute.array_to_indexed_arrays(array);
	assert.equal(indexed_arrays['values'].join(','), 'a,b,c,d');
	assert.equal(indexed_arrays['indices'].join(','), '0,1,2,0,3,2');
});
