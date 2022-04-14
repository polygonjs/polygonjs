import {ASSETS_ROOT} from '../../../../src/core/loader/AssetsUtils';
import {ActorConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Actor';
import {RendererUtils} from '../../../helpers/RendererUtils';
import {CoreSleep} from '../../../../src/core/Sleep';
import {AnimationActionActorNode} from '../../../../src/engine/nodes/actor/AnimationAction';
import {getMostActiveAnimationActionFromMixer} from '../../../../src/core/actor/AnimationMixerUtils';

QUnit.test('actor/animationActionStop', async (assert) => {
	const scene = window.scene;
	const perspective_camera1 = window.perspective_camera1;
	const geo1 = window.geo1;
	const file1 = geo1.createNode('fileGLTF');
	file1.p.url.set(`${ASSETS_ROOT}/models/resources/quaternius/animals/Fox.gltf`);
	const actor1 = geo1.createNode('actor');

	actor1.setInput(0, file1);
	actor1.flags.display.set(true);
	await actor1.compute();

	const onTick1 = actor1.createNode('onTick');
	const animationMixer1 = actor1.createNode('animationMixer');
	const animationMixerUpdate1 = actor1.createNode('animationMixerUpdate');
	const animationActionFadeIn1 = actor1.createNode('animationActionFadeIn');
	const animationActionStop1 = actor1.createNode('animationActionStop');
	animationMixerUpdate1.setInput(ActorConnectionPointType.TRIGGER, onTick1);
	animationMixerUpdate1.setInput(ActorConnectionPointType.ANIMATION_MIXER, animationMixer1);

	function createAnimationActionNode(clipName: string): AnimationActionActorNode {
		const animationAction = actor1.createNode('animationAction');
		animationAction.setInput(ActorConnectionPointType.ANIMATION_MIXER, animationMixer1);
		animationAction.p.clipName.set(clipName);
		return animationAction;
	}
	const animationAction_Attack = createAnimationActionNode('Attack');
	animationActionFadeIn1.setInput(ActorConnectionPointType.ANIMATION_ACTION, animationAction_Attack);
	animationActionStop1.setInput(ActorConnectionPointType.ANIMATION_ACTION, animationAction_Attack);

	const FrontLowerLegL = scene.threejsScene().getObjectByName('FrontLowerLegL')!;
	assert.ok(FrontLowerLegL, 'FrontLowerLegL is found');
	const Scene = scene.threejsScene().getObjectByName('Scene')!;
	assert.ok(Scene, 'Scene');

	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
		scene.play();
		assert.equal(scene.time(), 0, 'time is 0');
		animationActionFadeIn1.p.trigger.pressButton();
		await CoreSleep.sleep(500);

		const mixer = animationMixer1.getAnimationMixer(Scene)!;
		assert.ok(mixer);
		assert.in_delta(scene.time(), 0.5, 0.25, 'time is 0.5 sec');

		await CoreSleep.sleep(500);
		assert.in_delta(scene.time(), 1, 0.25, 'time is 1 sec');

		const animationAction = getMostActiveAnimationActionFromMixer(mixer).mostActiveAnimationAction;
		assert.equal(animationAction.getClip().name, 'Attack', 'clip is Attack');

		assert.ok(animationAction.isRunning(), 'is running');
		animationActionStop1.p.trigger.pressButton();
		await CoreSleep.sleep(200);
		assert.notOk(animationAction.isRunning(), 'not running');
	});
});
