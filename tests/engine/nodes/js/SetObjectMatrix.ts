import {Mesh} from 'three';
import {CoreSleep} from '../../../../src/core/Sleep';
import {TransformTargetType} from '../../../../src/core/Transform';
import {JsConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Js';
import {RendererUtils} from '../../../helpers/RendererUtils';

QUnit.test('js/setObjectMatrix', async (assert) => {
	const scene = window.scene;
	const perspective_camera1 = window.perspective_camera1;
	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');
	const actor1 = geo1.createNode('actor');
	const box2 = geo1.createNode('box');
	const transform2 = geo1.createNode('transform');
	const objectProperties2 = geo1.createNode('objectProperties');
	const merge2 = geo1.createNode('merge');

	actor1.setInput(0, box1);
	merge2.setInput(0, actor1);
	merge2.setInput(1, objectProperties2);
	objectProperties2.setInput(0, transform2);
	transform2.setInput(0, box2);

	transform2.setApplyOn(TransformTargetType.OBJECT);
	transform2.p.t.set([3, 5, 7]);
	objectProperties2.p.tname.set(true);
	objectProperties2.p.name.set('matrixSource');

	merge2.flags.display.set(true);

	const onManualTrigget1 = actor1.createNode('onManualTrigger');
	const setObjectMatrix1 = actor1.createNode('setObjectMatrix');
	const getObject1 = actor1.createNode('getObject');
	const getObjectProperty1 = actor1.createNode('getObjectProperty');

	setObjectMatrix1.setInput(JsConnectionPointType.TRIGGER, onManualTrigget1);
	setObjectMatrix1.setInput(JsConnectionPointType.MATRIX4, getObjectProperty1, 'matrix');
	getObjectProperty1.setInput(JsConnectionPointType.OBJECT_3D, getObject1);
	getObject1.p.getCurrentObject.set(false);
	getObject1.p.mask.set('*/matrixSource');

	const container = await merge2.compute();
	const object = container.coreContent()!.threejsObjects()[0] as Mesh;

	// wait to make sure objects are mounted to the scene
	await CoreSleep.sleep(150);

	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
		assert.equal(object.position.y, 0);
		scene.play();
		assert.equal(scene.time(), 0);
		await CoreSleep.sleep(100);
		assert.equal(object.position.y, 0);

		onManualTrigget1.p.trigger.pressButton();
		await CoreSleep.sleep(100);
		assert.equal(object.position.x, 3);
		assert.equal(object.position.y, 5);
		assert.equal(object.position.z, 7);
	});
});
