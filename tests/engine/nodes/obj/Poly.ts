import {PolyNodeController, PolyNodeDefinition} from '../../../../src/engine/nodes/utils/poly/PolyNodeController';
import {NodeContext} from '../../../../src/engine/poly/NodeContext';
import {ParamType} from '../../../../src/engine/poly/ParamType';
import {Poly} from '../../../../src/engine/Poly';
import {ObjNodeChildrenMap} from '../../../../src/engine/poly/registers/nodes/Obj';

const definition: PolyNodeDefinition = {
	nodeContext: NodeContext.OBJ,
	params: [
		{
			name: 'id',
			type: ParamType.INTEGER,
			init_value: 0,
			raw_input: 0,
		},
	],
	nodes: {
		box1: {type: 'box', flags: {display: false}},
		transform1: {
			type: 'transform',
			params: {r: [0, '$F', 0]},
			inputs: ['box1'],
			flags: {display: false},
		},
	},
};
const node_class = PolyNodeController.createNodeClass('poly_obj_test', NodeContext.OBJ, definition);
if (node_class) {
	Poly.registerNode(node_class);
}

QUnit.test('poly obj simple', async (assert) => {
	const root = window.root;
	const poly1 = root.createNode('poly_obj_test' as keyof ObjNodeChildrenMap);
	console.log(poly1, poly1.type(), poly1.nodeContext());
	assert.equal(poly1.children().length, 2);
	assert.ok(poly1.params.has('id'));
	assert.equal(poly1.params.get('id')!.type(), ParamType.INTEGER);
});

QUnit.skip('poly obj params are preserved in copy/paste', async (assert) => {});
