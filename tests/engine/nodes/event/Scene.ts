import type {QUnit} from '../../../helpers/QUnit';
import {CoreSleep} from '../../../../src/core/Sleep';
import {TimeController} from '../../../../src/engine/scene/utils/TimeController';
import {checkConsolePrints} from '../../../helpers/Console';
import {RendererUtils} from '../../../helpers/RendererUtils';
import {saveAndLoadScene} from '../../../helpers/ImportHelper';
export function testenginenodeseventScene(qUnit: QUnit) {

qUnit.test('scene event nodes simple tick event', async (assert) => {
	const scene = window.scene;
	const eventsNetwork = scene.root().createNode('eventsNetwork');
	const eventScene = eventsNetwork.createNode('scene');
	const message = eventsNetwork.createNode('message');
	message.setInput(0, eventScene, 'tick');

	async function logPrintsCount() {
		const consoleHistory = await checkConsolePrints(() => {
			const frame = scene.frame();
			scene.setFrame(frame + 1);
		});
		return consoleHistory.log.length;
	}
	eventScene.p.treachedTime.set(0);
	eventScene.p.tick.set(1);

	scene.setFrame(0);
	assert.equal(await logPrintsCount(), 1);
	assert.equal(await logPrintsCount(), 1);
	eventScene.p.tick.set(0);
	assert.equal(await logPrintsCount(), 0);
	eventScene.p.tick.set(1);
	assert.equal(await logPrintsCount(), 1);
	eventScene.p.active.set(0);
	assert.equal(await logPrintsCount(), 0);
});
qUnit.test('scene event nodes simple created event', async (assert) => {
	const scene = window.scene;
	const eventsNetwork = scene.root().createNode('eventsNetwork');
	const eventScene = eventsNetwork.createNode('scene');
	const message = eventsNetwork.createNode('message');
	message.setInput(0, eventScene, 'created');

	async function logPrintsCount() {
		const consoleHistory = await checkConsolePrints(async () => {
			await saveAndLoadScene(scene, async (scene2) => {});
		});
		// console.log(consoleHistory);
		return consoleHistory.log.length;
	}
	eventScene.p.active.set(1);
	eventScene.p.created.set(0);

	assert.equal(await logPrintsCount(), 0);

	eventScene.p.created.set(1);
	assert.equal(await logPrintsCount(), 1);
});

qUnit.test('scene event nodes simple play event', async (assert) => {
	const scene = window.scene;
	const eventsNetwork = scene.root().createNode('eventsNetwork');
	const eventScene = eventsNetwork.createNode('scene');
	const message = eventsNetwork.createNode('message');
	message.setInput(0, eventScene, 'play');

	async function logPrintsCount() {
		const consoleHistory = await checkConsolePrints(async () => {
			scene.play();
			await CoreSleep.sleep(100);
			scene.pause();
		});
		// console.log(consoleHistory);
		return consoleHistory.log.length;
	}
	eventScene.p.active.set(1);
	eventScene.p.play.set(0);

	assert.equal(await logPrintsCount(), 0);

	eventScene.p.play.set(1);
	assert.equal(await logPrintsCount(), 1);

	eventScene.p.play.set(0);
	assert.equal(await logPrintsCount(), 0);
});

qUnit.test('scene event nodes simple pause event', async (assert) => {
	const scene = window.scene;
	const eventsNetwork = scene.root().createNode('eventsNetwork');
	const eventScene = eventsNetwork.createNode('scene');
	const message = eventsNetwork.createNode('message');
	message.setInput(0, eventScene, 'pause');

	async function logPrintsCount() {
		const consoleHistory = await checkConsolePrints(async () => {
			scene.play();
			await CoreSleep.sleep(100);
			scene.pause();
			await CoreSleep.sleep(50);
		});
		// console.log(consoleHistory);
		return consoleHistory.log.length;
	}
	eventScene.p.active.set(1);
	eventScene.p.pause.set(0);

	assert.equal(await logPrintsCount(), 0);

	eventScene.p.pause.set(1);
	assert.equal(await logPrintsCount(), 1);

	eventScene.p.pause.set(0);
	assert.equal(await logPrintsCount(), 0);
});

qUnit.test('scene event nodes simple time reached event', async (assert) => {
	const scene = window.scene;
	const eventsNetwork = scene.root().createNode('eventsNetwork');
	const eventScene = eventsNetwork.createNode('scene');
	const message = eventsNetwork.createNode('message');
	message.setInput(0, eventScene, 'timeReached');

	await RendererUtils.withViewer({cameraNode: window.perspective_camera1}, async ({viewer, element}) => {
		viewer.setAutoRender(true);

		async function logPrintsCount() {
			const consoleHistory = await checkConsolePrints(async () => {
				scene.setFrame(TimeController.START_FRAME);
				scene.play();
				await CoreSleep.sleep(1000);
				scene.pause();
			});
			return consoleHistory.log.length;
		}
		eventScene.p.active.set(1);
		eventScene.p.tick.set(0);
		eventScene.p.treachedTime.set(1);
		eventScene.p.reachedTime.set(0.5);

		assert.equal(await logPrintsCount(), 1);

		eventScene.p.treachedTime.set(0);
		assert.equal(await logPrintsCount(), 0);

		eventScene.p.treachedTime.set(1);
		assert.equal(await logPrintsCount(), 1);

		eventScene.p.treachedTime.set(0);
		assert.equal(await logPrintsCount(), 0);
	});
});

qUnit.test('scene event nodes simple process setFrame input', async (assert) => {
	const scene = window.scene;
	const eventsNetwork = scene.root().createNode('eventsNetwork');
	const eventScene = eventsNetwork.createNode('scene');
	const button = eventsNetwork.createNode('button');

	eventScene.setInput('setFrame', button);
	eventScene.p.setFrameValue.set(10);
	assert.equal(scene.frame(), 0);
	button.p.dispatch.pressButton();
	assert.equal(scene.frame(), 10);
});

qUnit.test('scene event nodes simple process play input', async (assert) => {
	const scene = window.scene;
	const eventsNetwork = scene.root().createNode('eventsNetwork');
	const eventScene = eventsNetwork.createNode('scene');
	const button = eventsNetwork.createNode('button');

	eventScene.setInput('play', button);
	eventScene.p.setFrameValue.set(10);
	assert.equal(scene.timeController.playing(), false);
	button.p.dispatch.pressButton();
	assert.equal(scene.timeController.playing(), true);
});
qUnit.test('scene event nodes simple process pause input', async (assert) => {
	const scene = window.scene;
	const eventsNetwork = scene.root().createNode('eventsNetwork');
	const eventScene = eventsNetwork.createNode('scene');
	const button = eventsNetwork.createNode('button');

	eventScene.setInput('pause', button);
	eventScene.p.setFrameValue.set(10);
	scene.play();
	assert.equal(scene.timeController.playing(), true);
	button.p.dispatch.pressButton();
	assert.equal(scene.timeController.playing(), false);
});

}