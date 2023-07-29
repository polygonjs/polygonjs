import type {QUnit} from '../../../helpers/QUnit';
import {Mesh} from 'three';
import {CoreSleep} from '../../../../src/core/Sleep';
import {JsConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Js';
import {RendererUtils} from '../../../helpers/RendererUtils';
import {ActorSopNode} from '../../../../src/engine/nodes/sop/Actor';
import {CreateObjectsJsNodeInput} from '../../../../src/engine/nodes/js/CreateObjects';
export function testenginenodesjsGetGeometryNodeObjects(qUnit: QUnit) {

function _setupActor1(actorNode: ActorSopNode) {
	const onManualTrigger1 = actorNode.createNode('onManualTrigger');
	const getGeometryNodeObjects1 = actorNode.createNode('getGeometryNodeObjects');
	const getNode1 = actorNode.createNode('getNode');
	const createObjects1 = actorNode.createNode('createObjects');

	getGeometryNodeObjects1.setInput(JsConnectionPointType.TRIGGER, onManualTrigger1);
	getGeometryNodeObjects1.setInput(JsConnectionPointType.NODE, getNode1);
	createObjects1.setInput(JsConnectionPointType.TRIGGER, getGeometryNodeObjects1);
	createObjects1.setInput(
		CreateObjectsJsNodeInput.CHILD,
		getGeometryNodeObjects1,
		JsConnectionPointType.OBJECT_3D_ARRAY
	);

	return {onManualTrigger1, getNode1};
}
function _setupActor2(actorNode: ActorSopNode) {
	const onTick1 = actorNode.createNode('onTick');
	const setObjectPosition1 = actorNode.createNode('setObjectPosition');
	const floatToVec3_1 = actorNode.createNode('floatToVec3');

	setObjectPosition1.setInput(JsConnectionPointType.TRIGGER, onTick1);
	setObjectPosition1.setInput(setObjectPosition1.p.position.name(), floatToVec3_1);
	floatToVec3_1.setInput(0, onTick1, 'time');
}

qUnit.test('js/getGeometryNodeObjects simple', async (assert) => {
	const scene = window.scene;
	const perspective_camera1 = window.perspective_camera1;

	const geo1 = scene.createNode('geo');
	const box1 = geo1.createNode('box');
	const actor1 = geo1.createNode('actor');
	const sphere1 = geo1.createNode('sphere');
	const actor2 = geo1.createNode('actor');

	actor1.setInput(0, box1);
	actor1.flags.display.set(true);
	actor1.io.inputs.overrideClonedState(true);

	actor2.setInput(0, sphere1);

	const {onManualTrigger1, getNode1} = _setupActor1(actor1);
	_setupActor2(actor2);
	getNode1.p.Node.setNode(actor2);

	const container = await actor1.compute();
	const object = container.coreContent()!.threejsObjects()[0] as Mesh;

	// wait to make sure objects are mounted to the scene
	await CoreSleep.sleep(50);
	const parent = object.parent!;
	assert.ok(parent);
	assert.equal(object.children.length, 0, '0 children');

	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
		scene.play();
		assert.equal(scene.time(), 0);
		assert.equal(object.children.length, 0, '0 children');

		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(100);
		assert.equal(object.children.length, 1, '1 child');
		const child = object.children[0];
		assert.more_than(child.position.x, 0.1, 'new child has moved');
		assert.less_than(child.position.x, 0.2, 'new child has moved');

		await CoreSleep.sleep(100);
		assert.more_than(child.position.x, 0.2, 'new child has moved');
	});
});

}