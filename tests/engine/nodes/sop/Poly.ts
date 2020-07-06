import {PolyNodeController, PolyNodeDefinition} from '../../../../src/engine/nodes/utils/poly/PolyNodeController';
import {NodeContext} from '../../../../src/engine/poly/NodeContext';
import {ParamType} from '../../../../src/engine/poly/ParamType';
import {Poly} from '../../../../src/engine/Poly';
import {GeoNodeChildrenMap} from '../../../../src/engine/poly/registers/nodes/Sop';

const definition: PolyNodeDefinition = {
	node_context: NodeContext.SOP,
	inputs: [0, 4],
	params: [
		{
			name: 'id',
			type: ParamType.INTEGER,
			init_value: 0,
			raw_input: 0,
		},
	],
	nodes: {
		subnet_input1: {
			type: 'subnet_input',
			flags: {display: true},
		},
		subnet_output1: {
			type: 'subnet_output',
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
const node_class = PolyNodeController.create_node_class('poly_sop_test', NodeContext.SOP, definition);
if (node_class) {
	Poly.instance().register_node(node_class);
}

QUnit.test('poly sop simple', async (assert) => {
	const geo1 = window.geo1;
	const poly1 = geo1.create_node('poly_sop_test' as keyof GeoNodeChildrenMap);
	assert.equal(poly1.children().length, 4);
	assert.ok(poly1.params.has('id'));
	assert.equal(poly1.params.get('id')!.type, ParamType.INTEGER);
	let container = await poly1.request_container();
	const core_group = container.core_content();
	const geometry = core_group?.objects_with_geo()[0].geometry;
	assert.equal(geometry?.getAttribute('position').array.length, 72);
});
