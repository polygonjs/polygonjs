import {Mesh} from 'three';
import {CoreSleep} from '../../../../src/core/Sleep';
import {JsConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Js';
import {RendererUtils} from '../../../helpers/RendererUtils';
import {ASSETS_ROOT} from '../../../../src/core/loader/AssetsUtils';
import {SetParamJsNodeInputName} from '../../../../src/engine/nodes/js/SetParam';
import {ParamConstructorMap} from '../../../../src/engine/params/types/ParamConstructorMap';
import {ParamType} from '../../../../src/engine/poly/ParamType';

QUnit.test('js/playAudioSource', async (assert) => {
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
	const playAudioSource1 = actor1.createNode('playAudioSource');
	const setParam1 = actor1.createNode('setParam');

	playAudioSource1.setInput(JsConnectionPointType.TRIGGER, onManualTrigger1);
	setParam1.setInput(JsConnectionPointType.TRIGGER, playAudioSource1);

	setParam1.p.param.setParam(geo1.p.t.x);
	setParam1.setParamType(JsConnectionPointType.INT);
	(setParam1.params.get(SetParamJsNodeInputName.val)! as ParamConstructorMap[ParamType.INTEGER]).set(1);

	playAudioSource1.p.node.setNode(file1);
	// audio1.p.play.pressButton();

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
		await CoreSleep.sleep(2000);
		assert.equal(geo1.p.t.x.value, 0, '0');

		await CoreSleep.sleep(6000);
		assert.equal(geo1.p.t.x.value, 1, '1');
	});
});
