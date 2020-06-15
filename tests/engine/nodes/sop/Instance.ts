import {InstancedBufferGeometry} from 'three/src/core/InstancedBufferGeometry';

QUnit.test('instance simple', async (assert) => {
	const geo1 = window.geo1;

	const plane1 = geo1.create_node('plane');
	const box1 = geo1.create_node('box');
	const instance1 = geo1.create_node('instance');

	instance1.set_input(0, box1);
	instance1.set_input(1, plane1);

	let container = await instance1.request_container();
	const core_group = container.core_content()!;
	const objects = core_group.objects();
	const first_object = objects[0];
	const first_geo = first_object.geometry as InstancedBufferGeometry;
	assert.equal(first_geo.instanceCount, Infinity);
	assert.equal(container.core_content()!.points().length, 4);
});
