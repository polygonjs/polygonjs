import {ASSETS_ROOT} from '../../../../src/core/loader/AssetsUtils';
import {CoreSleep} from '../../../../src/core/Sleep';
import {VideoEvent, VIDEO_EVENT_INDICES} from '../../../../src/core/Video';
import {ActorConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Actor';
import {Vector3Param} from '../../../../src/engine/params/Vector3';
import {RendererUtils} from '../../../helpers/RendererUtils';

QUnit.test('actor/OnVideoEvent', async (assert) => {
	const scene = window.scene;
	const perspective_camera1 = window.perspective_camera1;
	const geo1 = window.geo1;
	const COP = window.COP;
	const MAT = window.MAT;
	await scene.waitForCooksCompleted();

	const video1 = COP.createNode('video');
	video1.p.play.set(false);
	const meshBasic1 = MAT.createNode('meshBasic');
	video1.p.url.set(`${ASSETS_ROOT}/textures/sintel.mp4`);
	const box1 = geo1.createNode('box');
	const material1 = geo1.createNode('material');
	const actor1 = geo1.createNode('actor');

	actor1.setInput(0, material1);
	material1.setInput(0, box1);
	actor1.flags.display.set(true);
	material1.p.material.setNode(meshBasic1);
	meshBasic1.p.map.setNode(video1);
	await video1.compute();

	const onVideoEvent1 = actor1.createNode('onVideoEvent');
	const setObjectPosition1 = actor1.createNode('setObjectPosition');
	const getObjectProperty1 = actor1.createNode('getObjectProperty');
	const add1 = actor1.createNode('add');
	onVideoEvent1.p.node.setNode(video1);

	setObjectPosition1.setInput(
		ActorConnectionPointType.TRIGGER,
		onVideoEvent1,
		VIDEO_EVENT_INDICES.get(VideoEvent.PLAY)
	);
	setObjectPosition1.setInput('position', add1);
	add1.setInput(0, getObjectProperty1, 'position');
	(add1.params.get('add1') as Vector3Param).set([0, 1, 0]);

	const container = await actor1.compute();
	const object = container.coreContent()!.objects()[0];

	// wait to make sure objects are mounted to the scene
	await CoreSleep.sleep(150);

	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
		scene.play();
		assert.equal(scene.time(), 0);
		assert.equal(object.position.y, 0, 'no move');
		await CoreSleep.sleep(500);
		assert.notOk(video1.states.error.message(), 'no error');
		assert.equal(object.position.y, 0, 'no move');

		// play event
		video1.p.play.set(true);
		await CoreSleep.sleep(100);
		assert.equal(object.position.y, 1, 'move');

		video1.p.play.set(false);
		await CoreSleep.sleep(100);
		assert.equal(object.position.y, 1, 'no move');

		video1.p.play.set(true);
		await CoreSleep.sleep(100);
		assert.equal(object.position.y, 2, 'move');

		// pause event
		setObjectPosition1.setInput(
			ActorConnectionPointType.TRIGGER,
			onVideoEvent1,
			VIDEO_EVENT_INDICES.get(VideoEvent.PAUSE)
		);
		video1.p.play.set(false);
		await CoreSleep.sleep(100);
		assert.equal(object.position.y, 3, 'move');

		video1.p.play.set(true);
		await CoreSleep.sleep(100);
		assert.equal(object.position.y, 3, 'no move');

		video1.p.play.set(false);
		await CoreSleep.sleep(100);
		assert.equal(object.position.y, 4, 'move');

		video1.p.play.set(true);
		await CoreSleep.sleep(100);
		assert.equal(object.position.y, 4, 'no move');

		// volumechange event
		setObjectPosition1.setInput(
			ActorConnectionPointType.TRIGGER,
			onVideoEvent1,
			VIDEO_EVENT_INDICES.get(VideoEvent.VOLUME_CHANGE)
		);
		video1.p.muted.set(false);
		await CoreSleep.sleep(100);
		assert.equal(object.position.y, 5, 'move');

		video1.p.muted.set(true);
		await CoreSleep.sleep(100);
		assert.equal(object.position.y, 6, 'move');

		video1.p.muted.set(false);
		await CoreSleep.sleep(100);
		assert.equal(object.position.y, 7, 'move');
	});
	setTimeout(() => {
		video1.dispose();
	}, 1000);
});
