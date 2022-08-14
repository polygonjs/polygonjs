import {PolyNodeController} from '../../../../src/engine/nodes/utils/poly/PolyNodeController';
import {PolyNodeDefinition} from '../../../../src/engine/nodes/utils/poly/PolyNodeDefinition';
import {NodeContext} from '../../../../src/engine/poly/NodeContext';
import {ParamType} from '../../../../src/engine/poly/ParamType';
import {ObjNodeChildrenMap} from '../../../../src/engine/poly/registers/nodes/Obj';

const data: PolyNodeDefinition = {
	metadata: {
		version: {
			polygonjs: '1',
		},
		createdAt: 1,
	},
	nodeContext: NodeContext.OBJ,
	params: [
		{
			name: 'id',
			type: ParamType.INTEGER,
			initValue: 0,
			rawInput: 0,
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
PolyNodeController.createNodeClassAndRegister({node_context: NodeContext.OBJ, node_type: 'poly_obj_test', data});

QUnit.test('poly obj simple', async (assert) => {
	const root = window.root;
	const poly1 = root.createNode('poly_obj_test' as keyof ObjNodeChildrenMap);
	assert.equal(poly1.children().length, 2);
	assert.ok(poly1.params.has('id'));
	assert.equal(poly1.params.get('id')!.type(), ParamType.INTEGER);
});

QUnit.skip('poly obj params are preserved in copy/paste', async (assert) => {});
