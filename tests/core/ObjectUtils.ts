import type {QUnit} from '../helpers/QUnit';
import {ObjectUtils} from '../../src/core/ObjectUtils';
export function testcoreObjectUtils(qUnit: QUnit) {

qUnit.test('ObjectUtils.merge', (assert) => {
	assert.deepEqual(ObjectUtils.merge({a: 1}, {b: 2}), {a: 1, b: 2});
});
qUnit.test('ObjectUtils.cloneDeep', (assert) => {
	const object0 = {
		a: 1,
		b: {
			c: 2,
			d: 3,
		},
	};
	const object1 = ObjectUtils.cloneDeep(object0) as any;
	object0.b.c = 12;
	assert.deepEqual(object1.b.c, 2);
});

}