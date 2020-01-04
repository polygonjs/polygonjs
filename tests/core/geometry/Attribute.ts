import {CoreAttribute} from 'src/core/geometry/Attribute'
import {Assert} from 'tests/Assert'

test('array to indexed array', () => {
	const array = ['a', 'b', 'c', 'a', 'd', 'c']
	const indexed_arrays = CoreAttribute.array_to_indexed_arrays(array)
	Assert.equal(indexed_arrays['values'].join(','), 'a,b,c,d')
	Assert.equal(indexed_arrays['indices'].join(','), '0,1,2,0,3,2')
})
