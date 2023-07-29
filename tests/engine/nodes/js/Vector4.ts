import type {QUnit} from '../../../helpers/QUnit';
import {Mesh} from 'three';
import {CoreSleep} from '../../../../src/core/Sleep';
import {JsConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Js';
import {RendererUtils} from '../../../helpers/RendererUtils';
export function testenginenodesjsVector4(qUnit: QUnit) {

qUnit.test('js/Vector4', async (assert) => {
	const scene = window.scene;
	const perspective_camera1 = window.perspective_camera1;
	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');
	const actor1 = geo1.createNode('actor');

	actor1.setInput(0, box1);
	actor1.flags.display.set(true);

	const onManualTrigger1 = actor1.createNode('onManualTrigger');
	const setObjectPosition1 = actor1.createNode('setObjectPosition');
	const vector4_1 = actor1.createNode('vector4');

	const vec4ToVec3_1 = actor1.createNode('vec4ToVec3');

	setObjectPosition1.setInput(JsConnectionPointType.TRIGGER, onManualTrigger1);
	setObjectPosition1.setInput('position', vec4ToVec3_1);
	vec4ToVec3_1.setInput(0, vector4_1);

	// vector4_1.setJsType(JsConnectionPointType.VECTOR4);
	vector4_1.p.Vector4.set([1, 2, 3, 4]);

	const container = await actor1.compute();
	const object = container.coreContent()!.threejsObjects()[0] as Mesh;

	// wait to make sure objects are mounted to the scene
	await CoreSleep.sleep(150);

	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
		assert.equal(object.position.y, 0);
		scene.play();
		assert.equal(scene.time(), 0);
		assert.deepEqual(object.position.toArray(), [0, 0, 0]);

		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(200);
		assert.deepEqual(object.position.toArray(), [1, 2, 3]);
	});
});

}