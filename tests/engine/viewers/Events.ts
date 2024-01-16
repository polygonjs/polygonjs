import type {QUnit} from '../../helpers/QUnit';
import {CoreSleep} from '../../../src/core/Sleep';
import {RendererUtils} from '../../helpers/RendererUtils';
import {sceneFromScene} from '../../helpers/ImportHelper';
import {JsConnectionPointType} from '../../../src/engine/index_all';
import {checkConsolePrints} from '../../helpers/Console';
export function testengineviewersEvents(qUnit: QUnit) {
	qUnit.test('mouse event nodes update the viewer event listeners', async (assert) => {
		const scene = window.scene;
		await scene.waitForCooksCompleted();
		assert.ok(!scene.loadingController.isLoading(), 'scene is loaded');

		await RendererUtils.withViewer({cameraNode: window.perspective_camera1}, async ({viewer, element}) => {
			assert.deepEqual(viewer.eventsController().registeredEventTypes(), [], 'no events registered yet');

			const events = scene.root().createNode('eventsNetwork');
			const mouse1 = events.createNode('mouse');
			await mouse1.compute();
			await CoreSleep.sleep(100);

			assert.deepEqual(
				viewer.eventsController().registeredEventTypes(),
				['pointermove', 'touchmove', 'mousedown', 'mousemove', 'mouseup'],
				'3 mouse events registered'
			);

			mouse1.p.active.set(0);
			await mouse1.compute();
			assert.deepEqual(
				viewer.eventsController().registeredEventTypes(),
				['pointermove', 'touchmove'],
				'no events if node is set to inactive'
			);

			mouse1.p.active.set(1);
			await mouse1.compute();
			assert.deepEqual(
				viewer.eventsController().registeredEventTypes(),
				['pointermove', 'touchmove', 'mousedown', 'mousemove', 'mouseup'],
				'3 mouse events registered again'
			);

			// TODO: those 3 requestContainer should not be necessary
			mouse1.p.mousedown.set(0);
			await mouse1.compute();
			mouse1.p.mousemove.set(0);
			await mouse1.compute();
			mouse1.p.mouseup.set(0);
			await mouse1.compute();
			assert.deepEqual(
				viewer.eventsController().registeredEventTypes(),
				['pointermove', 'touchmove'],
				'no events are registered anymore'
			);

			mouse1.p.mousedown.set(1);
			await mouse1.compute();
			assert.deepEqual(
				viewer.eventsController().registeredEventTypes(),
				['pointermove', 'touchmove', 'mousedown'],
				'1 event is registered'
			);

			events.removeNode(mouse1);
			assert.deepEqual(
				viewer.eventsController().registeredEventTypes(),
				['pointermove', 'touchmove'],
				'events are removed if node is removed'
			);

			mouse1.p.active.set(1);
			await mouse1.compute();
			assert.deepEqual(
				viewer.eventsController().registeredEventTypes(),
				['pointermove', 'touchmove'],
				'setting a deleted node to active does not update the register'
			);

			const mouse2 = events.createNode('mouse');
			await mouse2.compute();
			mouse2.p.mousemove.set(0);
			await mouse2.compute();
			mouse2.p.mouseup.set(0);
			await mouse2.compute();
			mouse2.p.mousedown.set(1);
			await mouse2.compute();
			mouse2.p.click.set(1);
			await mouse2.compute();
			// creating a new viewer will set its listeners correctly as well
			const element2 = document.createElement('div');
			document.body.appendChild(element2);

			await RendererUtils.withViewer({cameraNode: window.perspective_camera1}, async (args2) => {
				assert.deepEqual(args2.viewer.eventsController().registeredEventTypes(), [
					'pointermove',
					'touchmove',
					'click',
					'mousedown',
				]);
			});
		});
	});

	qUnit.test('mouse event are set correctly when saving/loading the scene', async (assert) => {
		const scene = window.scene;
		await scene.waitForCooksCompleted();
		assert.ok(!scene.loadingController.isLoading(), 'scene is loaded');

		await RendererUtils.withViewer({cameraNode: window.perspective_camera1}, async ({viewer, element}) => {
			assert.deepEqual(viewer.eventsController().registeredEventTypes(), [], 'no events registered yet');

			const events = scene.root().createNode('eventsNetwork');
			const mouse1 = events.createNode('mouse');
			await mouse1.compute();
			await CoreSleep.sleep(100);
			// TODO: those 3 requestContainer should not be necessary
			mouse1.p.mousedown.set(0);
			await mouse1.compute();
			mouse1.p.mousemove.set(0);
			await mouse1.compute();
			mouse1.p.mouseup.set(0);
			await mouse1.compute();
			mouse1.p.click.set(1);
			await mouse1.compute();

			assert.deepEqual(
				viewer.eventsController().registeredEventTypes(),
				['pointermove', 'touchmove', 'click'],
				'only click registered'
			);

			// console.log('************ LOAD **************');
			const scene2 = await sceneFromScene(scene);
			await scene2.waitForCooksCompleted();
			const element2 = document.createElement('div');
			document.body.appendChild(element2);
			const perspective_camera2 = scene2.root().nodesByType('perspectiveCamera')[0];
			const events2 = scene2.root().nodesByType('eventsNetwork')[0];
			const mouse2 = events2.nodesByType('mouse')[0];

			await RendererUtils.withViewer({cameraNode: perspective_camera2}, async (args2) => {
				const viewer2 = args2.viewer;
				assert.deepEqual(
					viewer2.eventsController().registeredEventTypes(),
					['pointermove', 'touchmove', 'click'],
					'only click registered on scene reload'
				);

				mouse2.p.click.set(0);
				await mouse2.compute();
				assert.deepEqual(
					viewer2.eventsController().registeredEventTypes(),
					['pointermove', 'touchmove'],
					'no events registered on scene reload'
				);
				mouse2.p.click.set(1);
				await mouse2.compute();
				assert.deepEqual(
					viewer2.eventsController().registeredEventTypes(),
					['pointermove', 'touchmove', 'click'],
					'only click registered on scene reload again'
				);
			});
		});
	});

	qUnit.test('keyboard event nodes update the viewer event listeners', async (assert) => {
		const scene = window.scene;
		await scene.waitForCooksCompleted();
		assert.ok(!scene.loadingController.isLoading());

		await RendererUtils.withViewer({cameraNode: window.perspective_camera1}, async ({viewer, element}) => {
			assert.deepEqual(viewer.eventsController().registeredEventTypes(), []);

			const events = scene.root().createNode('eventsNetwork');
			const keyboard1 = events.createNode('keyboard');
			await keyboard1.compute();
			assert.deepEqual(viewer.eventsController().registeredEventTypes(), ['pointermove', 'touchmove', 'keydown']);

			keyboard1.p.active.set(0);
			await keyboard1.compute();
			assert.deepEqual(
				viewer.eventsController().registeredEventTypes(),
				['pointermove', 'touchmove'],
				'no events if node is set to inactive'
			);

			keyboard1.p.active.set(1);
			await keyboard1.compute();
			assert.deepEqual(viewer.eventsController().registeredEventTypes(), ['pointermove', 'touchmove', 'keydown']);

			keyboard1.p.keydown.set(0);
			await keyboard1.compute();
			assert.deepEqual(viewer.eventsController().registeredEventTypes(), ['pointermove', 'touchmove']);

			keyboard1.p.keyup.set(1);
			await keyboard1.compute();
			assert.deepEqual(viewer.eventsController().registeredEventTypes(), ['pointermove', 'touchmove', 'keyup']);

			events.removeNode(keyboard1);
			await keyboard1.compute();
			assert.deepEqual(viewer.eventsController().registeredEventTypes(), ['pointermove', 'touchmove']);

			keyboard1.p.active.set(1);
			await keyboard1.compute();
			assert.deepEqual(
				viewer.eventsController().registeredEventTypes(),
				['pointermove', 'touchmove'],
				'setting a deleted node to active does not update the register'
			);

			const keyboard2 = events.createNode('keyboard');
			await keyboard2.compute();
			keyboard2.p.keydown.set(0);
			await keyboard2.compute();
			keyboard2.p.keypress.set(1);
			await keyboard2.compute();
			// creating a new viewer will set its listeners correctly as well
			const element2 = document.createElement('div');
			document.body.appendChild(element2);
			await RendererUtils.withViewer({cameraNode: window.perspective_camera1}, async (args2) => {
				assert.deepEqual(args2.viewer.eventsController().registeredEventTypes(), [
					'pointermove',
					'touchmove',
					'keypress',
				]);
			});
		});
	});

	qUnit.test('scene event nodes do not add events to the viewer', async (assert) => {
		const scene = window.scene;
		await scene.waitForCooksCompleted();
		assert.ok(!scene.loadingController.isLoading());

		await RendererUtils.withViewer({cameraNode: window.perspective_camera1}, async ({viewer, element}) => {
			assert.deepEqual(viewer.eventsController().registeredEventTypes(), []);

			const events = scene.root().createNode('eventsNetwork');
			const scene1 = events.createNode('scene');

			assert.deepEqual(viewer.eventsController().registeredEventTypes(), []);

			scene1.p.active.set(0);
			assert.deepEqual(
				viewer.eventsController().registeredEventTypes(),
				[],
				'no events if node is set to inactive'
			);

			scene1.p.active.set(1);
			assert.deepEqual(viewer.eventsController().registeredEventTypes(), []);

			scene1.p.tick.set(1);
			assert.deepEqual(viewer.eventsController().registeredEventTypes(), []);
		});
	});

	qUnit.test('events created by actor nodes are cleared when unmounting a viewer', async (assert) => {
		const scene = window.scene;
		await scene.waitForCooksCompleted();
		assert.ok(!scene.loadingController.isLoading());

		const geo1 = window.geo1;
		const box1 = geo1.createNode('box');
		const actor1 = geo1.createNode('actor');

		actor1.setInput(0, box1);
		actor1.flags?.display?.set(true);

		const setObjectPosition1 = actor1.createNode('setObjectPosition');
		const onTick1 = actor1.createNode('onTick');
		const rayIntersectPlane1 = actor1.createNode('rayIntersectPlane');
		const rayFromCursor1 = actor1.createNode('rayFromCursor');
		const plane1 = actor1.createNode('plane');

		setObjectPosition1.setInput(JsConnectionPointType.TRIGGER, onTick1);
		setObjectPosition1.setInput('position', rayIntersectPlane1);
		rayIntersectPlane1.setInput(JsConnectionPointType.RAY, rayFromCursor1);
		rayIntersectPlane1.setInput(JsConnectionPointType.PLANE, plane1);

		await RendererUtils.withViewerContainer(async (element) => {
			const viewer = (await scene.camerasController.createMainViewer())!;
			assert.ok(viewer, 'ok viewer');
			viewer.mount(element);

			scene.play();
			await CoreSleep.sleep(200);
			viewer.unmount();

			const consoleHistory = await checkConsolePrints(async () => {
				await CoreSleep.sleep(100);
				console.warn('pointermove start');
				document.dispatchEvent(new Event('pointermove'));
				console.warn('pointermove end');
				await CoreSleep.sleep(100);
			});
			assert.equal(consoleHistory.log.length, 0, '0 logs');
			assert.equal(consoleHistory.warn.length, 2, '2 warnings');
			assert.equal(consoleHistory.error.length, 0, '0 errors');
		});
	});
}
