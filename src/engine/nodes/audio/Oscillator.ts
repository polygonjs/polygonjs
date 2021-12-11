// /**
//  * creates an envelope that can be given to synths
//  *
//  *
//  */
// import {TypedAudioNode} from './_Base';
// import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
// import {AudioBuilder, OscillatorParamsType} from '../../../core/audio/AudioBuilder';
// import {OmniOscillator} from 'tone';
// console.log(OmniOscillator.getDefaults());
// export const OSCILLATOR_DEFAULTS: OscillatorParamsType = {
// 	// count: 3,
// 	// detune: 0,
// 	// frequency: 440,
// 	// harmonicity: 1,
// 	// modulationFrequency: 0.4,
// 	// modulationIndex: 2,
// 	// modulationType: "square",
// 	// mute: false,
// 	// partialCount: 0,
// 	// partials: [],
// 	// phase: 0,
// 	// spread: 20,
// 	// type: "pwm",
// 	// volume: 0,
// 	// width: 0.2,
// 	//
// 	type: 'amtriangle',
// 	harmonicity: 0.5,
// 	modulationType: 'sine',
// };

// class OscillatorAudioParamsConfig extends NodeParamsConfig {
// 	/** @param Harmonicity is the frequency ratio between the carrier and the modulator oscillators. A harmonicity of 1 gives both oscillators the same frequency. Harmonicity = 2 means a change of an octave. */
// 	harmonicity = ParamConfig.FLOAT(OSCILLATOR_DEFAULTS.harmonicity as number, {
// 		range: [0, 0.1],
// 		rangeLocked: [true, false],
// 	});
// }
// const ParamsConfig = new OscillatorAudioParamsConfig();

// export class OscillatorAudioNode extends TypedAudioNode<OscillatorAudioParamsConfig> {
// 	paramsConfig = ParamsConfig;
// 	static type() {
// 		return 'oscillator';
// 	}

// 	initializeNode() {
// 		this.io.inputs.setCount(0);
// 	}

// 	cook(inputContents: AudioBuilder[]) {
// 		const audioBuilder = new AudioBuilder();
// 		audioBuilder.setOscillatorParams({
// 			// attackCurve: 'linear',
// 			// attack: this.pv.attack,
// 			// decayCurve: 'exponential',
// 			// decay: this.pv.decay,
// 			// releaseCurve: 'exponential',
// 			// release: this.pv.release,
// 			// sustain: this.pv.sustain,
// 		});

// 		this.setAudioBuilder(audioBuilder);
// 	}
// }
