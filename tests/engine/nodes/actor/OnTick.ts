import {CoreSleep} from '../../../../src/core/Sleep';
import {RendererUtils} from '../../../helpers/RendererUtils';

QUnit.test('actor/onTick send an event when playing', async (assert) => {
	const scene = window.scene;
	const perspective_camera1 = window.perspective_camera1;
	const geo1 = window.geo1;
	const sphere1 = geo1.createNode('sphere');
	const actor1 = geo1.createNode('actor');

	actor1.setInput(0, sphere1);
	actor1.flags.display.set(true);

	const onTick1 = actor1.createNode('onTick');
	const setObjectPosition1 = actor1.createNode('setObjectPosition');

	setObjectPosition1.setInput('trigger', onTick1);
	setObjectPosition1.p.position.set([0, 1, 0]);

	const container = await actor1.compute();
	const object = container.coreContent()!.threejsObjects()[0];

	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
		scene.play();
		assert.equal(scene.time(), 0);
		assert.equal(object.position.y, 0);
		await CoreSleep.sleep(500);
		assert.in_delta(scene.time(), 0.5, 0.25);
		assert.equal(object.position.y, 1);
	});
});

QUnit.test('actor/onTick with getObjectProperty and add', async (assert) => {
	const scene = window.scene;
	const perspective_camera1 = window.perspective_camera1;
	const geo1 = window.geo1;
	const sphere1 = geo1.createNode('sphere');
	const actor1 = geo1.createNode('actor');

	actor1.setInput(0, sphere1);
	actor1.flags.display.set(true);

	const onTick1 = actor1.createNode('onTick');
	const setObjectPosition1 = actor1.createNode('setObjectPosition');
	const getObjectProperty1 = actor1.createNode('getObjectProperty');
	const add1 = actor1.createNode('add');

	add1.setInput(0, getObjectProperty1, 'position');
	add1.params.get('add1')!.set([0, 0.1, 0]);
	setObjectPosition1.setInput('trigger', onTick1);
	setObjectPosition1.setInput('position', add1);

	const container = await actor1.compute();
	const object = container.coreContent()!.threejsObjects()[0];

	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
		scene.play();
		assert.equal(scene.time(), 0);
		assert.equal(object.position.y, 0);
		await CoreSleep.sleep(500);
		assert.in_delta(scene.time(), 0.5, 0.25, 'time is half second');
		assert.in_delta(object.position.y, 3, 0.5);
		await CoreSleep.sleep(500);
		assert.in_delta(scene.time(), 1, 0.25, 'time is one sec');
		assert.in_delta(object.position.y, 5.5, 1);
	});
});
