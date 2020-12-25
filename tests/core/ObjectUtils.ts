import {ObjectUtils} from '../../src/core/ObjectUtils';
import '../../tests/helpers/assertions';

QUnit.test('ObjectUtils.merge', (assert) => {
	assert.deepEqual(ObjectUtils.merge({a: 1}, {b: 2}), {a: 1, b: 2});
});
QUnit.test('ObjectUtils.cloneDeep', (assert) => {
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
