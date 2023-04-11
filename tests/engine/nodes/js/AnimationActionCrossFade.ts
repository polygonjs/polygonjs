import {ASSETS_ROOT} from '../../../../src/core/loader/AssetsUtils';
import {JsConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Js';
import {RendererUtils} from '../../../helpers/RendererUtils';
import {Quaternion} from 'three';
import {Vector3} from 'three';
import {CoreSleep} from '../../../../src/core/Sleep';
import {AnimationActionJsNode} from '../../../../src/engine/nodes/js/AnimationAction';
import {AnimationActionCrossFadeJsNodeInputName} from '../../../../src/engine/nodes/js/AnimationActionCrossFade';
import {PolyScene} from '../../../../src/engine/scene/PolyScene';
import {
	findOrCreateAnimationMixer,
	getMostActiveAnimationActionFromMixer,
} from '../../../../src/engine/functions/AnimationMixer';

function addWater(scene: PolyScene) {
	const geo2 = scene.root().createNode('geo');
	const plane = geo2.createNode('plane');
	const oceanPlane = geo2.createNode('oceanPlane');
	oceanPlane.setInput(0, plane);
	plane.p.size.set([10, 10]);

	oceanPlane.flags.display.set(true);
}

QUnit.test('js/animationActionCrossFade can fadeIn an action', async (assert) => {
	const scene = window.scene;
	await scene.waitForCooksCompleted();

	scene.root().createNode('hemisphereLight');
	addWater(scene);

	const perspective_camera1 = window.perspective_camera1;
	perspective_camera1.p.t.set([1, 1, 5]);
	const geo1 = window.geo1;
	const file1 = geo1.createNode('fileGLTF');
	file1.p.url.set(`${ASSETS_ROOT}/models/resources/quaternius/animals/Fox.gltf`);
	await file1.compute();
	const actor1 = geo1.createNode('actor');

	// const box1 = geo1.createNode('box');
	// await CoreSleep.sleep(100);
	// box1.flags.display.set(true);
	actor1.setInput(0, file1);
	// do not clone input, so that we can change input
	// and not create a different object
	actor1.io.inputs.overrideClonedState(true);

	const onTick1 = actor1.createNode('onTick');
	const animationMixer1 = actor1.createNode('animationMixer');
	const animationMixerUpdate1 = actor1.createNode('animationMixerUpdate');
	const animationActionFadeIn1 = actor1.createNode('animationActionFadeIn');
	const onManualTrigger1 = actor1.createNode('onManualTrigger');
	const onManualTrigger2 = actor1.createNode('onManualTrigger');
	animationMixerUpdate1.setInput(JsConnectionPointType.TRIGGER, onTick1);
	animationMixerUpdate1.setInput(JsConnectionPointType.ANIMATION_MIXER, animationMixer1);

	function createAnimationActionNode(clipName: string): AnimationActionJsNode {
		const animationAction = actor1.createNode('animationAction');
		animationAction.setInput(JsConnectionPointType.ANIMATION_MIXER, animationMixer1);
		animationAction.p.clipName.set(clipName);
		return animationAction;
	}
	const animationAction_Attack = createAnimationActionNode('Attack');
	const animationAction_Gallop = createAnimationActionNode('Gallop');
	const animationAction_Eating = createAnimationActionNode('Eating');
	animationActionFadeIn1.setInput(JsConnectionPointType.ANIMATION_ACTION, animationAction_Attack);
	animationActionFadeIn1.setInput(JsConnectionPointType.TRIGGER, onManualTrigger1);

	const animationActionCrossFade1 = actor1.createNode('animationActionCrossFade');
	animationActionCrossFade1.setInput(AnimationActionCrossFadeJsNodeInputName.FROM, animationAction_Attack);
	animationActionCrossFade1.setInput(AnimationActionCrossFadeJsNodeInputName.TO, animationAction_Gallop);
	animationActionCrossFade1.setInput(JsConnectionPointType.TRIGGER, onManualTrigger2);

	await actor1.compute();
	actor1.flags.display.set(true);
	// const Scene = container.coreContent()!.threejsObjects()[0];
	await CoreSleep.sleep(100);

	const t = new Vector3();
	const s = new Vector3();
	const quat0 = new Quaternion();
	const quat1 = new Quaternion();
	const quat2 = new Quaternion();
	const FrontLowerLegL = scene.threejsScene().getObjectByName('FrontLowerLegL')!;
	assert.ok(FrontLowerLegL, 'FrontLowerLegL is found');
	const Scene = scene.threejsScene().getObjectByName('Scene')!;
	assert.ok(Scene, 'Scene');

	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
		scene.play();
		assert.equal(scene.time(), 0, 'time is 0');
		FrontLowerLegL.matrix.decompose(t, quat0, s);
		onManualTrigger1.p.trigger.pressButton();

		await CoreSleep.sleep(500);
		const mixer = findOrCreateAnimationMixer(Scene)!;
		assert.ok(mixer, 'mixer found');

		assert.in_delta(scene.time(), 0.5, 0.25, 'time is 0.5 sec');
		FrontLowerLegL.matrix.decompose(t, quat1, s);
		// const angle1 = quat0.angleTo(quat1);
		// assert.in_delta(angle1, 0.07, 0.05);

		await CoreSleep.sleep(500);
		assert.in_delta(scene.time(), 1, 0.25, 'time is 1 sec');
		FrontLowerLegL.matrix.decompose(t, quat2, s);
		// const angle2 = quat1.angleTo(quat2);
		// const angle3 = quat0.angleTo(quat2);
		// assert.in_delta(angle2, 1.1, 0.2);
		// assert.in_delta(angle3, 1.2, 0.2);

		assert.equal(getMostActiveAnimationActionFromMixer(mixer).mostActiveAnimationAction.getClip().name, 'Attack');
		onManualTrigger2.p.trigger.pressButton();
		await CoreSleep.sleep(1000);
		assert.in_delta(scene.time(), 2, 0.25, 'time is 2 sec');
		assert.equal(getMostActiveAnimationActionFromMixer(mixer).mostActiveAnimationAction.getClip().name, 'Gallop');

		// test that we can crossFade again to another
		scene.batchUpdates(() => {
			animationActionCrossFade1.setInput(AnimationActionCrossFadeJsNodeInputName.FROM, animationAction_Gallop);
			animationActionCrossFade1.setInput(AnimationActionCrossFadeJsNodeInputName.TO, animationAction_Eating);
		});
		await CoreSleep.sleep(100);
		onManualTrigger2.p.trigger.pressButton();
		await CoreSleep.sleep(1900);
		assert.in_delta(scene.time(), 4, 0.25, 'time is 3 sec');
		assert.equal(getMostActiveAnimationActionFromMixer(mixer).mostActiveAnimationAction.getClip().name, 'Eating');

		// And we can come back to the initial clip
		scene.batchUpdates(() => {
			animationActionCrossFade1.setInput(AnimationActionCrossFadeJsNodeInputName.FROM, animationAction_Eating);
			animationActionCrossFade1.setInput(AnimationActionCrossFadeJsNodeInputName.TO, animationAction_Attack);
		});
		await CoreSleep.sleep(100);
		onManualTrigger2.p.trigger.pressButton();
		await CoreSleep.sleep(3000); // we need to wait longer than just 1 sec, to allow the previous clip to reach its end
		assert.in_delta(scene.time(), 7, 0.25, 'time is 6 sec');
		assert.equal(getMostActiveAnimationActionFromMixer(mixer).mostActiveAnimationAction.getClip().name, 'Attack');
	});
});
