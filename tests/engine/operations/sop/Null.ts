import type {QUnit} from '../../../helpers/QUnit';
import {BaseSopNodeType} from '../../../../src/engine/nodes/sop/_Base';
import {saveAndLoadScene} from '../../../helpers/ImportHelper';
import {OperationsComposerSopNode} from '../../../../src/engine/nodes/sop/OperationsComposer';
import {Box3, Vector3} from 'three';
export function testengineoperationssopNull(qUnit: QUnit) {
const tmpBox = new Box3();
const tmpSize = new Vector3();

qUnit.test('operation/sop/null loads fine when node has overriden params', async (assert) => {
	const scene = window.scene;
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	const transform1 = geo1.createNode('transform');
	const transform2 = geo1.createNode('transform');

	transform1.setInput(0, box1);
	transform2.setInput(0, transform1);
	transform2.flags.display.set(true);

	transform1.p.t.y.set(0.5);
	transform2.p.r.x.set(45);

	transform1.flags.optimize.set(true);
	transform2.flags.optimize.set(true);

	async function bboxSizeY(node: BaseSopNodeType) {
		const container = await transform2.compute();
		container.coreContent()?.boundingBox(tmpBox);
		tmpBox.getSize(tmpSize);
		return tmpSize.y;
	}
	assert.in_delta(await bboxSizeY(transform2), 1.41, 0.1);

	await saveAndLoadScene(scene, async (scene2) => {
		const transform2b = scene2.node(transform2.path()) as OperationsComposerSopNode;
		assert.equal(transform2b.type(), 'operationsComposer');
		assert.equal(transform2b.outputOperationContainer()?.operationType(), 'transform');
		assert.in_delta(await bboxSizeY(transform2), 1.41, 0.1);
	});

	// and now we bypass it
	transform2.flags.bypass.set(true);

	await saveAndLoadScene(scene, async (scene2) => {
		const transform2b = scene2.node(transform2.path()) as OperationsComposerSopNode;
		assert.equal(transform2b.type(), 'operationsComposer');
		assert.equal(transform2b.outputOperationContainer()?.operationType(), 'null');
		assert.in_delta(await bboxSizeY(transform2), 1, 0.1);
	});
});

}