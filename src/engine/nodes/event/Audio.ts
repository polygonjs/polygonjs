/**
 * Starts an audio
 *
 *
 *
 */
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {TypedEventNode} from './_Base';
import {EventConnectionPoint, EventConnectionPointType} from '../utils/io/connections/Event';
import {EventContext} from '../../scene/utils/events/_BaseEventsController';
import * as Tone from 'tone';

class AudioEventParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new AudioEventParamsConfig();

const notes = ['C5', 'D4']; //, 'A3', 'A4', 'A5', 'C5', 'D4', 'E5', 'F4'];
export class AudioEventNode extends TypedEventNode<AudioEventParamsConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return 'audio';
	}
	initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new EventConnectionPoint('trigger', EventConnectionPointType.BASE, this._playAudio.bind(this)),
		]);

		let started = false;
		window.addEventListener('keypress', async () => {
			if (!started) {
				started = true;
				await Tone.start();
				console.log('audio is ready');
			}
		});
	}
	private _synth = new Tone.PolySynth().toDestination();
	// private _synth = new Tone.NoiseSynth().toDestination();
	private _index = 0;
	private _playAudio(context: EventContext<Event>) {
		//play a middle 'C' for the duration of an 8th note
		const note = notes[this._index];
		this._index++;
		if (this._index >= notes.length) {
			this._index = 0;
		}
		const now = Tone.now();
		const tone = this._synth.triggerAttack(note, now);
		console.log(tone, this._synth);
		this._synth.triggerRelease(note, now + 0.05);
		// // const node = new Tone.Gain();
		console.log('play audio', note, tone.sampleTime, this._synth);
		// const noiseSynth =
		// this._synth.triggerAttackRelease('8n', 0.05);
		console.log('play');
	}
}
