/**
 * null node, useful to gather inputs together
 *
 *
 */
import {TypedAudioNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {AudioBuilder} from '../../../core/audio/AudioBuilder';
import {BaseNodeType} from '../_Base';
import {AudioController} from '../../../core/audio/AudioController';
import {ALL_NOTES} from '../../../core/audio/Notes';

class PlayInstrumentAudioParamsConfig extends NodeParamsConfig {
	/** @param note */
	note = ParamConfig.STRING('', {
		menuString: {
			entries: ALL_NOTES.sort().map((note) => {
				return {value: note, name: note};
			}),
		},
	});
	/** @param duration */
	duration = ParamConfig.FLOAT(0.125, {
		range: [0, 1],
		rangeLocked: [true, false],
	});
	/** @param play the audio */
	play = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			PlayInstrumentAudioNode.PARAM_CALLBACK_play(node as PlayInstrumentAudioNode);
		},
	});
	/** @param stop the audio */
	stop = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			PlayInstrumentAudioNode.PARAM_CALLBACK_stop(node as PlayInstrumentAudioNode);
		},
	});
}
const ParamsConfig = new PlayInstrumentAudioParamsConfig();

// const notes = ['C2', 'D2', 'E2', 'F2', 'G2', 'A2', 'B2', 'C3', 'D3', 'E3', 'F3', 'G3'];
// const notes = ['A6', 'G6', 'F6', 'E6', 'D6', 'C6', 'B5', 'A5', 'G5'];

export class PlayInstrumentAudioNode extends TypedAudioNode<PlayInstrumentAudioParamsConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return 'playInstrument';
	}

	initializeNode() {
		this.io.inputs.setCount(1);
	}

	cook(inputContents: AudioBuilder[]) {
		const audioBuilder = inputContents[0];
		this.setAudioBuilder(audioBuilder);
	}
	async play(): Promise<void> {
		const instrument = await this._getInstrument();
		if (!instrument) {
			console.log('no instrument');
			return;
		}
		await AudioController.start();
		console.log(`'${this.pv.note}', '${this.pv.duration}'`);

		instrument.triggerAttackRelease(this.pv.note, '8n');
	}
	async stop() {
		const instrument = await this._getInstrument();
		if (!instrument) {
			return;
		}
		// TODO: find out how to properly call triggerRelease, without or without the argument
	}
	private async _getInstrument() {
		if (this.isDirty()) {
			await this.compute();
		}
		const audioBuilder = this.containerController.container().coreContent();
		if (!audioBuilder) {
			return;
		}
		return audioBuilder.instrument();
	}

	static PARAM_CALLBACK_play(node: PlayInstrumentAudioNode) {
		node.play();
	}
	static PARAM_CALLBACK_stop(node: PlayInstrumentAudioNode) {
		node.stop();
	}
}
