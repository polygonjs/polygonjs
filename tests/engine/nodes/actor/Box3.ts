import {CoreSleep} from '../../../../src/core/Sleep';
import {ActorConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Actor';
import {RendererUtils} from '../../../helpers/RendererUtils';

QUnit.test('actor/Box3 simple', async (assert) => {
	const scene = window.scene;
	const perspective_camera1 = window.perspective_camera1;
	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');
	const actor1 = geo1.createNode('actor');

	actor1.setInput(0, box1);
	actor1.flags.display.set(true);

	const box3 = actor1.createNode('box3');
	const getBox3Property = actor1.createNode('getBox3Property');
	const setObjectPosition = actor1.createNode('setObjectPosition');
	const onManualTrigger = actor1.createNode('onManualTrigger');

	getBox3Property.setInput(0, box3);
	setObjectPosition.setInput(ActorConnectionPointType.TRIGGER, onManualTrigger);
	setObjectPosition.setInput('position', getBox3Property, 'min');

	box3.p.min.set([-2, -3, -4]);
	box3.p.max.set([5, 6, 8]);

	const container = await actor1.compute();
	const object = container.coreContent()!.threejsObjects()[0];

	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
		scene.play();
		await CoreSleep.sleep(70);
		assert.equal(object.position.y, 0);
		onManualTrigger.p.trigger.pressButton();
		await CoreSleep.sleep(70);
		assert.equal(object.position.y, -3);
		setObjectPosition.setInput('position', getBox3Property, 'max');
		onManualTrigger.p.trigger.pressButton();
		await CoreSleep.sleep(60);
		assert.equal(object.position.y, 6);
	});
});
