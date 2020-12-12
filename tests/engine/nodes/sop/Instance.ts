import {InstancedBufferGeometry} from 'three/src/core/InstancedBufferGeometry';
import {InstanceSopNode} from '../../../../src/engine/nodes/sop/Instance';

export function create_required_nodes(node: InstanceSopNode) {
	const MAT = window.MAT;
	const mesh_mat = MAT.createNode('mesh_basic_builder');
	const output1 = mesh_mat.createNode('output');
	const instance_transform1 = mesh_mat.createNode('instance_transform');

	output1.set_input('position', instance_transform1, 'position');
	output1.set_input('normal', instance_transform1, 'normal');

	node.p.material.set(mesh_mat.full_path());

	return {output1};
}

QUnit.test('instance simple', async (assert) => {
	const geo1 = window.geo1;

	const plane1 = geo1.createNode('plane');
	const box1 = geo1.createNode('box');
	const instance1 = geo1.createNode('instance');
	create_required_nodes(instance1);

	instance1.set_input(0, box1);
	instance1.set_input(1, plane1);

	let container = await instance1.request_container();
	const core_group = container.core_content()!;
	const objects = core_group.objects_with_geo();
	const first_object = objects[0];
	const first_geo = first_object.geometry as InstancedBufferGeometry;
	assert.equal(first_geo.instanceCount, Infinity);
	assert.equal(container.core_content()!.points().length, 4);
});
