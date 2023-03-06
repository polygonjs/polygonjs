import {Mesh} from 'three';
import {CoreSleep} from '../../../../src/core/Sleep';
import {ActorConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Actor';
import {RendererUtils} from '../../../helpers/RendererUtils';
import {ASSETS_ROOT} from '../../../../src/core/loader/AssetsUtils';
import {SetParamActorNode} from '../../../../src/engine/nodes/actor/SetParam';
import {ParamConstructorMap} from '../../../../src/engine/params/types/ParamConstructorMap';
import {ParamType} from '../../../../src/engine/poly/ParamType';

QUnit.test('actor/pauseAudioSource', async (assert) => {
	const scene = window.scene;
	const perspective_camera1 = window.perspective_camera1;
	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');
	const actor1 = geo1.createNode('actor');

	actor1.setInput(0, box1);
	actor1.flags.display.set(true);

	// setup audio nodes
	const listener1 = scene.root().createNode('audioListener');
	const positionalAudio1 = scene.root().createNode('positionalAudio');
	await listener1.activateSound();

	const file1 = positionalAudio1.createNode('file');
	positionalAudio1.p.audioNode.setNode(file1);

	file1.p.autostart.set(0);
	file1.p.loop.set(0);

	file1.p.url.set(
		`${ASSETS_ROOT}/audio/resources/freesound/short/657826__the-sacha-rush__thoughtful-atmospheric-rapid-intro.mp3`
	);

	// setup actor node
	const onManualTrigger1 = actor1.createNode('onManualTrigger');
	const onManualTrigger2 = actor1.createNode('onManualTrigger');
	const playAudioSource1 = actor1.createNode('playAudioSource');
	const pauseAudioSource1 = actor1.createNode('pauseAudioSource');
	const setParam1 = actor1.createNode('setParam');

	playAudioSource1.setInput(ActorConnectionPointType.TRIGGER, onManualTrigger1);
	pauseAudioSource1.setInput(ActorConnectionPointType.TRIGGER, onManualTrigger2);
	setParam1.setInput(ActorConnectionPointType.TRIGGER, playAudioSource1);

	setParam1.p.param.setParam(geo1.p.t.x);
	setParam1.setParamType(ActorConnectionPointType.INTEGER);
	(setParam1.params.get(SetParamActorNode.INPUT_NAME_VAL)! as ParamConstructorMap[ParamType.INTEGER]).set(1);

	playAudioSource1.p.node.setNode(file1);
	pauseAudioSource1.p.node.setNode(file1);

	const container = await actor1.compute();
	const object = container.coreContent()!.threejsObjects()[0] as Mesh;
	assert.equal(geo1.p.t.x.value, 0, '0');

	// wait to make sure objects are mounted to the scene
	await CoreSleep.sleep(150);
	assert.equal(geo1.p.t.x.value, 0, '0');

	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
		assert.equal(object.position.y, 0);
		scene.play();
		assert.equal(scene.time(), 0);
		assert.equal(geo1.p.t.x.value, 0, '0');

		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(1000);
		assert.equal(geo1.p.t.x.value, 0, '0');

		onManualTrigger2.p.trigger.pressButton();
		assert.equal(geo1.p.t.x.value, 0, '0');

		await CoreSleep.sleep(1000);
		assert.equal(geo1.p.t.x.value, 1, '1');
	});
});
