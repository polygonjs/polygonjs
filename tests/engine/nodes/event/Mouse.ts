import type {QUnit} from '../../../helpers/QUnit';
import {checkConsolePrints} from '../../../helpers/Console';
import {RendererUtils} from '../../../helpers/RendererUtils';
export function testenginenodeseventMouse(qUnit: QUnit) {
	qUnit.test('mouse event nodes simple', async (assert) => {
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
					canvas.dispatchEvent(new MouseEvent(eventName));
				});
				// console.log(consoleHistory.log);
				return consoleHistory.log.length;
			}
			assert.equal(await logPrintsCount('mousemove'), 0);

			const mouse1 = events.createNode('mouse');
			const message = events.createNode('message');

			await mouse1.compute();
			assert.deepEqual(viewer.eventsController().registeredEventTypes(), [
				'pointermove',
				'touchmove',
				'mousedown',
				'mousemove',
				'mouseup',
			]);

			mouse1.p.active.set(0);
			await mouse1.compute();
			assert.deepEqual(
				viewer.eventsController().registeredEventTypes(),
				['pointermove', 'touchmove'],
				'no events if node is set to inactive'
			);

			mouse1.p.active.set(1);
			await mouse1.compute();
			assert.deepEqual(viewer.eventsController().registeredEventTypes(), [
				'pointermove',
				'touchmove',
				'mousedown',
				'mousemove',
				'mouseup',
			]);

			mouse1.p.mousedown.set(0);
			await mouse1.compute();
			assert.deepEqual(viewer.eventsController().registeredEventTypes(), [
				'pointermove',
				'touchmove',
				'mousemove',
				'mouseup',
			]);

			mouse1.p.mouseup.set(0);
			await mouse1.compute();
			assert.deepEqual(viewer.eventsController().registeredEventTypes(), [
				'pointermove',
				'touchmove',
				'mousemove',
			]);

			mouse1.p.mousemove.set(0);
			await mouse1.compute();
			assert.deepEqual(viewer.eventsController().registeredEventTypes(), ['pointermove', 'touchmove']);

			mouse1.p.mousemove.set(1);
			await mouse1.compute();
			assert.deepEqual(viewer.eventsController().registeredEventTypes(), [
				'pointermove',
				'touchmove',
				'mousemove',
			]);

			events.removeNode(mouse1);
			await mouse1.compute();
			assert.deepEqual(viewer.eventsController().registeredEventTypes(), ['pointermove', 'touchmove']);

			mouse1.p.active.set(1);
			await mouse1.compute();
			assert.deepEqual(
				viewer.eventsController().registeredEventTypes(),
				['pointermove', 'touchmove'],
				'setting a deleted node to active does not update the register'
			);

			const mouse2 = events.createNode('mouse');
			await mouse2.compute();
			mouse2.p.mousedown.set(0);
			mouse2.p.mouseup.set(0);
			mouse2.p.mousemove.set(1);
			await mouse2.compute();
			await mouse2.compute();
			message.setInput(0, mouse2, 'mousemove');

			// check real events are listened to
			assert.equal(await logPrintsCount('mousemove'), 1);
			assert.equal(await logPrintsCount('mousedown'), 0);

			// creating a new viewer will set its listeners correctly as well
			const element2 = document.createElement('div');
			document.body.appendChild(element2);

			await RendererUtils.withViewer({cameraNode: window.perspective_camera1}, async (args2) => {
				assert.deepEqual(args2.viewer.eventsController().registeredEventTypes(), [
					'pointermove',
					'touchmove',
					'mousemove',
				]);
			});
		});
	});
}
