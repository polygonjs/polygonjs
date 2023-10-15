import type {QUnit} from '../../../helpers/QUnit';
import {InstancedBufferGeometry} from 'three';
import {InstanceSopNode} from '../../../../src/engine/nodes/sop/Instance';
import {CoreObjectType} from '../../../../src/core/geometry/ObjectContent';
import {CorePoint} from '../../../../src/core/geometry/entities/point/CorePoint';
import {NodeContext} from '../../../../src/engine/poly/NodeContext';
import {PolyNodeController} from '../../../../src/engine/nodes/utils/poly/PolyNodeController';
import {PolyNodeDefinition} from '../../../../src/engine/nodes/utils/poly/PolyNodeDefinition';
import {ParamType} from '../../../../src/engine/poly/ParamType';
import {NodePathParam} from '../../../../src/engine/params/NodePath';

const _points: CorePoint<CoreObjectType>[] = [];

function createMaterial() {
	const MAT = window.MAT;
	const meshBasicBuilder1 = MAT.createNode('meshBasicBuilder');
	const output1 = meshBasicBuilder1.createNode('output');
	const instance_transform1 = meshBasicBuilder1.createNode('instanceTransform');

	output1.setInput('position', instance_transform1, 'position');
	output1.setInput('normal', instance_transform1, 'normal');

	return {meshBasicBuilder1, output1};
}

export function createRequiredNodes(node: InstanceSopNode) {
	const {meshBasicBuilder1, output1} = createMaterial();

	node.p.material.set(meshBasicBuilder1.path());

	return {output1};
}

export function testenginenodessopInstance(qUnit: QUnit) {
	qUnit.test('sop/instance simple', async (assert) => {
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
		assert.equal(container.coreContent()!.points(_points).length, 4);
	});

	qUnit.test('sop/instance: 2 instance in parallel do not generate an infinite loop', async (assert) => {
		const geo1 = window.geo1;

		const POLY_NODE_DATA: PolyNodeDefinition = {
			metadata: {
				version: {
					editor: '1.5.9-1',
					polygonjs: '1.5.9',
				},
				createdAt: 1697377386197,
			},
			nodeContext: NodeContext.SOP,
			inputs: {
				simple: {min: 1, max: 1, names: ['']},
			},
			params: [
				{
					name: 'material',
					type: ParamType.NODE_PATH,
					rawInput: '../MAT/meshBasicBuilder_CLUE_INSTANCES',
					initValue: '',
					options: {},
				},
			],
			nodes: {
				subnetInput1: {
					type: 'subnetInput',
					flags: {
						display: true,
					},
				},
				instance1: {
					type: 'instance',
					params: {material: '`chsop("../material")`'},
					inputs: ['box1', 'subnetInput1'],
				},
				subnetOutput1: {type: 'subnetOutput', inputs: ['instance1']},
				box1: {type: 'box'},
			},
		};

		const nodeContext = NodeContext.SOP;
		const nodeType = 'instanceTest';
		PolyNodeController.createNodeClassAndRegister({
			node_context: nodeContext,
			node_type: nodeType,
			data: POLY_NODE_DATA,
		});

		const add1 = geo1.createNode('add');
		const instanceTest1 = geo1.createNode(nodeType as any);
		const instanceTest2 = geo1.createNode(nodeType as any);
		const merge1 = geo1.createNode('merge');
		const {meshBasicBuilder1} = createMaterial();

		instanceTest1.setInput(0, add1);
		instanceTest2.setInput(0, add1);
		merge1.setInput(0, instanceTest1);
		merge1.setInput(1, instanceTest2);

		(instanceTest1.params.get('material') as NodePathParam).setNode(meshBasicBuilder1);
		(instanceTest2.params.get('material') as NodePathParam).setNode(meshBasicBuilder1);

		const container = await merge1.compute();
		const coreGroup = container.coreContent()!;
		const objects = coreGroup.threejsObjectsWithGeo();
		assert.equal(objects.length, 2, '2 objects');
	});
}
