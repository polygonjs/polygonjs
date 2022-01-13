import {CoreSleep} from '../../../src/core/Sleep';
import {SceneJsonImporter} from '../../../src/engine/io/json/import/Scene';
import {SceneJsonExporter} from '../../../src/engine/io/json/export/Scene';
import {RendererUtils} from '../../helpers/RendererUtils';

QUnit.test('mouse event nodes update the viewer event listeners', async (assert) => {
	const scene = window.scene;
	await scene.waitForCooksCompleted();
	assert.ok(!scene.loadingController.isLoading(), 'scene is loaded');

	await RendererUtils.withViewer({cameraNode: window.perspective_camera1}, async ({viewer, element}) => {
		assert.deepEqual(viewer.eventsController().registeredEventTypes(), [], 'no events registered yet');

		const events = scene.root().createNode('eventsNetwork');
		const mouse1 = events.createNode('mouse');
		await mouse1.compute();
		CoreSleep.sleep(100);

		assert.deepEqual(
			viewer.eventsController().registeredEventTypes(),
			['mousedown', 'mousemove', 'mouseup'],
			'3 mouse events registered'
		);

		mouse1.p.active.set(0);
		await mouse1.compute();
		assert.deepEqual(viewer.eventsController().registeredEventTypes(), [], 'no events if node is set to inactive');

		mouse1.p.active.set(1);
		await mouse1.compute();
		assert.deepEqual(
			viewer.eventsController().registeredEventTypes(),
			['mousedown', 'mousemove', 'mouseup'],
			'3 mouse events registered again'
		);

		// TODO: those 3 requestContainer should not be necessary
		mouse1.p.mousedown.set(0);
		await mouse1.compute();
		mouse1.p.mousemove.set(0);
		await mouse1.compute();
		mouse1.p.mouseup.set(0);
		await mouse1.compute();
		assert.deepEqual(viewer.eventsController().registeredEventTypes(), [], 'no events are registered anymore');

		mouse1.p.mousedown.set(1);
		await mouse1.compute();
		assert.deepEqual(viewer.eventsController().registeredEventTypes(), ['mousedown'], '1 event is registered');

		events.removeNode(mouse1);
		assert.deepEqual(viewer.eventsController().registeredEventTypes(), [], 'events are removed if node is removed');

		mouse1.p.active.set(1);
		await mouse1.compute();
		assert.deepEqual(
			viewer.eventsController().registeredEventTypes(),
			[],
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
			assert.deepEqual(args2.viewer.eventsController().registeredEventTypes(), ['click', 'mousedown']);
		});
	});
});

QUnit.test('mouse event are set correctly when saving/loading the scene', async (assert) => {
	const scene = window.scene;
	await scene.waitForCooksCompleted();
	assert.ok(!scene.loadingController.isLoading(), 'scene is loaded');

	await RendererUtils.withViewer({cameraNode: window.perspective_camera1}, async ({viewer, element}) => {
		assert.deepEqual(viewer.eventsController().registeredEventTypes(), [], 'no events registered yet');

		const events = scene.root().createNode('eventsNetwork');
		const mouse1 = events.createNode('mouse');
		await mouse1.compute();
		CoreSleep.sleep(100);
		// TODO: those 3 requestContainer should not be necessary
		mouse1.p.mousedown.set(0);
		await mouse1.compute();
		mouse1.p.mousemove.set(0);
		await mouse1.compute();
		mouse1.p.mouseup.set(0);
		await mouse1.compute();
		mouse1.p.click.set(1);
		await mouse1.compute();

		assert.deepEqual(viewer.eventsController().registeredEventTypes(), ['click'], 'only click registered');

		const data = new SceneJsonExporter(scene).data();
		// console.log('************ LOAD **************');
		const scene2 = await SceneJsonImporter.loadData(data);
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
				['click'],
				'only click registered on scene reload'
			);

			mouse2.p.click.set(0);
			await mouse2.compute();
			assert.deepEqual(
				viewer2.eventsController().registeredEventTypes(),
				[],
				'no events registered on scene reload'
			);
			mouse2.p.click.set(1);
			await mouse2.compute();
			assert.deepEqual(
				viewer2.eventsController().registeredEventTypes(),
				['click'],
				'only click registered on scene reload again'
			);
		});
	});
});

QUnit.test('keyboard event nodes update the viewer event listeners', async (assert) => {
	const scene = window.scene;
	await scene.waitForCooksCompleted();
	assert.ok(!scene.loadingController.isLoading());

	await RendererUtils.withViewer({cameraNode: window.perspective_camera1}, async ({viewer, element}) => {
		assert.deepEqual(viewer.eventsController().registeredEventTypes(), []);

		const events = scene.root().createNode('eventsNetwork');
		const keyboard1 = events.createNode('keyboard');
		await keyboard1.compute();
		assert.deepEqual(viewer.eventsController().registeredEventTypes(), ['keydown']);

		keyboard1.p.active.set(0);
		await keyboard1.compute();
		assert.deepEqual(viewer.eventsController().registeredEventTypes(), [], 'no events if node is set to inactive');

		keyboard1.p.active.set(1);
		await keyboard1.compute();
		assert.deepEqual(viewer.eventsController().registeredEventTypes(), ['keydown']);

		keyboard1.p.keydown.set(0);
		await keyboard1.compute();
		assert.deepEqual(viewer.eventsController().registeredEventTypes(), []);

		keyboard1.p.keyup.set(1);
		await keyboard1.compute();
		assert.deepEqual(viewer.eventsController().registeredEventTypes(), ['keyup']);

		events.removeNode(keyboard1);
		await keyboard1.compute();
		assert.deepEqual(viewer.eventsController().registeredEventTypes(), []);

		keyboard1.p.active.set(1);
		await keyboard1.compute();
		assert.deepEqual(
			viewer.eventsController().registeredEventTypes(),
			[],
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
			assert.deepEqual(args2.viewer.eventsController().registeredEventTypes(), ['keypress']);
		});
	});
});

QUnit.test('scene event nodes do not add events to the viewer', async (assert) => {
	const scene = window.scene;
	await scene.waitForCooksCompleted();
	assert.ok(!scene.loadingController.isLoading());

	await RendererUtils.withViewer({cameraNode: window.perspective_camera1}, async ({viewer, element}) => {
		assert.deepEqual(viewer.eventsController().registeredEventTypes(), []);

		const events = scene.root().createNode('eventsNetwork');
		const scene1 = events.createNode('scene');

		assert.deepEqual(viewer.eventsController().registeredEventTypes(), []);

		scene1.p.active.set(0);
		assert.deepEqual(viewer.eventsController().registeredEventTypes(), [], 'no events if node is set to inactive');

		scene1.p.active.set(1);
		assert.deepEqual(viewer.eventsController().registeredEventTypes(), []);

		scene1.p.tick.set(1);
		assert.deepEqual(viewer.eventsController().registeredEventTypes(), []);
	});
});

QUnit.test('scene event nodes 1 with tick on processes event', async (assert) => {
	assert.equal(1, 2);
});

QUnit.test('scene event nodes 1 with tick on processes event and 1 with tick off does not', async (assert) => {
	assert.equal(1, 2);
});
