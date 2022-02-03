import {PolyNodeController, PolyNodeDefinition} from '../../../../src/engine/nodes/utils/poly/PolyNodeController';
import {NodeContext} from '../../../../src/engine/poly/NodeContext';
import {ParamType} from '../../../../src/engine/poly/ParamType';
import {Poly} from '../../../../src/engine/Poly';
import {GeoNodeChildrenMap} from '../../../../src/engine/poly/registers/nodes/Sop';

const definition: PolyNodeDefinition = {
	nodeContext: NodeContext.SOP,
	inputs: [0, 4],
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
const node_class = PolyNodeController.createNodeClass('poly_sop_test', NodeContext.SOP, definition);
if (node_class) {
	Poly.registerNode(node_class);
}

QUnit.test('poly sop simple', async (assert) => {
	const geo1 = window.geo1;
	const poly1 = geo1.createNode('poly_sop_test' as keyof GeoNodeChildrenMap);
	assert.equal(poly1.children().length, 4);
	assert.ok(poly1.params.has('id'));
	assert.equal(poly1.params.get('id')!.type(), ParamType.INTEGER);
	let container = await poly1.compute();
	const core_group = container.coreContent();
	const geometry = core_group?.objectsWithGeo()[0].geometry;
	assert.equal(geometry?.getAttribute('position').array.length, 72);
});
