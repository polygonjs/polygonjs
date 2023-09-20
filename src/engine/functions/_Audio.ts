import {Object3D} from 'three';
import type {BaseAudioNodeType} from '../nodes/audio/_Base';
import {NodeContext} from '../poly/NodeContext';
import type {PolyScene} from '../scene/PolyScene';
import {NamedFunction3, ObjectNamedFunction1, ObjectNamedFunction3} from './_Base';
import {Player} from 'tone/build/esm/source/buffer/Player';
import {AudioPlayerCallbacksManager} from '../../core/audio/PlayerCallbacksManager';
import {ThreejsCoreObject} from '../../core/geometry/modules/three/ThreejsCoreObject';
import type {ActorEvaluator} from '../nodes/js/code/assemblers/actor/ActorEvaluator';

// const AUDIO_COMPLETED_EVENT_NAME = 'onAudioCompleted';
// const EVENT_AUDIO_COMPLETED = {type: AUDIO_COMPLETED_EVENT_NAME};
export const AUDIO_ATTRIB_NAME_LAST_INSTRUMENT_TYPE = '__lastInstrumentType__';
export const AUDIO_ATTRIB_NAME_LAST_NOTE = '__lastNote__';

type Listener = () => void;

const listenersByAudioSource: Map<string, Set<Listener>> = new Map();
function onAudioSourceStop(nodePath: string, listener: Listener) {
	let listeners = listenersByAudioSource.get(nodePath);
	if (!listeners) {
		listeners = new Set();
		listenersByAudioSource.set(nodePath, listeners);
	}
	listeners.add(listener);
}
function removeAudioSourceStopListener(nodePath: string, listener: Listener) {
	const listeners = listenersByAudioSource.get(nodePath);
	if (!listeners) {
		return;
	}
	listeners.delete(listener);
}
function dispatchAudioSourceStop(nodePath: string) {
	const listeners = listenersByAudioSource.get(nodePath);
	if (!listeners) {
		return;
	}
	listeners.forEach((listener) => {
		listener();
	});
}

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

export class addAudioStopEventListener extends NamedFunction3<[string, Listener, ActorEvaluator]> {
	static override type() {
		return 'addAudioStopEventListener';
	}
	func(nodePath: string, listener: Listener, evaluator: ActorEvaluator): void {
		onAudioSourceStop(nodePath, listener);

		evaluator.onDispose(() => {
			removeAudioSourceStopListener(nodePath, listener);
		});
	}
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
				dispatchAudioSourceStop(nodePath);
				// object3D.dispatchEvent(EVENT_AUDIO_COMPLETED);
			});
			// object3D.addEventListener(AUDIO_COMPLETED_EVENT_NAME, onStop);
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
			ThreejsCoreObject.addAttribute(object3D, AUDIO_ATTRIB_NAME_LAST_INSTRUMENT_TYPE, lastInstrumentType);
			ThreejsCoreObject.addAttribute(object3D, AUDIO_ATTRIB_NAME_LAST_NOTE, lastNote);
		});
	}
}
