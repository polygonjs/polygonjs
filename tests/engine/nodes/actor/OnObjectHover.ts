import {CoreSleep} from '../../../../src/core/Sleep';
import {ActorConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Actor';
import {RendererUtils} from '../../../helpers/RendererUtils';

function triggerPointerMoveInMiddle(canvas: HTMLCanvasElement) {
	const rect = canvas.getBoundingClientRect();
	canvas.dispatchEvent(
		new PointerEvent('pointermove', {clientX: rect.left + rect.width * 0.5, clientY: rect.top + rect.height * 0.5})
	);
}
function triggerPointerMoveAside(canvas: HTMLCanvasElement) {
	canvas.dispatchEvent(new PointerEvent('pointermove', {clientX: 0, clientY: 0}));
}

QUnit.test('actor/OnObjectHover', async (assert) => {
	const scene = window.scene;
	const perspective_camera1 = window.perspective_camera1;

	perspective_camera1.p.t.set([0, 0, 5]);

	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');
	const actor1 = geo1.createNode('actor');

	actor1.setInput(0, box1);
	actor1.flags.display.set(true);

	const onObjectHover1 = actor1.createNode('onObjectHover');
	const setObjectPosition1 = actor1.createNode('setObjectPosition');

	setObjectPosition1.setInput(ActorConnectionPointType.TRIGGER, onObjectHover1);

	setObjectPosition1.p.position.set([0, 0, 1]);

	const container = await actor1.compute();
	const object = container.coreContent()!.objects()[0];

	// wait to make sure objects are mounted to the scene
	await CoreSleep.sleep(150);

	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
		const {viewer} = args;
		const canvas = viewer.canvas();
		scene.play();
		assert.equal(scene.time(), 0);

		assert.deepEqual(object.position.toArray(), [0, 0, 0]);

		triggerPointerMoveInMiddle(canvas);
		await CoreSleep.sleep(200);
		assert.deepEqual(object.position.toArray(), [0, 0, 1]);
		object.position.set(0, 0, 0);

		// hover out of the object will also throw an event since it is a state change
		triggerPointerMoveAside(canvas);
		await CoreSleep.sleep(200);
		assert.deepEqual(object.position.toArray(), [0, 0, 1]);
		object.position.set(0, 0, 0);

		triggerPointerMoveAside(canvas);
		await CoreSleep.sleep(200);
		assert.deepEqual(object.position.toArray(), [0, 0, 0]);
	});
});
