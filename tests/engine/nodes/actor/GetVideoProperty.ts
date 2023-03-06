import {ASSETS_ROOT} from '../../../../src/core/loader/AssetsUtils';
import {CoreSleep} from '../../../../src/core/Sleep';
import {GetVideoPropertyActorNodeOutputName} from '../../../../src/engine/nodes/actor/GetVideoProperty';
import {ActorConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Actor';
import {RendererUtils} from '../../../helpers/RendererUtils';

QUnit.test('actor/GetVideoProperty', async (assert) => {
	const scene = window.scene;
	const perspective_camera1 = window.perspective_camera1;
	const geo1 = window.geo1;
	const COP = window.COP;
	const MAT = window.MAT;
	await scene.waitForCooksCompleted();

	const video1 = COP.createNode('video');
	const meshBasic1 = MAT.createNode('meshBasic');
	video1.p.url1.set(`${ASSETS_ROOT}/textures/sintel.mp4`);
	video1.p.url2.set(`${ASSETS_ROOT}/textures/sintel.ogv`);
	const box1 = geo1.createNode('box');
	const material1 = geo1.createNode('material');
	const actor1 = geo1.createNode('actor');

	actor1.setInput(0, material1);
	material1.setInput(0, box1);
	actor1.flags.display.set(true);
	material1.p.material.setNode(meshBasic1);
	meshBasic1.p.map.setNode(video1);
	await video1.compute();

	const onTick1 = actor1.createNode('onTick');
	const setObjectVisible1 = actor1.createNode('setObjectVisible');
	const getVideoProperty1 = actor1.createNode('getVideoProperty');
	getVideoProperty1.p.node.setNode(video1);

	setObjectVisible1.setInput(ActorConnectionPointType.TRIGGER, onTick1);
	setObjectVisible1.setInput('visible', getVideoProperty1, GetVideoPropertyActorNodeOutputName.playing);

	const container = await actor1.compute();
	const object = container.coreContent()!.threejsObjects()[0];

	// wait to make sure objects are mounted to the scene
	await CoreSleep.sleep(150);

	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
		scene.play();
		assert.equal(scene.time(), 0);
		assert.equal(object.visible, true);
		await CoreSleep.sleep(500);
		assert.notOk(video1.states.error.message(), 'no error');
		assert.equal(object.visible, true, 'hidden');

		await CoreSleep.sleep(200);
		assert.equal(object.visible, true, 'still visible');

		video1.p.play.set(false);
		await CoreSleep.sleep(100);
		assert.equal(object.visible, false, 'hidden');

		video1.p.play.set(true);
		await CoreSleep.sleep(100);
		assert.equal(object.visible, true, 'visible');

		// check muted prop
		setObjectVisible1.setInput('visible', getVideoProperty1, GetVideoPropertyActorNodeOutputName.muted);
		await CoreSleep.sleep(100);
		assert.equal(object.visible, true, 'visible');

		video1.p.muted.set(false);
		await CoreSleep.sleep(100);
		assert.equal(object.visible, false, 'hidden');

		video1.p.muted.set(true);
		await CoreSleep.sleep(100);
		assert.equal(object.visible, true, 'visible');
	});
	setTimeout(() => {
		video1.dispose();
	}, 1000);
});
