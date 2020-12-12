import {Vector3} from 'three/src/math/Vector3';

QUnit.test('face simple', async (assert) => {
	const geo1 = window.geo1;

	const sphere1 = geo1.createNode('sphere');
	sphere1.p.resolution.set([8, 6]);
	const face1 = geo1.createNode('face');
	face1.set_input(0, sphere1);
	face1.p.make_faces_unique.set(0);

	let container = await face1.request_container();
	assert.equal(container.points_count(), 63);

	face1.p.make_faces_unique.set(1);
	container = await face1.request_container();
	assert.equal(container.points_count(), 240);
	const bbox_size = new Vector3();
	assert.deepEqual(container.bounding_box().getSize(bbox_size).toArray(), [2, 2, 2]);

	face1.p.transform.set(1);
	face1.p.scale.set(2);
	container = await face1.request_container();
	assert.equal(container.points_count(), 240);
	assert.deepEqual(container.bounding_box().getSize(bbox_size).toArray(), [
		2.4536805152893066,
		2.2200846672058105,
		2.4536805152893066,
	]);
});
