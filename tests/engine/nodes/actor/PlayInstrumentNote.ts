import {Object3D} from 'three';
import {AttribClass} from '../../../../src/core/geometry/Constant';
import {CoreObject} from '../../../../src/core/geometry/Object';
import {CoreSleep} from '../../../../src/core/Sleep';
import {AMSynthAudioNode} from '../../../../src/engine/nodes/audio/AMSynth';
import {EnvelopeAudioNode} from '../../../../src/engine/nodes/audio/Envelope';
import {NullAudioNode} from '../../../../src/engine/nodes/audio/Null';
import {PlayInstrumentAudioNode} from '../../../../src/engine/nodes/audio/PlayInstrument';
import {AudioListenerObjNode} from '../../../../src/engine/nodes/obj/AudioListener';
import {PerspectiveCameraObjNode} from '../../../../src/engine/nodes/obj/PerspectiveCamera';
import {PositionalAudioObjNode} from '../../../../src/engine/nodes/obj/PositionalAudio';
import {ActorConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Actor';
import {RendererUtils} from '../../../helpers/RendererUtils';

function onCreateHookPositionalAudio(node: PositionalAudioObjNode, cameraNode: PerspectiveCameraObjNode) {
	const envelope1 = node.createNode(EnvelopeAudioNode);
	const AMSynth1 = node.createNode(AMSynthAudioNode);
	const playInstrument1 = node.createNode(PlayInstrumentAudioNode);
	const null1 = node.createNode(NullAudioNode);

	null1.setName('OUT');
	null1.setInput(0, playInstrument1);
	playInstrument1.setInput(0, AMSynth1);
	AMSynth1.setInput(0, envelope1);

	node.p.audioNode.setNode(null1);

	let listener: AudioListenerObjNode | undefined = node.root().audioController.audioListeners()[0];
	if (!listener) {
		listener = node.root().createNode('audioListener');
		const cameraNode = node.scene().mainCameraNode();
		if (cameraNode) {
			listener.setInput(0, cameraNode);
		}
	}
	return {null1, playInstrument1};
}

QUnit.test('actor/playInstrumentNote', async (assert) => {
	const scene = window.scene;
	const perspective_camera1 = window.perspective_camera1;
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	const line1 = geo1.createNode('line');
	line1.p.pointsCount.set(10);
	const copy1 = geo1.createNode('copy');
	copy1.setInput(0, box1);
	copy1.setInput(1, line1);
	const audioNotes1 = geo1.createNode('audioNotes');
	audioNotes1.setInput(0, copy1);
	const attribCreate1 = geo1.createNode('attribCreate');
	attribCreate1.setInput(0, audioNotes1);
	attribCreate1.setAttribClass(AttribClass.OBJECT);
	attribCreate1.p.name.set('selected');

	const actor1 = geo1.createNode('actor');

	actor1.setInput(0, attribCreate1);
	actor1.flags.display.set(true);

	const positionalAudio1 = scene.createNode('positionalAudio');
	const {null1} = onCreateHookPositionalAudio(positionalAudio1, perspective_camera1);
	const onObjectAttributeUpdate1 = actor1.createNode('onObjectAttributeUpdate');
	onObjectAttributeUpdate1.p.attribName.set('selected');
	const playInstrumentNote1 = actor1.createNode('playInstrumentNote');
	playInstrumentNote1.p.node.setNode(null1);
	playInstrumentNote1.setInput(ActorConnectionPointType.TRIGGER, onObjectAttributeUpdate1);
	const getObjectAttribute1 = actor1.createNode('getObjectAttribute');
	getObjectAttribute1.p.attribName.set('note');
	playInstrumentNote1.setInput(playInstrumentNote1.p.note.name(), getObjectAttribute1);

	const container = await actor1.compute();
	const objects = container.coreContent()!.objects();
	assert.deepEqual(
		objects.map((o: Object3D) => CoreObject.attribValue(o, 'note')),
		['C2', 'C#2', 'D2', 'D#2', 'E2', 'F2', 'F#2', 'G2', 'G#2', 'A2']
	);

	// wait to make sure objects are mounted to the scene
	await CoreSleep.sleep(150);

	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
		scene.play();
		assert.equal(scene.time(), 0);
		assert.notOk(playInstrumentNote1.__lastNote());
		CoreObject.addAttribute(objects[0], 'selected', 1);
		await CoreSleep.sleep(500);
		assert.equal(playInstrumentNote1.__lastNote(), 'C2');

		CoreObject.addAttribute(objects[1], 'selected', 1);
		await CoreSleep.sleep(500);
		assert.equal(playInstrumentNote1.__lastNote(), 'C#2');

		CoreObject.addAttribute(objects[5], 'selected', 1);
		await CoreSleep.sleep(500);
		assert.equal(playInstrumentNote1.__lastNote(), 'F2');
	});
});
