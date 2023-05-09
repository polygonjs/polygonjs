import {Mesh} from 'three';
import {CoreSleep} from '../../../../src/core/Sleep';
import {TransformTargetType} from '../../../../src/core/Transform';
import {JsConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Js';
import {RendererUtils} from '../../../helpers/RendererUtils';

QUnit.test('js/GetObject', async (assert) => {
	const scene = window.scene;
	const perspective_camera1 = window.perspective_camera1;

	// geo2
	const geo2 = scene.createNode('geo');
	async function setupGeo2() {
		const box1 = geo2.createNode('box');
		const transform1 = geo2.createNode('transform');
		const objectProperties1 = geo2.createNode('objectProperties');

		transform1.setApplyOn(TransformTargetType.OBJECT);
		transform1.p.t.set([1, 0, 0]);

		transform1.setInput(0, box1);
		objectProperties1.setInput(0, transform1);
		objectProperties1.p.tname.set(1);
		objectProperties1.p.name.set('target');

		objectProperties1.flags.display.set(true);

		await objectProperties1.compute();
	}
	await setupGeo2();

	// geo1
	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');
	const actor1 = geo1.createNode('actor');

	actor1.setInput(0, box1);
	actor1.flags.display.set(true);

	const onManualTrigger1 = actor1.createNode('onManualTrigger');
	const setObjectPosition1 = actor1.createNode('setObjectPosition');
	const getObjectProperty1 = actor1.createNode('getObjectProperty');
	const getObject1 = actor1.createNode('getObject');
	const constant1 = actor1.createNode('constant');

	constant1.setJsType(JsConnectionPointType.STRING);
	constant1.p.string.set('*target');

	getObjectProperty1.setInput(0, getObject1);
	getObject1.setInput('mask', constant1);
	getObject1.p.getCurrentObject.set(0);

	setObjectPosition1.setInput(JsConnectionPointType.TRIGGER, onManualTrigger1);
	setObjectPosition1.setInput('position', getObjectProperty1, 'position');

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
		assert.equal(object.position.x, 0, 'object still at 0');

		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(100);
		assert.equal(object.position.x, 1, 'object moved to 1');
	});
});
