import type {QUnit} from '../helpers/QUnit';
import {objectMerge, objectCloneDeep} from '../../src/core/ObjectUtils';
export function testcoreObjectUtils(qUnit: QUnit) {
	qUnit.test('ObjectUtils.merge', (assert) => {
		assert.deepEqual(objectMerge({a: 1}, {b: 2}), {a: 1, b: 2});
	});
	qUnit.test('ObjectUtils.cloneDeep', (assert) => {
		const object0 = {
			a: 1,
			b: {
				c: 2,
				d: 3,
			},
		};
		const object1 = objectCloneDeep(object0) as any;
		object0.b.c = 12;
		assert.deepEqual(object1.b.c, 2);
	});
}
