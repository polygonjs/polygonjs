import {CoreSleep} from '../../../../src/core/Sleep';
import {ActorConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Actor';
import {RendererUtils} from '../../../helpers/RendererUtils';

QUnit.test('actor/GetObjectChild', async (assert) => {
	const scene = window.scene;
	const perspective_camera1 = window.perspective_camera1;
	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');
	const box2 = geo1.createNode('box');
	const objectProperties1 = geo1.createNode('objectProperties');
	const objectProperties2 = geo1.createNode('objectProperties');
	const merge1 = geo1.createNode('merge');
	const hierarchy1 = geo1.createNode('hierarchy');
	const actor1 = geo1.createNode('actor');

	actor1.setInput(0, hierarchy1);
	hierarchy1.setInput(0, merge1);
	merge1.setInput(0, objectProperties1);
	merge1.setInput(1, objectProperties2);
	objectProperties1.setInput(0, box1);
	objectProperties2.setInput(0, box2);

	merge1.setCompactMode(false);
	objectProperties1.p.tname.set(true);
	objectProperties2.p.tname.set(true);
	objectProperties1.p.name.set('box1');
	objectProperties2.p.name.set('box2');

	actor1.flags.display.set(true);

	const onManualTrigger1 = actor1.createNode('onManualTrigger');
	const setObjectVisible1 = actor1.createNode('setObjectVisible');
	const getObjectChild1 = actor1.createNode('getObjectChild');

	setObjectVisible1.setInput(ActorConnectionPointType.TRIGGER, onManualTrigger1);
	setObjectVisible1.setInput(ActorConnectionPointType.OBJECT_3D, getObjectChild1);
	getObjectChild1.p.index.set(1);
	setObjectVisible1.p.visible.set(false);

	const container = await actor1.compute();
	const object = container.coreContent()!.threejsObjects()[0];
	const children = object.children;
	assert.equal(children.length, 2);

	// wait to make sure objects are mounted to the scene
	await CoreSleep.sleep(150);

	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
		scene.play();
		assert.equal(scene.time(), 0);
		assert.equal(children[1].visible, true);
		await CoreSleep.sleep(500);
		assert.equal(children[1].visible, true);

		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(200);
		assert.equal(children[0].visible, true);
		assert.equal(children[1].visible, false);

		getObjectChild1.p.index.set(0);
		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(200);
		assert.equal(children[0].visible, false);
		assert.equal(children[1].visible, false);

		setObjectVisible1.p.visible.set(true);
		getObjectChild1.p.index.set(1);
		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(200);
		assert.equal(children[0].visible, false);
		assert.equal(children[1].visible, true);

		setObjectVisible1.p.visible.set(true);
		getObjectChild1.p.index.set(0);
		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(200);
		assert.equal(children[0].visible, true);
		assert.equal(children[1].visible, true);
	});
});
