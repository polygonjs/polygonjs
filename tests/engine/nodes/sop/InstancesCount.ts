import {InstancedBufferGeometry} from 'three/src/core/InstancedBufferGeometry';
import {InstancesCountSopNode} from '../../../../src/engine/nodes/sop/InstancesCount';
import {create_required_nodes} from './Instance';

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

	const plane1 = geo1.createNode('plane');
	const box1 = geo1.createNode('box');
	const instance1 = geo1.createNode('instance');
	create_required_nodes(instance1);

	const instances_count1 = geo1.createNode('instancesCount');

	instance1.setInput(0, box1);
	instance1.setInput(1, plane1);
	instances_count1.setInput(0, instance1);

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
