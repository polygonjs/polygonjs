import {Mesh} from 'three';
// import {AttribClass} from '../../../../src/core/geometry/Constant';
import {CoreSleep} from '../../../../src/core/Sleep';
import {JsConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Js';
import {RendererUtils} from '../../../helpers/RendererUtils';

QUnit.test('js/lerp with vector2 inputs', async (assert) => {
	const scene = window.scene;
	const perspective_camera1 = window.perspective_camera1;

	const geo1 = scene.createNode('geo');
	const box1 = geo1.createNode('box');
	const actor1 = geo1.createNode('actor');

	actor1.setInput(0, box1);
	actor1.flags.display.set(true);

	const onManualTrigger1 = actor1.createNode('onManualTrigger');
	const setObjectPosition1 = actor1.createNode('setObjectPosition');
	const lerp = actor1.createNode('lerp');
	const constant1 = actor1.createNode('constant');
	const vec2ToVec3_1 = actor1.createNode('vec2ToVec3');

	constant1.setJsType(JsConnectionPointType.VECTOR2);
	constant1.p.vector2.set([1, 0]);

	setObjectPosition1.setInput(JsConnectionPointType.TRIGGER, onManualTrigger1);
	setObjectPosition1.setInput('position', vec2ToVec3_1);
	vec2ToVec3_1.setInput(JsConnectionPointType.VECTOR2, lerp);

	lerp.setInput(0, constant1);
	lerp.params.get('v1')!.set([0.5, 0.5]);
	lerp.params.get('alpha')!.set(0.5);

	const container = await actor1.compute();
	const object = container.coreContent()!.threejsObjects()[0] as Mesh;

	// wait to make sure objects are mounted to the scene
	await CoreSleep.sleep(150);

	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
		scene.play();
		assert.equal(scene.time(), 0);
		assert.equal(object.position.y, 0);
		await CoreSleep.sleep(500);
		assert.in_delta(scene.time(), 0.5, 0.25, 'time is 0.5 sec');
		assert.deepEqual(object.position.y, 0, 'object still at 0');

		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(100);
		assert.equal(object.position.y, 0.25, 'object moved');
	});
});

QUnit.test('js/lerp with vector3 inputs', async (assert) => {
	const scene = window.scene;
	const perspective_camera1 = window.perspective_camera1;

	const geo1 = scene.createNode('geo');
	const box1 = geo1.createNode('box');
	const actor1 = geo1.createNode('actor');

	actor1.setInput(0, box1);
	actor1.flags.display.set(true);

	const onManualTrigger1 = actor1.createNode('onManualTrigger');
	const setObjectPosition1 = actor1.createNode('setObjectPosition');
	const lerp = actor1.createNode('lerp');
	const constant1 = actor1.createNode('constant');

	constant1.setJsType(JsConnectionPointType.VECTOR3);
	constant1.p.vector3.set([1, 0, 0]);

	setObjectPosition1.setInput(JsConnectionPointType.TRIGGER, onManualTrigger1);
	setObjectPosition1.setInput('position', lerp);

	lerp.setInput(0, constant1);
	lerp.params.get('v1')!.set([0, 1, 0]);
	lerp.params.get('alpha')!.set(0.5);

	const container = await actor1.compute();
	const object = container.coreContent()!.threejsObjects()[0] as Mesh;

	// wait to make sure objects are mounted to the scene
	await CoreSleep.sleep(150);

	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
		scene.play();
		assert.equal(scene.time(), 0);
		assert.equal(object.position.y, 0);
		await CoreSleep.sleep(500);
		assert.in_delta(scene.time(), 0.5, 0.25, 'time is 0.5 sec');
		assert.equal(object.position.y, 0, 'object still at 0');

		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(100);
		assert.equal(object.position.x, 0.5, 'object moved ');
		assert.equal(object.position.y, 0.5, 'object moved ');
		assert.equal(object.position.z, 0, 'object moved ');
	});
});

QUnit.test('js/lerp with vector4 inputs', async (assert) => {
	const scene = window.scene;
	const perspective_camera1 = window.perspective_camera1;

	const geo1 = scene.createNode('geo');
	const box1 = geo1.createNode('box');
	const actor1 = geo1.createNode('actor');

	actor1.setInput(0, box1);
	actor1.flags.display.set(true);

	const onManualTrigger1 = actor1.createNode('onManualTrigger');
	const setObjectPosition1 = actor1.createNode('setObjectPosition');
	const lerp = actor1.createNode('lerp');
	const constant1 = actor1.createNode('constant');
	const vec4ToVec3_1 = actor1.createNode('vec4ToVec3');

	constant1.setJsType(JsConnectionPointType.VECTOR4);
	constant1.p.vector4.set([1, 0, 0, 0]);

	setObjectPosition1.setInput(JsConnectionPointType.TRIGGER, onManualTrigger1);
	setObjectPosition1.setInput('position', vec4ToVec3_1);
	vec4ToVec3_1.setInput(JsConnectionPointType.VECTOR4, lerp);

	lerp.setInput(0, constant1);
	lerp.params.get('v1')!.set([0, 1, 0, 0]);
	lerp.params.get('alpha')!.set(0.5);

	const container = await actor1.compute();
	const object = container.coreContent()!.threejsObjects()[0] as Mesh;

	// wait to make sure objects are mounted to the scene
	await CoreSleep.sleep(150);

	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
		scene.play();
		assert.equal(scene.time(), 0);
		assert.equal(object.position.y, 0);
		await CoreSleep.sleep(500);
		assert.in_delta(scene.time(), 0.5, 0.25, 'time is 0.5 sec');
		assert.equal(object.position.y, 0, 'object still at 0');

		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(100);
		assert.equal(object.position.x, 0.5, 'object moved ');
		assert.equal(object.position.y, 0.5, 'object moved ');
		assert.equal(object.position.z, 0, 'object moved ');
	});
});
