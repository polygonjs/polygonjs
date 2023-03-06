import {CoreSleep} from '../../../../src/core/Sleep';
import {AnimationsNetworkActorNode} from '../../../../src/engine/nodes/actor/AnimationsNetwork';
import {ActorConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Actor';
import {RendererUtils} from '../../../helpers/RendererUtils';

function onCreateHookAnimationNetwork(node: AnimationsNetworkActorNode) {
	const duration = node.createNode('duration');
	const easing = node.createNode('easing');
	const target = node.createNode('target');
	const propertyName = node.createNode('propertyName');
	const propertyValue = node.createNode('propertyValue');
	const propertyValueReset = node.createNode('propertyValue');
	const end = node.createNode('null');
	const start = node.createNode('null');
	const play = node.createNode('play');

	end.setName('PLAY');
	start.setName('RESET');
	play.setName('CONTROLS');

	duration.p.duration.set(0.3);
	easing.setInput(0, duration);
	target.setInput(0, easing);
	propertyName.setInput(0, target);
	propertyValue.setInput(0, propertyName);
	propertyValue.p.value3.set([0, 1, 0]);
	propertyValueReset.setInput(0, propertyName);
	end.setInput(0, propertyValue);
	start.setInput(0, propertyValueReset);
	play.setInput(0, start);
	play.setInput(1, end);

	return {end};
}

QUnit.test('actor/playAnimation', async (assert) => {
	const scene = window.scene;
	const perspective_camera1 = window.perspective_camera1;
	const geo1 = window.geo1;
	const sphere1 = geo1.createNode('sphere');
	const actor1 = geo1.createNode('actor');

	actor1.setInput(0, sphere1);
	actor1.flags.display.set(true);

	const animationsNetwork1 = actor1.createNode('animationsNetwork');
	const {end} = onCreateHookAnimationNetwork(animationsNetwork1);
	const onManualTrigger1 = actor1.createNode('onManualTrigger');
	const playAnimation1 = actor1.createNode('playAnimation');
	playAnimation1.p.node.setNode(end);
	playAnimation1.setInput(ActorConnectionPointType.TRIGGER, onManualTrigger1);

	const container = await actor1.compute();
	const object = container.coreContent()!.threejsObjects()[0];

	// wait to make sure objects are mounted to the scene
	await CoreSleep.sleep(150);

	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
		scene.play();
		assert.equal(scene.time(), 0);
		assert.equal(object.position.y, 0);
		await CoreSleep.sleep(500);
		assert.in_delta(scene.time(), 0.5, 0.25, 'time is half second');
		assert.equal(object.position.y, 0);
		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(500);
		assert.in_delta(scene.time(), 1.0, 0.25, 'time is one sec');
		assert.in_delta(object.position.y, 1, 0.1);
	});
});
