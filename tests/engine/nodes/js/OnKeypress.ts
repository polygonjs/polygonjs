import {CoreSleep} from '../../../../src/core/Sleep';
import {JsConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Js';
import {triggerKeydown, triggerKeypress, triggerKeyup} from '../../../helpers/EventsHelper';
import {RendererUtils} from '../../../helpers/RendererUtils';

QUnit.test('js/onKeypress', async (assert) => {
	const scene = window.scene;
	const perspective_camera1 = window.perspective_camera1;

	perspective_camera1.p.t.set([0, 0, 5]);

	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');
	const actor1 = geo1.createNode('actor');

	actor1.setInput(0, box1);
	actor1.flags.display.set(true);

	const onKeypress1 = actor1.createNode('onKeypress');
	const setObjectPosition1 = actor1.createNode('setObjectPosition');
	const getObjectProperty1 = actor1.createNode('getObjectProperty');
	const add1 = actor1.createNode('add');

	setObjectPosition1.setInput(JsConnectionPointType.TRIGGER, onKeypress1);
	setObjectPosition1.setInput('position', add1);
	add1.setInput(0, getObjectProperty1, 'position');
	add1.params.get('add1')!.set([0, 0, 1]);
	onKeypress1.p.keyCodes.set('keyE');

	const container = await actor1.compute();
	const object = container.coreContent()!.threejsObjects()[0];

	// wait to make sure objects are mounted to the scene
	await CoreSleep.sleep(150);

	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
		const {viewer} = args;
		const canvas = viewer.canvas();
		scene.play();
		assert.equal(scene.time(), 0);

		assert.deepEqual(object.position.toArray(), [0, 0, 0]);

		triggerKeypress(canvas, {code: 'keyA'});
		await CoreSleep.sleep(200);
		assert.deepEqual(object.position.toArray(), [0, 0, 0], 'no moved');

		triggerKeypress(canvas, {code: 'keyE'});
		await CoreSleep.sleep(200);
		assert.deepEqual(object.position.toArray(), [0, 0, 1], 'moved');

		triggerKeypress(canvas, {code: 'keyE'});
		await CoreSleep.sleep(200);
		assert.deepEqual(object.position.toArray(), [0, 0, 2], 'moved');

		triggerKeydown(canvas, {code: 'keyE'});
		await CoreSleep.sleep(200);
		assert.deepEqual(object.position.toArray(), [0, 0, 2], 'not moved');

		triggerKeyup(canvas, {code: 'keyE'});
		await CoreSleep.sleep(200);
		assert.deepEqual(object.position.toArray(), [0, 0, 2], 'not moved');

		triggerKeypress(canvas, {code: 'keyE'});
		await CoreSleep.sleep(200);
		assert.deepEqual(object.position.toArray(), [0, 0, 3], 'moved');

		actor1.removeNode(onKeypress1);
		triggerKeypress(canvas, {code: 'keyE'});
		await CoreSleep.sleep(200);
		assert.deepEqual(object.position.toArray(), [0, 0, 3], 'not moved');
	});
});
