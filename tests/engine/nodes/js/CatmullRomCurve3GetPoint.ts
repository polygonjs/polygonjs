import type {QUnit} from '../../../helpers/QUnit';
import {Mesh} from 'three';
// import {AttribClass} from '../../../../src/core/geometry/Constant';
import {CoreSleep} from '../../../../src/core/Sleep';
import {JsConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Js';
import {RendererUtils} from '../../../helpers/RendererUtils';
export function testenginenodesjsCatmullRomCurve3GetPoint(qUnit: QUnit) {

qUnit.test('js/CatmullRomCurve3GetPoint simple', async (assert) => {
	const scene = window.scene;
	const perspective_camera1 = window.perspective_camera1;

	const geo1 = scene.createNode('geo');

	const add1 = geo1.createNode('add');
	const add2 = geo1.createNode('add');
	const add3 = geo1.createNode('add');
	const add4 = geo1.createNode('add');
	const merge1 = geo1.createNode('merge');
	const curveFromPoints1 = geo1.createNode('curveFromPoints');
	const objectProperties1 = geo1.createNode('objectProperties');

	add1.p.position.set([1, 1, 1]);
	add2.p.position.set([2, 2, 2]);
	add3.p.position.set([3, 3, 3]);
	add4.p.position.set([4, 4, 4]);

	merge1.setInput(0, add1);
	merge1.setInput(1, add2);
	merge1.setInput(2, add3);
	merge1.setInput(3, add4);
	merge1.setCompactMode(true);

	curveFromPoints1.setInput(0, merge1);
	objectProperties1.setInput(0, curveFromPoints1);

	objectProperties1.p.tname.set(true);
	objectProperties1.p.name.set('curveOwner');

	const actor1 = geo1.createNode('actor');

	actor1.setInput(0, objectProperties1);
	actor1.flags.display.set(true);
	actor1.io.inputs.overrideClonedState(true);

	const onManualTrigger1 = actor1.createNode('onManualTrigger');
	const setObjectPosition1 = actor1.createNode('setObjectPosition');
	const getObjectUserData1 = actor1.createNode('getObjectUserData');
	const catmullRomCurve3GetPoint1 = actor1.createNode('catmullRomCurve3GetPoint');

	setObjectPosition1.setInput(JsConnectionPointType.TRIGGER, onManualTrigger1);
	setObjectPosition1.setInput('position', catmullRomCurve3GetPoint1);
	catmullRomCurve3GetPoint1.setInput(0, getObjectUserData1);
	catmullRomCurve3GetPoint1.p.t.set(0);

	getObjectUserData1.setUserDataType(JsConnectionPointType.CATMULL_ROM_CURVE3);
	getObjectUserData1.p.name.set('path');

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
		assert.equal(object.position.y, 1, 'object moved');

		catmullRomCurve3GetPoint1.p.t.set(0.5);
		await CoreSleep.sleep(100);
		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(100);
		assert.equal(object.position.y, 2.5, 'object moved');
	});
});

}