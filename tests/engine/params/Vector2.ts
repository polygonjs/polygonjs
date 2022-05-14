import {Vector2} from 'three';

QUnit.test('params/vector2 accepts a vector', async (assert) => {
	const geo1 = window.geo1;
	const plane1 = geo1.createNode('plane');

	const segments = plane1.p.segments;
	segments.set(new Vector2(1, 2));
	assert.deepEqual(segments.value.toArray(), [1, 2]);
});
