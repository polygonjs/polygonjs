import type {QUnit} from '../../../helpers/QUnit';
import {CoreEventEmitter} from '../../../../src/core/event/CoreEventEmitter';
import {checkConsolePrints} from '../../../helpers/Console';
import {RendererUtils} from '../../../helpers/RendererUtils';
export function testenginenodeseventKeyboard(qUnit: QUnit) {
	qUnit.test('keyboard event nodes simple from document', async (assert) => {
		const scene = window.scene;
		await scene.waitForCooksCompleted();
		assert.ok(!scene.loadingController.isLoading());

		await RendererUtils.withViewer({cameraNode: window.perspective_camera1}, async ({viewer, element}) => {
			assert.deepEqual(viewer.eventsController().registeredEventTypes(), []);

			async function logPrintsCount(eventName: string, code: string) {
				if (0) console.log(checkConsolePrints);
				const consoleHistory = await checkConsolePrints(async () => {
					// const canvas = element.querySelector('canvas')!;
					document.dispatchEvent(new KeyboardEvent(eventName, {code}));
				});
				// console.log(consoleHistory.log);
				return consoleHistory.log.length;
			}

			const events = scene.root().createNode('eventsNetwork');
			const keyboard1 = events.createNode('keyboard');
			keyboard1.setElement(CoreEventEmitter.DOCUMENT);

			await keyboard1.compute();
			assert.deepEqual(viewer.eventsController().registeredEventTypes(), ['pointermove', 'keydown']);

			keyboard1.p.active.set(0);
			await keyboard1.compute();
			assert.deepEqual(
				viewer.eventsController().registeredEventTypes(),
				[],
				'no events if node is set to inactive'
			);

			keyboard1.p.active.set(1);
			await keyboard1.compute();
			assert.deepEqual(viewer.eventsController().registeredEventTypes(), ['pointermove', 'keydown']);

			keyboard1.p.keydown.set(0);
			await keyboard1.compute();
			assert.deepEqual(viewer.eventsController().registeredEventTypes(), ['pointermove']);

			keyboard1.p.keypress.set(1);
			await keyboard1.compute();
			assert.deepEqual(viewer.eventsController().registeredEventTypes(), ['pointermove', 'keypress']);

			events.removeNode(keyboard1);
			await keyboard1.compute();
			assert.deepEqual(viewer.eventsController().registeredEventTypes(), ['pointermove']);

			keyboard1.p.keypress.set(1);
			await keyboard1.compute();
			assert.deepEqual(
				viewer.eventsController().registeredEventTypes(),
				['pointermove'],
				'setting a deleted node to active does not update the register'
			);

			const keyboard2 = events.createNode('keyboard');
			keyboard2.setElement(CoreEventEmitter.DOCUMENT);
			await keyboard2.compute();
			keyboard2.p.keydown.set(0);
			await keyboard2.compute();
			keyboard2.p.keydown.set(1);
			await keyboard2.compute();
			assert.deepEqual(viewer.eventsController().registeredEventTypes(), ['keydown']);

			const message = events.createNode('message');
			message.setInput(0, keyboard2, 'keydown');
			assert.equal(await logPrintsCount('keydown', 'KeyE'), 1);
			keyboard2.p.keydown.set(0);
			assert.equal(await logPrintsCount('keydown', 'KeyE'), 0);
			keyboard2.p.keydown.set(1);
			assert.equal(await logPrintsCount('keydown', 'KeyE'), 1);
			assert.equal(await logPrintsCount('keydown', 'KeyA'), 0);
			keyboard2.p.keyCodes.set('KeyA');
			assert.equal(await logPrintsCount('keydown', 'KeyA'), 1);

			// creating a new viewer will set its listeners correctly as well
			const element2 = document.createElement('div');
			document.body.appendChild(element2);

			await RendererUtils.withViewer({cameraNode: window.perspective_camera1}, async (args2) => {
				assert.deepEqual(args2.viewer.eventsController().registeredEventTypes(), ['keydown']);
			});
		});
	});

	qUnit.test('keyboard event nodes simple from canvas', async (assert) => {
		const scene = window.scene;
		await scene.waitForCooksCompleted();
		assert.ok(!scene.loadingController.isLoading());

		await RendererUtils.withViewer({cameraNode: window.perspective_camera1}, async ({viewer, element}) => {
			assert.deepEqual(viewer.eventsController().registeredEventTypes(), []);

			async function logPrintsCount(eventName: string, code: string) {
				// if (0) console.log(checkConsolePrints);
				const consoleHistory = await checkConsolePrints(async () => {
					const canvas = element.querySelector('canvas')!;
					canvas.focus();
					canvas.dispatchEvent(new KeyboardEvent(eventName, {code}));
				});
				return consoleHistory.log.length;
			}

			const events = scene.root().createNode('eventsNetwork');
			const keyboard1 = events.createNode('keyboard');
			keyboard1.setElement(CoreEventEmitter.CANVAS);

			await keyboard1.compute();
			assert.deepEqual(viewer.eventsController().registeredEventTypes(), ['pointermove', 'keydown']);

			keyboard1.p.active.set(0);
			await keyboard1.compute();
			assert.deepEqual(
				viewer.eventsController().registeredEventTypes(),
				['pointermove'],
				'no events if node is set to inactive'
			);

			keyboard1.p.active.set(1);
			await keyboard1.compute();
			assert.deepEqual(viewer.eventsController().registeredEventTypes(), ['pointermove', 'keydown']);

			keyboard1.p.keydown.set(0);
			await keyboard1.compute();
			assert.deepEqual(viewer.eventsController().registeredEventTypes(), ['pointermove']);

			keyboard1.p.keypress.set(1);
			await keyboard1.compute();
			assert.deepEqual(viewer.eventsController().registeredEventTypes(), ['pointermove', 'keypress']);

			events.removeNode(keyboard1);
			await keyboard1.compute();
			assert.deepEqual(viewer.eventsController().registeredEventTypes(), ['pointermove']);

			keyboard1.p.keypress.set(1);
			await keyboard1.compute();
			assert.deepEqual(
				viewer.eventsController().registeredEventTypes(),
				['pointermove'],
				'setting a deleted node to active does not update the register'
			);

			const keyboard2 = events.createNode('keyboard');
			keyboard2.setElement(CoreEventEmitter.CANVAS);
			await keyboard2.compute();
			keyboard2.p.keydown.set(0);
			await keyboard2.compute();
			keyboard2.p.keydown.set(1);
			await keyboard2.compute();

			const message = events.createNode('message');
			message.setInput(0, keyboard2, 'keydown');
			assert.equal(await logPrintsCount('keydown', 'KeyE'), 1, 'E is detected');
			keyboard2.p.keydown.set(0);
			assert.equal(await logPrintsCount('keydown', 'KeyE'), 0, 'E is not detected');
			keyboard2.p.keydown.set(1);
			assert.equal(await logPrintsCount('keydown', 'KeyE'), 1, 'E is detected');
			assert.equal(await logPrintsCount('keydown', 'KeyA'), 0, 'A is not detected');
			keyboard2.p.keyCodes.set('KeyA');
			assert.equal(await logPrintsCount('keydown', 'KeyA'), 1, 'A is detected');

			// creating a new viewer will set its listeners correctly as well
			const element2 = document.createElement('div');
			document.body.appendChild(element2);

			await RendererUtils.withViewer({cameraNode: window.perspective_camera1}, async (args2) => {
				assert.deepEqual(args2.viewer.eventsController().registeredEventTypes(), ['pointermove', 'keydown']);
			});
		});
	});
}
