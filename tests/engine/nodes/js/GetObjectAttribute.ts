import {Mesh} from 'three';
import {AttribClass} from '../../../../src/core/geometry/Constant';
import {CoreObject} from '../../../../src/core/geometry/Object';
import {CoreSleep} from '../../../../src/core/Sleep';
import {JsConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Js';
import {RendererUtils} from '../../../helpers/RendererUtils';

QUnit.test('js/GetObjectAttribute', async (assert) => {
	const scene = window.scene;
	const perspective_camera1 = window.perspective_camera1;
	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');
	const attributeCreate1 = geo1.createNode('attribCreate');
	const actor1 = geo1.createNode('actor');

	attributeCreate1.setAttribClass(AttribClass.OBJECT);
	attributeCreate1.p.name.set('height');

	attributeCreate1.setInput(0, box1);
	actor1.setInput(0, attributeCreate1);
	actor1.flags.display.set(true);

	const onTick1 = actor1.createNode('onTick');
	const setObjectPosition1 = actor1.createNode('setObjectPosition');
	const floatToVec3_1 = actor1.createNode('floatToVec3');
	const getObjectAttribute1 = actor1.createNode('getObjectAttribute');

	getObjectAttribute1.setAttribName('height');
	getObjectAttribute1.setAttribType(JsConnectionPointType.FLOAT);

	floatToVec3_1.setInput(1, getObjectAttribute1);

	setObjectPosition1.setInput(JsConnectionPointType.TRIGGER, onTick1);
	setObjectPosition1.setInput('position', floatToVec3_1);

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

		new CoreObject(object, 0).setAttribValue('height', 1);
		await CoreSleep.sleep(100);
		assert.equal(object.position.y, 1, 'object moved to 1');

		new CoreObject(object, 0).setAttribValue('height', 0.5);
		await CoreSleep.sleep(100);
		assert.equal(object.position.y, 0.5, 'object moved to 0.5');
	});
});
