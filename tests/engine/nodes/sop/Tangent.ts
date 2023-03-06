import {BufferAttribute} from 'three';

QUnit.test('sop/tangent', async (assert) => {
	const geo1 = window.geo1;

	const line1 = geo1.createNode('line');
	const transform1 = geo1.createNode('transform');
	const tangent1 = geo1.createNode('tangent');

	transform1.setInput(0, line1);
	tangent1.setInput(0, transform1);
	transform1.p.r.x.set(45);

	let container = await tangent1.compute();
	let coreGroup = container.coreContent()!;
	const geo = coreGroup.threejsObjectsWithGeo()[0].geometry;
	assert.ok(geo.getAttribute('tangent'));
	assert.ok(geo.getAttribute('tangent'));
	let array = (geo.getAttribute('tangent') as BufferAttribute).array;
	assert.equal(array[0], 0);
	assert.in_delta(array[1], 0.707, 0.01);
	assert.in_delta(array[2], 0.707, 0.01);
	assert.equal(array[3], 0);
	assert.in_delta(array[4], 0.707, 0.01);
	assert.in_delta(array[5], 0.707, 0.01);
});
