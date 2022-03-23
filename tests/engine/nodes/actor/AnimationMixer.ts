import {ASSETS_ROOT} from '../../../../src/core/loader/AssetsUtils';
import {ActorConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Actor';
import {RendererUtils} from '../../../helpers/RendererUtils';
import {Quaternion} from 'three/src/math/Quaternion';
import {Vector3} from 'three/src/math/Vector3';
import {CoreSleep} from '../../../../src/core/Sleep';

QUnit.test('actor/animationMixer can fadeIn an action', async (assert) => {
	const scene = window.scene;
	const perspective_camera1 = window.perspective_camera1;
	const geo1 = window.geo1;
	const file1 = geo1.createNode('fileGLTF');
	file1.p.url.set(`${ASSETS_ROOT}/models/resources/quaternius/animals/Fox.gltf`);
	const actor1 = geo1.createNode('actor');

	actor1.setInput(0, file1);
	actor1.flags.display.set(true);
	await actor1.compute();

	const onEventTick1 = actor1.createNode('onEventTick');
	const animationMixer1 = actor1.createNode('animationMixer');
	const animationMixerUpdate1 = actor1.createNode('animationMixerUpdate');
	animationMixerUpdate1.setInput(ActorConnectionPointType.TRIGGER, onEventTick1);
	animationMixerUpdate1.setInput(ActorConnectionPointType.ANIMATION_MIXER, animationMixer1);
	const animationAction1 = actor1.createNode('animationAction');
	animationAction1.setInput(ActorConnectionPointType.ANIMATION_MIXER, animationMixer1);
	animationAction1.p.clipName.set('Attack');
	const animationActionFadeIn1 = actor1.createNode('animationActionFadeIn');
	animationActionFadeIn1.setInput(ActorConnectionPointType.ANIMATION_ACTION, animationAction1);

	const t = new Vector3();
	const s = new Vector3();
	const quat0 = new Quaternion();
	const quat1 = new Quaternion();
	const quat2 = new Quaternion();
	const FrontLowerLegL = scene.threejsScene().getObjectByName('FrontLowerLegL')!;
	assert.ok(FrontLowerLegL, 'FrontLowerLegL is found');

	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
		scene.play();
		assert.equal(scene.time(), 0, 'time is 0');
		FrontLowerLegL.matrix.decompose(t, quat0, s);
		animationActionFadeIn1.p.trigger.pressButton();
		await CoreSleep.sleep(500);
		assert.in_delta(scene.time(), 0.5, 0.25, 'time is half second');
		FrontLowerLegL.matrix.decompose(t, quat1, s);
		const angle1 = quat0.angleTo(quat1);
		assert.in_delta(angle1, 0.07, 0.05);
		await CoreSleep.sleep(500);
		assert.in_delta(scene.time(), 1, 0.25, 'time is one sec');
		FrontLowerLegL.matrix.decompose(t, quat2, s);
		const angle2 = quat1.angleTo(quat2);
		const angle3 = quat0.angleTo(quat2);
		assert.in_delta(angle2, 1.1, 0.2);
		assert.in_delta(angle3, 1.2, 0.2);
		// assert.in_delta(object.position.y, 5.5, 1);
	});
});
