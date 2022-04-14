import {CoreSleep} from '../../../../src/core/Sleep';
import {ActorConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Actor';
import {RendererUtils} from '../../../helpers/RendererUtils';

QUnit.test('actor/Sphere simple', async (assert) => {
	const scene = window.scene;
	const perspective_camera1 = window.perspective_camera1;
	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');
	const actor1 = geo1.createNode('actor');

	actor1.setInput(0, box1);
	actor1.flags.display.set(true);

	const sphere = actor1.createNode('sphere');
	const getSphereProperty = actor1.createNode('getSphereProperty');
	const floatToVec3 = actor1.createNode('floatToVec3');
	const setObjectPosition = actor1.createNode('setObjectPosition');
	const onManualTrigger = actor1.createNode('onManualTrigger');

	getSphereProperty.setInput(0, sphere);
	setObjectPosition.setInput(ActorConnectionPointType.TRIGGER, onManualTrigger);
	setObjectPosition.setInput('position', getSphereProperty, 'center');
	floatToVec3.setInput('y', getSphereProperty, 'radius');

	sphere.p.center.set([-2, -3, -4]);
	sphere.p.radius.set(7);

	const container = await actor1.compute();
	const object = container.coreContent()!.objects()[0];

	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
		scene.play();
		await CoreSleep.sleep(70);
		assert.equal(object.position.y, 0);
		onManualTrigger.p.trigger.pressButton();
		await CoreSleep.sleep(70);
		assert.equal(object.position.y, -3);
		setObjectPosition.setInput('position', floatToVec3);
		onManualTrigger.p.trigger.pressButton();
		await CoreSleep.sleep(60);
		assert.equal(object.position.y, 7);
	});
});
