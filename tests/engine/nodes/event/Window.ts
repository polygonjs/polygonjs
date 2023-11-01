import type {QUnit} from '../../../helpers/QUnit';
import {checkConsolePrints} from '../../../helpers/Console';
import {RendererUtils} from '../../../helpers/RendererUtils';
export function testenginenodeseventWindow(qUnit: QUnit) {
	qUnit.test('window event nodes simple', async (assert) => {
		const scene = window.scene;
		await scene.waitForCooksCompleted();
		assert.ok(!scene.loadingController.isLoading());

		await RendererUtils.withViewer({cameraNode: window.perspective_camera1}, async ({viewer, element}) => {
			assert.deepEqual(viewer.eventsController().registeredEventTypes(), []);

			async function logPrintsCount() {
				if (0) console.log(checkConsolePrints);
				const consoleHistory = await checkConsolePrints(async () => {
					// const canvas = element.querySelector('canvas')!;
					// document.dispatchEvent(new KeyboardEvent(eventName, {code}));
					window.dispatchEvent(new Event('resize'));
				});
				return consoleHistory.log.length;
			}

			const events = scene.root().createNode('eventsNetwork');
			const window1 = events.createNode('window');
			await window1.compute();
			assert.deepEqual(viewer.eventsController().registeredEventTypes(), ['pointermove', 'touchmove', 'resize']);

			window1.p.active.set(0);
			await window1.compute();
			assert.deepEqual(
				viewer.eventsController().registeredEventTypes(),
				['pointermove', 'touchmove'],
				'no events if node is set to inactive'
			);

			window1.p.active.set(1);
			await window1.compute();
			assert.deepEqual(viewer.eventsController().registeredEventTypes(), ['pointermove', 'touchmove', 'resize']);

			window1.p.resize.set(0);
			await window1.compute();
			assert.deepEqual(viewer.eventsController().registeredEventTypes(), ['pointermove', 'touchmove']);

			events.removeNode(window1);
			await window1.compute();
			assert.deepEqual(viewer.eventsController().registeredEventTypes(), ['pointermove', 'touchmove']);

			window1.p.active.set(1);
			await window1.compute();
			assert.deepEqual(
				viewer.eventsController().registeredEventTypes(),
				['pointermove', 'touchmove'],
				'setting a deleted node to active does not update the register'
			);

			const message = events.createNode('message');
			message.setInput(0, window1, 'resize');
			assert.equal(await logPrintsCount(), 0);

			const window2 = events.createNode('window');
			message.setInput(0, window2, 'resize');
			assert.equal(await logPrintsCount(), 1);

			await window2.compute();
			window2.p.resize.set(0);
			assert.equal(await logPrintsCount(), 0);
			await window2.compute();
			window2.p.resize.set(1);
			await window2.compute();
			assert.equal(await logPrintsCount(), 1);
			// creating a new viewer will set its listeners correctly as well
			const element2 = document.createElement('div');
			document.body.appendChild(element2);

			await RendererUtils.withViewer({cameraNode: window.perspective_camera1}, async (args2) => {
				assert.deepEqual(args2.viewer.eventsController().registeredEventTypes(), [
					'pointermove',
					'touchmove',
					'resize',
				]);
			});
		});
	});
}
