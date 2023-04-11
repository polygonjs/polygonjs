import {ASSETS_ROOT} from '../../../../src/core/loader/AssetsUtils';
import {JsConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Js';
import {RendererUtils} from '../../../helpers/RendererUtils';
import {CoreSleep} from '../../../../src/core/Sleep';
import {AnimationActionJsNode} from '../../../../src/engine/nodes/js/AnimationAction';
import {
	findOrCreateAnimationMixer,
	existingAnimationActionsFromAnimationMixer,
} from '../../../../src/engine/functions/AnimationMixer';

QUnit.test('js/animationActionFadeOut', async (assert) => {
	const scene = window.scene;
	const perspective_camera1 = window.perspective_camera1;
	const geo1 = window.geo1;
	const file1 = geo1.createNode('fileGLTF');
	file1.p.url.set(`${ASSETS_ROOT}/models/resources/quaternius/animals/Fox.gltf`);
	const actor1 = geo1.createNode('actor');

	actor1.setInput(0, file1);
	actor1.flags.display.set(true);
	actor1.io.inputs.overrideClonedState(true);
	await actor1.compute();

	const onTick1 = actor1.createNode('onTick');
	const animationMixer1 = actor1.createNode('animationMixer');
	const animationMixerUpdate1 = actor1.createNode('animationMixerUpdate');
	const animationActionFadeIn1 = actor1.createNode('animationActionFadeIn');
	const animationActionFadeOut1 = actor1.createNode('animationActionFadeOut');
	const animationActionPlay1 = actor1.createNode('animationActionPlay');
	const onManualTrigger1 = actor1.createNode('onManualTrigger');
	const onManualTrigger2 = actor1.createNode('onManualTrigger');
	const onManualTrigger3 = actor1.createNode('onManualTrigger');
	animationMixerUpdate1.setInput(JsConnectionPointType.TRIGGER, onTick1);
	animationMixerUpdate1.setInput(JsConnectionPointType.ANIMATION_MIXER, animationMixer1);

	function createAnimationActionNode(clipName: string): AnimationActionJsNode {
		const animationAction = actor1.createNode('animationAction');
		animationAction.setInput(JsConnectionPointType.ANIMATION_MIXER, animationMixer1);
		animationAction.p.clipName.set(clipName);
		return animationAction;
	}
	const animationAction_Attack = createAnimationActionNode('Attack');
	const animationAction_Death = createAnimationActionNode('Death');
	animationActionFadeIn1.setInput(JsConnectionPointType.ANIMATION_ACTION, animationAction_Attack);
	animationActionFadeOut1.setInput(JsConnectionPointType.ANIMATION_ACTION, animationAction_Attack);
	animationActionPlay1.setInput(JsConnectionPointType.ANIMATION_ACTION, animationAction_Death);
	animationActionFadeIn1.setInput(JsConnectionPointType.TRIGGER, onManualTrigger1);
	animationActionFadeOut1.setInput(JsConnectionPointType.TRIGGER, onManualTrigger2);
	animationActionPlay1.setInput(JsConnectionPointType.TRIGGER, onManualTrigger3);

	const FrontLowerLegL = scene.threejsScene().getObjectByName('FrontLowerLegL')!;
	assert.ok(FrontLowerLegL, 'FrontLowerLegL is found');
	const Scene = scene.threejsScene().getObjectByName('Scene')!;
	assert.ok(Scene, 'Scene');

	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
		scene.play();
		assert.equal(scene.time(), 0, 'time is 0');
		onManualTrigger1.p.trigger.pressButton();

		await CoreSleep.sleep(500);
		const mixer = findOrCreateAnimationMixer(Scene)!;
		assert.ok(mixer);

		assert.in_delta(scene.time(), 0.5, 0.25, 'time is 0.5 sec');
		assert.in_delta(existingAnimationActionsFromAnimationMixer(mixer)[0].getEffectiveWeight(), 0.5, 0.1);
		assert.deepEqual(
			existingAnimationActionsFromAnimationMixer(mixer).map((a) => a.getClip().name),
			['Attack']
		);

		onManualTrigger3.p.trigger.pressButton();
		await CoreSleep.sleep(500);
		assert.in_delta(scene.time(), 1, 0.25, 'time is 1 sec');
		assert.in_delta(existingAnimationActionsFromAnimationMixer(mixer)[0].getEffectiveWeight(), 1, 0.1);
		assert.deepEqual(
			existingAnimationActionsFromAnimationMixer(mixer).map((a) => a.getClip().name),
			['Attack', 'Death']
		);

		onManualTrigger2.p.trigger.pressButton();
		await CoreSleep.sleep(500);
		assert.in_delta(scene.time(), 1.5, 0.25, 'time is 1.5 sec');
		assert.in_delta(existingAnimationActionsFromAnimationMixer(mixer)[0].getEffectiveWeight(), 0.5, 0.1);
		assert.deepEqual(
			existingAnimationActionsFromAnimationMixer(mixer).map((a) => a.getClip().name),
			['Attack', 'Death']
		);
	});
});
