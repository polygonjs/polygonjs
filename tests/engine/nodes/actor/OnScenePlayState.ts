import {Mesh} from 'three';
import {CoreSleep} from '../../../../src/core/Sleep';
import {OnScenePlayStateActorNode} from '../../../../src/engine/nodes/actor/OnScenePlayState';
import {ActorConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Actor';
import {RendererUtils} from '../../../helpers/RendererUtils';

QUnit.test('actor/onScenePlayState', async (assert) => {
	const scene = window.scene;
	const perspective_camera1 = window.perspective_camera1;
	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');
	const actor1 = geo1.createNode('actor');

	actor1.setInput(0, box1);
	actor1.flags.display.set(true);

	const onScenePlayState1 = actor1.createNode('onScenePlayState');
	const setObjectPosition1 = actor1.createNode('setObjectPosition');
	const setObjectPosition2 = actor1.createNode('setObjectPosition');

	setObjectPosition1.setInput(
		ActorConnectionPointType.TRIGGER,
		onScenePlayState1,
		OnScenePlayStateActorNode.OUTPUT_NAME_PLAY
	);
	setObjectPosition2.setInput(
		ActorConnectionPointType.TRIGGER,
		onScenePlayState1,
		OnScenePlayStateActorNode.OUTPUT_NAME_PAUSE
	);

	setObjectPosition1.p.position.set([0, 1, 0]);
	setObjectPosition2.p.position.set([0, -1, 0]);

	const container = await actor1.compute();
	const object = container.coreContent()!.threejsObjects()[0] as Mesh;

	// wait to make sure objects are mounted to the scene
	await CoreSleep.sleep(150);

	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
		assert.equal(object.position.y, 0);
		scene.play();
		assert.equal(scene.time(), 0);
		await CoreSleep.sleep(200);
		assert.equal(object.position.y, 1, 'object moved to 1');

		scene.pause();
		await CoreSleep.sleep(200);
		assert.equal(object.position.y, -1, 'object moved to -1');
	});
});
