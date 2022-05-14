import {Vector4} from 'three';

QUnit.test('params/vector4 accepts a vector', async (assert) => {
	const geo1 = window.geo1;
	const attribCreate1 = geo1.createNode('attribCreate');

	const value4 = attribCreate1.p.value4;
	value4.set(new Vector4(1, 2, 3, 5));
	assert.deepEqual(value4.value.toArray(), [1, 2, 3, 5]);
});
