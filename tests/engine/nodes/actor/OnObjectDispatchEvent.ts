import {CoreSleep} from '../../../../src/core/Sleep';
import {ActorConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Actor';
import {RendererUtils} from '../../../helpers/RendererUtils';

QUnit.test('actor/OnObjectDispatchEvent simple', async (assert) => {
	const scene = window.scene;
	const perspective_camera1 = window.perspective_camera1;
	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');
	const actor1 = geo1.createNode('actor');

	actor1.setInput(0, box1);
	actor1.flags.display.set(true);

	const setObjectPosition = actor1.createNode('setObjectPosition');
	const onObjectDispatchEvent = actor1.createNode('onObjectDispatchEvent');
	const onManualTrigger = actor1.createNode('onManualTrigger');

	setObjectPosition.setInput(ActorConnectionPointType.TRIGGER, onObjectDispatchEvent);
	setObjectPosition.p.position.set([0, 1, 0]);
	onObjectDispatchEvent.setInput(ActorConnectionPointType.TRIGGER, onManualTrigger);
	onObjectDispatchEvent.p.eventName.set('my-event');

	const container = await actor1.compute();
	const object = container.coreContent()!.objects()[0];

	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
		scene.play();
		await CoreSleep.sleep(70);
		assert.equal(object.position.y, 0);
		// dispatch without having triggered the onObjectDispatchEvent does not work yet
		object.dispatchEvent({type: 'my-event'});
		await CoreSleep.sleep(60);
		assert.equal(object.position.y, 0);
		// we run the manual trigger so that the onObjectDispatchEvent can now listen
		onManualTrigger.p.trigger.pressButton();
		await CoreSleep.sleep(60);
		assert.equal(object.position.y, 0);
		// dispatch the wrong event should have no effect
		object.dispatchEvent({type: 'my-event2'});
		await CoreSleep.sleep(70);
		assert.equal(object.position.y, 0);
		// dispatch the right event should have an effect
		object.dispatchEvent({type: 'my-event'});
		await CoreSleep.sleep(70);
		assert.equal(object.position.y, 1);
	});
});
