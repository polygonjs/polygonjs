import {ASSETS_ROOT} from '../../../../src/core/loader/AssetsUtils';
import {ActorConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Actor';
import {RendererUtils} from '../../../helpers/RendererUtils';
import {Quaternion} from 'three';
import {Vector3} from 'three';
import {CoreSleep} from '../../../../src/core/Sleep';
import {AnimationActionActorNode} from '../../../../src/engine/nodes/actor/AnimationAction';
import {getMostActiveAnimationActionFromMixer} from '../../../../src/core/actor/AnimationMixerUtils';
import {PolyScene} from '../../../../src/engine/scene/PolyScene';

function addReflector(scene: PolyScene) {
	const geo2 = scene.root().createNode('geo');
	const plane = geo2.createNode('plane');
	const reflector = geo2.createNode('reflector');
	reflector.setInput(0, plane);
	plane.p.size.set([10, 10]);

	reflector.flags.display.set(true);
}

QUnit.test('actor/animationMixer can fadeIn an action', async (assert) => {
	const scene = window.scene;

	scene.root().createNode('hemisphereLight');
	addReflector(scene);

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
	const switch1 = actor1.createNode('switch');
	animationMixerUpdate1.setInput(ActorConnectionPointType.TRIGGER, onTick1);
	animationMixerUpdate1.setInput(ActorConnectionPointType.ANIMATION_MIXER, animationMixer1);

	function createAnimationActionNode(clipName: string): AnimationActionActorNode {
		const animationAction = actor1.createNode('animationAction');
		animationAction.setInput(ActorConnectionPointType.ANIMATION_MIXER, animationMixer1);
		animationAction.p.clipName.set(clipName);
		return animationAction;
	}
	const animationAction_Attack = createAnimationActionNode('Attack');
	const animationAction_Death = createAnimationActionNode('Death');
	const animationAction_Gallop = createAnimationActionNode('Gallop');
	switch1.setInput(1, animationAction_Attack);
	switch1.setInput(2, animationAction_Death);
	switch1.setInput(3, animationAction_Gallop);
	animationActionFadeIn1.setInput(ActorConnectionPointType.ANIMATION_ACTION, switch1);

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
		const angle1 = quat0.angleTo(quat1);
		assert.in_delta(angle1, 0.2, 0.15);
		await CoreSleep.sleep(500);
		assert.in_delta(scene.time(), 1, 0.25, 'time is 1 sec');
		FrontLowerLegL.matrix.decompose(t, quat2, s);
		const angle2 = quat1.angleTo(quat2);
		const angle3 = quat0.angleTo(quat2);
		assert.in_delta(angle2, 1.1, 0.2);
		assert.in_delta(angle3, 1.2, 0.2);
		// assert.in_delta(object.position.y, 5.5, 1);

		assert.equal(
			getMostActiveAnimationActionFromMixer(mixer).mostActiveAnimationAction.getClip().name,
			'Attack',
			'clip is Attach'
		);

		// fadeIn into another clip
		switch1.params.get('index')!.set(1);
		animationActionFadeIn1.p.trigger.pressButton();
		await CoreSleep.sleep(1000);
		assert.in_delta(scene.time(), 2, 0.25, 'time is 2 sec');
		assert.equal(
			getMostActiveAnimationActionFromMixer(mixer).mostActiveAnimationAction.getClip().name,
			'Death',
			'clip is Death'
		);

		// fadeIn into another clip again
		switch1.params.get('index')!.set(2);
		animationActionFadeIn1.p.trigger.pressButton();
		await CoreSleep.sleep(2000);
		assert.in_delta(scene.time(), 4, 0.25, 'time is 4 sec');
		assert.equal(
			getMostActiveAnimationActionFromMixer(mixer).mostActiveAnimationAction.getClip().name,
			'Gallop',
			'clip is Gallop'
		);

		// fadeIn into the original clip
		switch1.params.get('index')!.set(0);
		animationActionFadeIn1.p.trigger.pressButton();
		await CoreSleep.sleep(4000);
		assert.in_delta(scene.time(), 8, 0.25, 'time is 8 sec');
		assert.equal(
			getMostActiveAnimationActionFromMixer(mixer).mostActiveAnimationAction.getClip().name,
			'Attack',
			'clip is back to Attach'
		);
	});
});
