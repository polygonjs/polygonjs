import {BufferAttribute} from 'three';
import {PolyNodeController} from '../../../../src/engine/nodes/utils/poly/PolyNodeController';
import {PolyNodeDefinition} from '../../../../src/engine/nodes/utils/poly/PolyNodeDefinition';
import {NodeContext} from '../../../../src/engine/poly/NodeContext';
import {ParamType} from '../../../../src/engine/poly/ParamType';
import {GeoNodeChildrenMap} from '../../../../src/engine/poly/registers/nodes/Sop';

const data: PolyNodeDefinition = {
	metadata: {
		version: {
			polygonjs: '1',
		},
		createdAt: 1,
	},
	nodeContext: NodeContext.SOP,
	inputs: {simple: {min: 0, max: 4, names: []}},
	params: [
		{
			name: 'id',
			type: ParamType.INTEGER,
			initValue: 0,
			rawInput: 0,
		},
	],
	nodes: {
		subnetInput1: {
			type: 'subnetInput',
			flags: {display: true},
		},
		subnetOutput1: {
			type: 'subnetOutput',
			inputs: ['transform1'],
			flags: {display: false},
		},
		box1: {type: 'box', flags: {display: false}},
		transform1: {
			type: 'transform',
			params: {r: [0, '$F', 0]},
			inputs: ['box1'],
			flags: {display: false},
		},
	},
};
PolyNodeController.createNodeClassAndRegister({node_context: NodeContext.SOP, node_type: 'poly_sop_test', data});

QUnit.test('poly sop simple', async (assert) => {
	const geo1 = window.geo1;
	const poly1 = geo1.createNode('poly_sop_test' as keyof GeoNodeChildrenMap);
	assert.equal(poly1.children().length, 4);
	assert.ok(poly1.params.has('id'));
	assert.equal(poly1.params.get('id')!.type(), ParamType.INTEGER);
	let container = await poly1.compute();
	const core_group = container.coreContent();
	const geometry = core_group?.threejsObjectsWithGeo()[0].geometry;
	assert.equal((geometry?.getAttribute('position') as BufferAttribute).array.length, 72);
});
