import {InstancedBufferGeometry} from 'three/src/core/InstancedBufferGeometry';
import {InstancesCountSopNode} from '../../../../src/engine/nodes/sop/InstancesCount';

async function get_first_geo(instances_count_node: InstancesCountSopNode) {
	const container = await instances_count_node.request_container();
	const core_group = container.core_content()!;
	const objects = core_group.objects_with_geo();
	const first_object = objects[0];
	const first_geo = first_object.geometry as InstancedBufferGeometry;
	return first_geo;
}

QUnit.test('instances_count simple', async (assert) => {
	const geo1 = window.geo1;

	const plane1 = geo1.create_node('plane');
	const box1 = geo1.create_node('box');
	const instance1 = geo1.create_node('instance');
	const instances_count1 = geo1.create_node('instances_count');

	instance1.set_input(0, box1);
	instance1.set_input(1, plane1);
	instances_count1.set_input(0, instance1);

	let container = await instance1.request_container();
	assert.equal(container.core_content()!.points().length, 4);

	let first_geo = await get_first_geo(instances_count1);
	assert.equal(first_geo.instanceCount, Infinity);

	instances_count1.p.use_max.set(1);
	first_geo = await get_first_geo(instances_count1);
	assert.equal(first_geo.instanceCount, 1);

	instances_count1.p.max.set(3);
	first_geo = await get_first_geo(instances_count1);
	assert.equal(first_geo.instanceCount, 3);

	instances_count1.p.use_max.set(0);
	first_geo = await get_first_geo(instances_count1);
	assert.equal(first_geo.instanceCount, Infinity);
});
