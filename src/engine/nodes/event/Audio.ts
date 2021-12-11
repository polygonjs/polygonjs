/**
 * Starts an audio
 *
 *
 *
 */
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {TypedEventNode} from './_Base';
import {EventConnectionPoint, EventConnectionPointType} from '../utils/io/connections/Event';
import {EventContext} from '../../scene/utils/events/_BaseEventsController';
// import * as Tone from 'tone';
import {BaseNodeType} from '../_Base';

class AudioEventParamsConfig extends NodeParamsConfig {
	/** @param button to presse to trigger the event */
	stop = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			AudioEventNode.PARAM_CALLBACK_stop(node as AudioEventNode);
		},
	});
}
const ParamsConfig = new AudioEventParamsConfig();

// const notes = ['C2', 'D2', 'E2', 'F2', 'G2', 'A2', 'B2', 'C3', 'D3', 'E3', 'F3', 'G3'];
// const notes = ['A6', 'G6', 'F6', 'E6', 'D6', 'C6', 'B5', 'A5', 'G5'];
export class AudioEventNode extends TypedEventNode<AudioEventParamsConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return 'audio';
	}
	initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new EventConnectionPoint('play', EventConnectionPointType.BASE, this._play.bind(this)),
			new EventConnectionPoint('stop', EventConnectionPointType.BASE, this._stop.bind(this)),
		]);

		// let started = false;
		// async function startTone() {
		// 	if (!started) {
		// 		started = true;
		// 		console.log('attempt to start audio');
		// 		await Tone.start();
		// 		console.log('audio is ready');
		// 	}
		// }
		// window.addEventListener('click', startTone);
		// window.addEventListener('keypress', startTone);
	}
	// private _polySynth = new Tone.PolySynth(Tone.Synth, {
	// 	oscillator: {
	// 		partials: [0, 2, 3, 4],
	// 	},
	// 	// volume: -8,
	// 	// oscillator: {
	// 	// 	type: 'square8',
	// 	// },
	// 	// envelope: {
	// 	// 	attack: 0.05,
	// 	// 	decay: 0.3,
	// 	// 	sustain: 0.4,
	// 	// 	release: 0.8,
	// 	// },
	// 	// filterEnvelope: {
	// 	// 	attack: 0.001,
	// 	// 	decay: 0.7,
	// 	// 	sustain: 0.1,
	// 	// 	release: 0.8,
	// 	// 	baseFrequency: 300,
	// 	// 	octaves: 4,
	// 	// },
	// 	// modulationIndex: 12.22,
	// 	// envelope: {
	// 	// 	attack: 0.01,
	// 	// 	decay: 0.2,
	// 	// },
	// 	// modulation: {
	// 	// 	type: 'square',
	// 	// },
	// 	// modulationEnvelope: {
	// 	// 	attack: 0.2,
	// 	// 	decay: 0.01,
	// 	// },
	// }).toDestination();
	// // synth
	// private _synth = new Tone.Synth({
	// 	oscillator: {
	// 		type: 'amtriangle',
	// 		harmonicity: 0.5,
	// 		modulationType: 'sine',
	// 	},
	// 	envelope: {
	// 		attackCurve: 'exponential',
	// 		attack: 0.05,
	// 		decay: 0.2,
	// 		sustain: 0.2,
	// 		release: 1.5,
	// 	},
	// 	portamento: 0.05,
	// }).toDestination();
	// // mono
	// private _monoSynth = new Tone.PolySynth(Tone.MonoSynth, {
	// 	volume: -8,
	// 	oscillator: {
	// 		type: 'square8',
	// 	},
	// 	envelope: {
	// 		attack: 0.05,
	// 		decay: 0.3,
	// 		sustain: 0.4,
	// 		release: 0.8,
	// 	},
	// 	filterEnvelope: {
	// 		attack: 0.001,
	// 		decay: 0.7,
	// 		sustain: 0.1,
	// 		release: 0.8,
	// 		baseFrequency: 300,
	// 		octaves: 4,
	// 	},
	// }).toDestination();
	// // fm
	// private _fmSynth = new Tone.FMSynth({
	// 	modulationIndex: 12.22,
	// 	envelope: {
	// 		attack: 0.01,
	// 		decay: 0.2,
	// 	},
	// 	modulation: {
	// 		type: 'square',
	// 	},
	// 	modulationEnvelope: {
	// 		attack: 0.2,
	// 		decay: 0.01,
	// 	},
	// }).toDestination();
	// // am
	// private _amSynth = new Tone.AMSynth({
	// 	harmonicity: 2.5,
	// 	oscillator: {
	// 		type: 'fatsawtooth',
	// 	},
	// 	envelope: {
	// 		attack: 0.1,
	// 		decay: 0.2,
	// 		sustain: 0.2,
	// 		release: 0.3,
	// 	},
	// 	modulation: {
	// 		type: 'square',
	// 	},
	// 	modulationEnvelope: {
	// 		attack: 0.5,
	// 		decay: 0.01,
	// 	},
	// }).toDestination();

	// private _pickSynth() {
	// 	const synths = [this._polySynth, this._monoSynth, this._amSynth, this._fmSynth, this._synth];
	// 	const synth = synths[4];
	// 	const reverb = new Tone.Reverb();
	// 	synth.connect(reverb);

	// 	// const osc = new Tone.Oscillator(440, 'sine'); // export declare type ToneOscillatorConstructorOptions = ToneCustomOscillatorOptions | ToneTypeOscillatorOptions | TonePartialOscillatorOptions;

	// 	// const amplitudeEnvelope = new Tone.AmplitudeEnvelope({
	// 	// 	attack: 0.11,
	// 	// 	decay: 0.21,
	// 	// 	sustain: 0.5,
	// 	// 	release: 1.2,
	// 	// });
	// 	// osc.connect(amplitudeEnvelope);
	// 	// synth.connect(osc);

	// 	// const distortion = new Tone.Distortion(0.4).toDestination();
	// 	// synth.connect(distortion);

	// 	synth.toDestination();
	// 	return synth;
	// }
	// private _currentSynth = this._pickSynth();

	// private _prevNote: string | undefined;
	// // private _synth = new Tone.NoiseSynth().toDestination();
	// private _index = 0;
	private _play(context: EventContext<Event>) {
		// const note = notes[this._index];
		// this._index++;
		// if (this._index >= notes.length) {
		// 	this._index = 0;
		// }
		// // const now = Tone.now();
		// this._stop();
		// this._currentSynth.triggerAttack(note);
		// //
		// // this._currentSynth.connect(this._osc);
		// // this._amplitudeEnvelope.connect(this._osc);
		// // this._synth.triggerRelease(note, now + 0.05);
		// this._prevNote = note;
		// //
		// // // const node = new Tone.Gain();
		// // console.log('play audio', note, tone.sampleTime, this._synth);
		// // const noiseSynth =
		// // this._synth.triggerAttackRelease('8n', 0.05);
		// // console.log('play');
	}
	static PARAM_CALLBACK_stop(node: AudioEventNode) {
		node._stop();
	}
	private _stop() {
		// if (this._prevNote) {
		// 	this._currentSynth.triggerRelease(undefined!);
		// }
	}
}
