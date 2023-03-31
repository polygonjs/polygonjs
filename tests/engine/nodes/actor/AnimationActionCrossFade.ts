import {ASSETS_ROOT} from '../../../../src/core/loader/AssetsUtils';
import {ActorConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Actor';
import {RendererUtils} from '../../../helpers/RendererUtils';
import {Quaternion} from 'three';
import {Vector3} from 'three';
import {CoreSleep} from '../../../../src/core/Sleep';
import {AnimationActionActorNode} from '../../../../src/engine/nodes/actor/AnimationAction';
import {AnimationActionCrossFadeActorNodeInputName} from '../../../../src/engine/nodes/actor/AnimationActionCrossFade';
// import {getMostActiveAnimationActionFromMixer} from '../../../../src/core/actor/AnimationMixerUtils';
import {PolyScene} from '../../../../src/engine/scene/PolyScene';

function getMostActiveAnimationActionFromMixer(x: any): any {
	return [];
}

function addWater(scene: PolyScene) {
	const geo2 = scene.root().createNode('geo');
	const plane = geo2.createNode('plane');
	const oceanPlane = geo2.createNode('oceanPlane');
	oceanPlane.setInput(0, plane);
	plane.p.size.set([10, 10]);

	oceanPlane.flags.display.set(true);
}

QUnit.test('actor/animationActionCrossFade can fadeIn an action', async (assert) => {
	const scene = window.scene;

	scene.root().createNode('hemisphereLight');
	addWater(scene);

	const perspective_camera1 = window.perspective_camera1;
	perspective_camera1.p.t.set([1, 1, 5]);
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
	animationMixerUpdate1.setInput(ActorConnectionPointType.TRIGGER, onTick1);
	animationMixerUpdate1.setInput(ActorConnectionPointType.ANIMATION_MIXER, animationMixer1);

	function createAnimationActionNode(clipName: string): AnimationActionActorNode {
		const animationAction = actor1.createNode('animationAction');
		animationAction.setInput(ActorConnectionPointType.ANIMATION_MIXER, animationMixer1);
		animationAction.p.clipName.set(clipName);
		return animationAction;
	}
	const animationAction_Attack = createAnimationActionNode('Attack');
	const animationAction_Gallop = createAnimationActionNode('Gallop');
	const animationAction_Eating = createAnimationActionNode('Eating');
	animationActionFadeIn1.setInput(ActorConnectionPointType.ANIMATION_ACTION, animationAction_Attack);

	const animationActionCrossFade1 = actor1.createNode('animationActionCrossFade');
	animationActionCrossFade1.setInput(AnimationActionCrossFadeActorNodeInputName.FROM, animationAction_Attack);
	animationActionCrossFade1.setInput(AnimationActionCrossFadeActorNodeInputName.TO, animationAction_Gallop);

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
		animationActionFadeIn1.p.trigger.pressButton();

		await CoreSleep.sleep(500);
		const mixer = animationMixer1.getAnimationMixer(Scene)!;
		assert.ok(mixer);

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
		animationActionCrossFade1.p.trigger.pressButton();
		await CoreSleep.sleep(1000);
		assert.in_delta(scene.time(), 2, 0.25, 'time is 2 sec');
		assert.equal(getMostActiveAnimationActionFromMixer(mixer).mostActiveAnimationAction.getClip().name, 'Gallop');

		// test that we can crossFade again to another
		animationActionCrossFade1.setInput(AnimationActionCrossFadeActorNodeInputName.FROM, animationAction_Gallop);
		animationActionCrossFade1.setInput(AnimationActionCrossFadeActorNodeInputName.TO, animationAction_Eating);
		animationActionCrossFade1.p.trigger.pressButton();
		await CoreSleep.sleep(1000);
		assert.in_delta(scene.time(), 3, 0.25, 'time is 3 sec');
		assert.equal(getMostActiveAnimationActionFromMixer(mixer).mostActiveAnimationAction.getClip().name, 'Eating');

		// And we can come back to the initial clip
		animationActionCrossFade1.setInput(AnimationActionCrossFadeActorNodeInputName.FROM, animationAction_Eating);
		animationActionCrossFade1.setInput(AnimationActionCrossFadeActorNodeInputName.TO, animationAction_Attack);
		animationActionCrossFade1.p.trigger.pressButton();
		await CoreSleep.sleep(3000); // we need to wait longer than just 1 sec, to allow the previous clip to reach its end
		assert.in_delta(scene.time(), 6, 0.25, 'time is 6 sec');
		assert.equal(getMostActiveAnimationActionFromMixer(mixer).mostActiveAnimationAction.getClip().name, 'Attack');
	});
});
