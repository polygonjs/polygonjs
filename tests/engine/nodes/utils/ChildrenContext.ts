import type {QUnit} from '../../../helpers/QUnit';
import {NodeContext} from '../../../../src/engine/poly/NodeContext';
export function testenginenodesutilsChildrenContext(qUnit: QUnit) {

qUnit.test('children_context grand_parent types are updated as nodes get added and removed', async (assert) => {
	const scene = window.scene;
	const root = scene.root();
	const geo1 = window.geo1;
	if (!root.childrenController) {
		return;
	}

	assert.ok(root.childrenController.hasChildrenAndGrandchildrenWithContext(NodeContext.OBJ));
	assert.ok(!root.childrenController.hasChildrenAndGrandchildrenWithContext(NodeContext.SOP));

	const box = geo1.createNode('box');
	assert.ok(root.childrenController.hasChildrenAndGrandchildrenWithContext(NodeContext.SOP));

	geo1.removeNode(box);
	assert.ok(!root.childrenController.hasChildrenAndGrandchildrenWithContext(NodeContext.SOP));
});
qUnit.test('deleting a node connects its input to its output', async (assert) => {
	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');
	const actor1 = geo1.createNode('actor');
	actor1.setInput(0, box1);

	const setObjectPosition1 = actor1.createNode('setObjectPosition');
	const debug1 = actor1.createNode('debug');
	const onTick1 = actor1.createNode('onTick');

	setObjectPosition1.setInput('lerp', debug1);
	debug1.setInput(0, onTick1, 1);

	actor1.removeNode(debug1);

	const connection = setObjectPosition1.io.connections.firstInputConnection()!;
	assert.ok(connection);
	assert.equal(connection.nodeSrc(), onTick1);
	assert.equal(connection.nodeDest(), setObjectPosition1);
	assert.equal(connection.outputIndex(), 1);
	assert.equal(connection.inputIndex(), 3);
});

}