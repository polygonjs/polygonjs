import {Mesh} from 'three';
import {CoreSleep} from '../../../../src/core/Sleep';
import {TransformTargetType} from '../../../../src/core/Transform';
import {JsConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Js';
import {RendererUtils} from '../../../helpers/RendererUtils';

QUnit.test('js/object3DWorldToLocal', async (assert) => {
	const scene = window.scene;
	const perspective_camera1 = window.perspective_camera1;
	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');
	const transform1 = geo1.createNode('transform');
	const actor1 = geo1.createNode('actor');
	transform1.setInput(0, box1);
	actor1.setInput(0, transform1);
	actor1.flags.display.set(true);
	actor1.io.inputs.overrideClonedState(true);

	transform1.setApplyOn(TransformTargetType.OBJECT);
	transform1.p.t.set([1, 2, 3]);

	const onManualTrigger1 = actor1.createNode('onManualTrigger');
	const object3DWorldToLocal1 = actor1.createNode('object3DWorldToLocal');
	const setObjectPosition1 = actor1.createNode('setObjectPosition');
	const constant1 = actor1.createNode('constant');

	setObjectPosition1.setInput(JsConnectionPointType.TRIGGER, onManualTrigger1);
	setObjectPosition1.setInput('position', object3DWorldToLocal1);
	object3DWorldToLocal1.setInput(JsConnectionPointType.VECTOR3, constant1);

	constant1.setJsType(JsConnectionPointType.VECTOR3);
	constant1.p.vector3.set([6, 4, 2]);

	const container = await actor1.compute();
	const object = container.coreContent()!.threejsObjects()[0] as Mesh;

	// wait to make sure objects are mounted to the scene
	await CoreSleep.sleep(150);

	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
		scene.play();
		assert.equal(scene.time(), 0);
		assert.deepEqual(object.position.toArray(), [1, 2, 3]);

		await CoreSleep.sleep(100);
		assert.deepEqual(object.position.toArray(), [1, 2, 3]);

		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(100);
		assert.deepEqual(object.position.toArray(), [5, 2, -1]);

		object3DWorldToLocal1.setInput(JsConnectionPointType.VECTOR3, null);
		await CoreSleep.sleep(100);
		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(100);
		assert.deepEqual(object.position.toArray(), [-5, -2, 1]);

		object3DWorldToLocal1.p.Vector3.set([-1, -4, -12]);
		await CoreSleep.sleep(100);
		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(100);
		assert.deepEqual(object.position.toArray(), [4, -2, -13]);
	});
});
