/**
 * Starts an audio node
 *
 *
 *
 */
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {TypedEventNode} from './_Base';
import {EventConnectionPoint, EventConnectionPointType} from '../utils/io/connections/Event';
import {EventContext} from '../../scene/utils/events/_BaseEventsController';
import {BaseNodeType} from '../_Base';
import {ALL_NOTES, DEFAULT_NOTE} from '../../../core/audio/Notes';
import {NodeContext} from '../../poly/NodeContext';
import {AudioListenerObjNode} from '../obj/AudioListener';

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
	}

	private _previousNote: string | undefined;
	private _triggerPlay(context: EventContext<Event>) {
		this._play();
	}
	private async _play() {
		if (!AudioListenerObjNode.soundActivated()) {
			return;
		}

		const instrument = await this._getInstrument();
		if (!instrument) {
			return;
		}

		// await AudioController.start();

		if (this._previousNote) {
			// instrument.triggerRelease(this._previousNote);
		}

		const note = this.pv.note;
		if (note == '') {
			// we test the note value,
			// as it could resolve to nothing if it is tied to an expression wchih returns nothing
			return;
		}
		instrument.triggerAttackRelease(note, this.pv.duration);
		this._previousNote = note;
	}
	// private _stop() {
	// 	const instrument = await this._getInstrument()
	// 	if(!instrument){return}
	// 	instrument.triggerAttackRelease(this.pv.note, this.pv.duration)
	// 	// if (this._prevNote) {
	// 	// 	this._currentSynth.triggerRelease(undefined!);
	// 	// }
	// }
	private async _getInstrument() {
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
		if (!instrument) {
			return;
		}
		return instrument;
	}
	static PARAM_CALLBACK_play(node: AudioEventNode) {
		node._play();
	}
	// static PARAM_CALLBACK_stop(node: AudioEventNode) {
	// 	node._stop();
	// }
}
