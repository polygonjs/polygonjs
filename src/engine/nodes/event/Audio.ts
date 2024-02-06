/**
 * Starts an audio node
 *
 *
 *
 */
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {TypedEventNode} from './_Base';
import {EventConnectionPoint, EventConnectionPointType} from '../utils/io/connections/Event';
import {BaseNodeType} from '../_Base';
import {ALL_NOTES, DEFAULT_NOTE} from '../../../core/audio/Notes';
import {NodeContext} from '../../poly/NodeContext';
import {AudioListenerObjNode} from '../obj/AudioListener';
import {Player} from 'tone/build/esm/source/buffer/Player';
import {AudioPlayerCallbacksManager} from './../../../core/audio/PlayerCallbacksManager';
import { EventContext } from '../../../core/event/EventContextType';

export enum AudioEventOutput {
	ON_STOP = 'onStop',
}

class AudioEventParamsConfig extends NodeParamsConfig {
	/** @parm audio node */
	audio = ParamConfig.NODE_PATH('', {
		nodeSelection: {context: NodeContext.AUDIO},
		dependentOnFoundNode: false,
	});
	/** @param note */
	note = ParamConfig.STRING(DEFAULT_NOTE, {
		menuString: {
			entries: ALL_NOTES.sort().map((note) => {
				return {value: note, name: note};
			}),
		},
		cook: false,
	});
	/** @param duration */
	duration = ParamConfig.FLOAT(0.125, {
		range: [0, 1],
		rangeLocked: [true, false],
		cook: false,
	});
	/** @param button to presse to trigger the event */
	play = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			AudioEventNode.PARAM_CALLBACK_play(node as AudioEventNode);
		},
	});
	/** @param button to presse to trigger the event */
	// stop = ParamConfig.BUTTON(null, {
	// 	callback: (node: BaseNodeType) => {
	// 		AudioEventNode.PARAM_CALLBACK_stop(node as AudioEventNode);
	// 	},
	// });
}
const ParamsConfig = new AudioEventParamsConfig();

export class AudioEventNode extends TypedEventNode<AudioEventParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'audio';
	}
	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new EventConnectionPoint('play', EventConnectionPointType.BASE, this._triggerPlay.bind(this)),
			// new EventConnectionPoint('stop', EventConnectionPointType.BASE, this._triggerPlay.bind(this)),
		]);
		this.io.outputs.setNamedOutputConnectionPoints([
			new EventConnectionPoint(AudioEventOutput.ON_STOP, EventConnectionPointType.BASE),
		]);
	}

	// private _previousNote: string | undefined;
	private _sourcePlayer: Player | undefined;
	private _triggerPlay(context: EventContext<Event>) {
		this._play();
	}
	private async _play() {
		if (!AudioListenerObjNode.soundActivated()) {
			console.warn('sound not activated');
			return;
		}
		this.states.error.clear();

		const playable = await this._getPlayable();
		if (!playable) {
			return;
		}
		const {instrument, source} = playable;
		if (!(instrument || source)) {
			return;
		}

		// await AudioController.start();

		// if (this._previousNote) {
		// 	// instrument.triggerRelease(this._previousNote);
		// }

		if (instrument) {
			const note = this.pv.note;
			if (note == '') {
				// we test the note value,
				// as it could resolve to nothing if it is tied to an expression wchih returns nothing
				return;
			}
			instrument.triggerAttackRelease(note, this.pv.duration);
			// this._previousNote = note;
		} else {
			if (source) {
				if (source instanceof Player) {
					this._sourcePlayer = source;
					this._addPlayerEvent(source);
					source.start();
				}
			}
		}
	}
	override dispose(): void {
		super.dispose();
		this._removePlayerEvent();
	}
	private _addPlayerEvent(sourcePlayer: Player) {
		AudioPlayerCallbacksManager.onStop(sourcePlayer, this._onSourcePlayerStopBound);
	}
	private _removePlayerEvent() {
		if (!this._sourcePlayer) {
			return;
		}
		AudioPlayerCallbacksManager.removeOnStop(this._sourcePlayer, this._onSourcePlayerStopBound);
	}
	private _onSourcePlayerStopBound = this._onSourcePlayerStop.bind(this);
	private _onSourcePlayerStop() {
		this.dispatchEventToOutput(AudioEventOutput.ON_STOP, {});
	}

	// private _stop() {
	// 	const instrument = await this._getInstrument()
	// 	if(!instrument){return}
	// 	instrument.triggerAttackRelease(this.pv.note, this.pv.duration)
	// 	// if (this._prevNote) {
	// 	// 	this._currentSynth.triggerRelease(undefined!);
	// 	// }
	// }
	private async _getPlayable() {
		const param = this.p.audio;
		if (param.isDirty()) {
			await param.compute();
		}
		const node = param.value.nodeWithContext(NodeContext.AUDIO);
		if (!node) {
			return;
		}
		const container = await node.compute();
		if (!container) {
			return;
		}
		const audioBuilder = container.coreContent();
		if (!audioBuilder) {
			return;
		}
		const instrument = audioBuilder.instrument();
		const source = audioBuilder.source();
		// if (!instrument) {
		// 	this.states.error.set(`no instrument found in node '${node.path()}'`)
		// 	return;
		// }
		return {instrument, source};
	}
	static PARAM_CALLBACK_play(node: AudioEventNode) {
		node._play();
	}
	// static PARAM_CALLBACK_stop(node: AudioEventNode) {
	// 	node._stop();
	// }
}
