import {Object3D} from 'three';
import {BaseAudioNodeType} from '../nodes/audio/_Base';
import {NodeContext} from '../poly/NodeContext';
import {PolyScene} from '../scene/PolyScene';
import {ObjectNamedFunction1, ObjectNamedFunction3} from './_Base';
import {Player} from 'tone/build/esm/source/buffer/Player';
import {AudioPlayerCallbacksManager} from '../../core/audio/PlayerCallbacksManager';
import {CoreObject} from '../../core/geometry/Object';

const AUDIO_COMPLETED_EVENT_NAME = 'onAudioCompleted';
const EVENT_AUDIO_COMPLETED = {type: AUDIO_COMPLETED_EVENT_NAME};
export const AUDIO_ATTRIB_NAME_LAST_INSTRUMENT_TYPE = '__lastInstrumentType__';
export const AUDIO_ATTRIB_NAME_LAST_NOTE = '__lastNote__';

async function getAudioSource(scene: PolyScene, nodePath: string): Promise<Player | undefined> {
	const audioNode = scene.node(nodePath);
	if (!audioNode) {
		return;
	}
	if (audioNode.context() != NodeContext.AUDIO) {
		return;
	}
	const container = await (audioNode as BaseAudioNodeType).compute();
	const audioBuilder = container.coreContent();
	if (!audioBuilder) {
		return;
	}
	const source = audioBuilder.source();
	if (!source) {
		return;
	}
	if (!(source instanceof Player)) {
		return;
	}
	return source;
}

export class playAudioSource extends ObjectNamedFunction1<[string]> {
	static override type() {
		return 'playAudioSource';
	}
	func(object3D: Object3D, nodePath: string): void {
		getAudioSource(this.scene, nodePath).then((source) => {
			if (!source) {
				return;
			}
			source.start();
			AudioPlayerCallbacksManager.onStop(source, () => {
				object3D.dispatchEvent(EVENT_AUDIO_COMPLETED);
			});
			object3D.addEventListener(AUDIO_COMPLETED_EVENT_NAME, () => {
				//
			});
		});
	}
}

export class pauseAudioSource extends ObjectNamedFunction1<[string]> {
	static override type() {
		return 'pauseAudioSource';
	}
	func(object3D: Object3D, nodePath: string): void {
		getAudioSource(this.scene, nodePath).then((source) => {
			if (!source) {
				return;
			}
			source.stop();
		});
	}
}

export class playInstrumentNote extends ObjectNamedFunction3<[string, string, number]> {
	static override type() {
		return 'playInstrumentNote';
	}
	func(object3D: Object3D, nodePath: string, note: string, duration: number): void {
		const audioNode = this.scene.node(nodePath);
		if (!audioNode) {
			return;
		}
		if (audioNode.context() != NodeContext.AUDIO) {
			return;
		}
		audioNode.compute().then((container) => {
			const audioBuilder = container.coreContent();
			if (!audioBuilder) {
				return;
			}
			const instrument = audioBuilder.instrument();
			if (!instrument) {
				return;
			}
			const lastInstrumentType = instrument.triggerAttackRelease(note, duration);
			// used for tests
			const lastNote = note;
			CoreObject.addAttribute(object3D, AUDIO_ATTRIB_NAME_LAST_INSTRUMENT_TYPE, lastInstrumentType);
			CoreObject.addAttribute(object3D, AUDIO_ATTRIB_NAME_LAST_NOTE, lastNote);
		});
	}
}
