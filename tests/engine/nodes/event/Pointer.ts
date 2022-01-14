import {checkConsolePrints} from '../../../helpers/Console';
import {RendererUtils} from '../../../helpers/RendererUtils';

QUnit.test('pointer event nodes simple', async (assert) => {
	const scene = window.scene;
	await scene.waitForCooksCompleted();
	assert.ok(!scene.loadingController.isLoading());

	await RendererUtils.withViewer({cameraNode: window.perspective_camera1}, async ({viewer, element}) => {
		assert.deepEqual(viewer.eventsController().registeredEventTypes(), []);

		const events = scene.root().createNode('eventsNetwork');

		async function logPrintsCount(eventName: string) {
			// if (0) console.log(checkConsolePrints);
			const consoleHistory = await checkConsolePrints(async () => {
				const canvas = element.querySelector('canvas')!;
				canvas.dispatchEvent(new PointerEvent(eventName));
			});
			// console.log(consoleHistory.log);
			return consoleHistory.log.length;
		}
		assert.equal(await logPrintsCount('pointermove'), 0);

		const pointer1 = events.createNode('pointer');
		const message = events.createNode('message');

		await pointer1.compute();
		assert.deepEqual(viewer.eventsController().registeredEventTypes(), ['pointerdown']);

		pointer1.p.active.set(0);
		await pointer1.compute();
		assert.deepEqual(viewer.eventsController().registeredEventTypes(), [], 'no events if node is set to inactive');

		pointer1.p.active.set(1);
		await pointer1.compute();
		assert.deepEqual(viewer.eventsController().registeredEventTypes(), ['pointerdown']);

		pointer1.p.pointerdown.set(0);
		await pointer1.compute();
		assert.deepEqual(viewer.eventsController().registeredEventTypes(), []);

		pointer1.p.pointermove.set(1);
		await pointer1.compute();
		assert.deepEqual(viewer.eventsController().registeredEventTypes(), ['pointermove']);

		message.setInput(0, pointer1, 'pointermove');
		assert.equal(await logPrintsCount('pointermove'), 1, 'event received');

		events.removeNode(pointer1);
		await pointer1.compute();
		assert.deepEqual(viewer.eventsController().registeredEventTypes(), []);

		assert.equal(await logPrintsCount('pointermove'), 0);

		pointer1.p.active.set(1);
		await pointer1.compute();
		assert.deepEqual(
			viewer.eventsController().registeredEventTypes(),
			[],
			'setting a deleted node to active does not update the register'
		);

		assert.equal(await logPrintsCount('pointermove'), 0);

		const pointer2 = events.createNode('pointer');
		await pointer2.compute();
		pointer2.p.pointerdown.set(0);
		await pointer2.compute();
		pointer2.p.pointermove.set(1);
		await pointer2.compute();
		message.setInput(0, pointer2, 'pointermove');

		// check real events are listened to
		assert.equal(await logPrintsCount('pointermove'), 1);
		assert.equal(await logPrintsCount('pointerdown'), 0);

		// creating a new viewer will set its listeners correctly as well
		const element2 = document.createElement('div');
		document.body.appendChild(element2);

		await RendererUtils.withViewer({cameraNode: window.perspective_camera1}, async (args2) => {
			assert.deepEqual(args2.viewer.eventsController().registeredEventTypes(), ['pointermove']);
		});
	});
});
