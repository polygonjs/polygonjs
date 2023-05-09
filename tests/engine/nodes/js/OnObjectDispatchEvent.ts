import {CoreSleep} from '../../../../src/core/Sleep';
import {JsConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Js';
import {RendererUtils} from '../../../helpers/RendererUtils';

QUnit.test('js/OnObjectDispatchEvent simple', async (assert) => {
	const scene = window.scene;
	const perspective_camera1 = window.perspective_camera1;
	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');
	const actor1 = geo1.createNode('actor');

	actor1.setInput(0, box1);
	actor1.flags.display.set(true);

	const setObjectPosition = actor1.createNode('setObjectPosition');
	const onObjectDispatchEvent = actor1.createNode('onObjectDispatchEvent');
	const getObjectProperty1 = actor1.createNode('getObjectProperty');
	const add1 = actor1.createNode('add');

	setObjectPosition.setInput(JsConnectionPointType.TRIGGER, onObjectDispatchEvent);
	add1.setInput(0, getObjectProperty1, 'position');
	add1.params.get('add1')!.set([0, 1, 0]);
	setObjectPosition.setInput('position', add1);
	onObjectDispatchEvent.p.eventNames.set('A B');

	const container = await actor1.compute();
	const object = container.coreContent()!.threejsObjects()[0];
	await geo1.compute();
	// wait to make sure the scene is fully generated,
	// so that it can be traversed the the actorsManager
	await CoreSleep.sleep(50);

	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
		scene.play();
		await CoreSleep.sleep(70);
		assert.equal(object.position.y, 0);
		// dispatch with an eventName that is not listened to
		object.dispatchEvent({type: 'C'});
		await CoreSleep.sleep(60);
		assert.equal(object.position.y, 0);

		// dispatch an event that is listented to
		object.dispatchEvent({type: 'A'});
		await CoreSleep.sleep(70);
		assert.equal(object.position.y, 1);
		// dispatch another event that is listented to
		object.dispatchEvent({type: 'B'});
		await CoreSleep.sleep(70);
		assert.equal(object.position.y, 2);
	});
});
