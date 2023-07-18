import {Object3D} from 'three';
import {AttribClass} from '../../../../src/core/geometry/Constant';
import {CoreObject} from '../../../../src/core/geometry/Object';
import {CoreSleep} from '../../../../src/core/Sleep';
import {AUDIO_ATTRIB_NAME_LAST_NOTE} from '../../../../src/engine/functions/_Audio';
import {AMSynthAudioNode} from '../../../../src/engine/nodes/audio/AMSynth';
import {EnvelopeAudioNode} from '../../../../src/engine/nodes/audio/Envelope';
import {NullAudioNode} from '../../../../src/engine/nodes/audio/Null';
import {PlayInstrumentAudioNode} from '../../../../src/engine/nodes/audio/PlayInstrument';
import {AudioListenerObjNode} from '../../../../src/engine/nodes/obj/AudioListener';
import {PerspectiveCameraObjNode} from '../../../../src/engine/nodes/obj/PerspectiveCamera';
import {PositionalAudioObjNode} from '../../../../src/engine/nodes/obj/PositionalAudio';
import {JsConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Js';
import {RendererUtils} from '../../../helpers/RendererUtils';
import {StringParam} from '../../../../src/engine/params/String';

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
		// const cameraNode = node.scene().mainCameraNode();
		// if (cameraNode) {
		// 	listener.setInput(0, cameraNode);
		// }
	}
	return {null1, playInstrument1};
}

QUnit.test('js/playInstrumentNote', async (assert) => {
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
	const playInstrumentNote1 = actor1.createNode('playInstrumentNote');
	const getObjectAttribute1 = actor1.createNode('getObjectAttribute');
	onObjectAttributeUpdate1.setAttribName('selected');
	onObjectAttributeUpdate1.setAttribType(JsConnectionPointType.INT);
	getObjectAttribute1.setAttribName('note');
	getObjectAttribute1.setAttribType(JsConnectionPointType.STRING);
	(getObjectAttribute1.params.get('defaultString') as StringParam).set('haha');
	playInstrumentNote1.p.node.setNode(null1);
	playInstrumentNote1.setInput(JsConnectionPointType.TRIGGER, onObjectAttributeUpdate1);
	playInstrumentNote1.setInput(playInstrumentNote1.p.note.name(), getObjectAttribute1);

	const container = await actor1.compute();
	const objects = container.coreContent()!.threejsObjects();
	assert.deepEqual(
		objects.map((o: Object3D) => CoreObject.attribValue(o, 'note')),
		['C2', 'C#2', 'D2', 'D#2', 'E2', 'F2', 'F#2', 'G2', 'G#2', 'A2']
	);
	function lastNote(index: number) {
		return CoreObject.attribValue(objects[index], AUDIO_ATTRIB_NAME_LAST_NOTE) as string;
	}

	// wait to make sure objects are mounted to the scene
	await CoreSleep.sleep(150);

	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
		scene.play();
		assert.equal(scene.time(), 0);
		assert.notOk(lastNote(0));
		CoreObject.addAttribute(objects[0], 'selected', 1);
		await CoreSleep.sleep(500);
		assert.equal(lastNote(0), 'C2');

		CoreObject.addAttribute(objects[1], 'selected', 1);
		await CoreSleep.sleep(500);
		assert.equal(lastNote(1), 'C#2');

		CoreObject.addAttribute(objects[5], 'selected', 1);
		await CoreSleep.sleep(500);
		assert.equal(lastNote(5), 'F2');
	});
});
