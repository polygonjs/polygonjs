import {InstancedBufferGeometry} from 'three';
import {InstanceSopNode} from '../../../../src/engine/nodes/sop/Instance';

export function createRequiredNodes(node: InstanceSopNode) {
	const MAT = window.MAT;
	const mesh_mat = MAT.createNode('meshBasicBuilder');
	const output1 = mesh_mat.createNode('output');
	const instance_transform1 = mesh_mat.createNode('instanceTransform');

	output1.setInput('position', instance_transform1, 'position');
	output1.setInput('normal', instance_transform1, 'normal');

	node.p.material.set(mesh_mat.path());

	return {output1};
}

QUnit.test('instance simple', async (assert) => {
	const geo1 = window.geo1;

	const plane1 = geo1.createNode('plane');
	const box1 = geo1.createNode('box');
	const instance1 = geo1.createNode('instance');
	createRequiredNodes(instance1);

	instance1.setInput(0, box1);
	instance1.setInput(1, plane1);

	let container = await instance1.compute();
	const core_group = container.coreContent()!;
	const objects = core_group.threejsObjectsWithGeo();
	const first_object = objects[0];
	const first_geo = first_object.geometry as InstancedBufferGeometry;
	assert.equal(first_geo.instanceCount, Infinity);
	assert.equal(container.coreContent()!.points().length, 4);
});
