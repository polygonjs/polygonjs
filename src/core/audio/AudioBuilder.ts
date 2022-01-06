import {EnvelopeOptions} from 'tone';
import {ToneAudioNodeOptions, ToneAudioNode} from 'tone/build/esm/core/context/ToneAudioNode';
import {Instrument} from 'tone/build/esm/instrument/Instrument';
import {OmniOscillatorSynthOptions} from 'tone/build/esm/source/oscillator/OscillatorInterface';
import {Source} from 'tone/build/esm/source/Source';
import {AmplitudeEnvelope} from 'tone/build/esm/component/envelope/AmplitudeEnvelope';

export type SourceType = Source<any>;
export type InstrumentType = Instrument<any> | AmplitudeEnvelope;
export type EnvelopeParamsType = Partial<Omit<EnvelopeOptions, keyof ToneAudioNodeOptions>>;
export type OscillatorParamsType = Partial<OmniOscillatorSynthOptions>;

export class AudioBuilder {
	// private _synth: SynthType | undefined;
	private _source: SourceType | undefined;
	private _instrument: InstrumentType | undefined;
	private _audioNode: ToneAudioNode | undefined;
	private _oscillatorParams: OscillatorParamsType | undefined;
	private _envelopeParams: EnvelopeParamsType | undefined;

	setAudioNode(inputNode: ToneAudioNode | undefined) {
		this._audioNode = inputNode;
	}
	audioNode() {
		return this._audioNode;
	}
	setSource(source: SourceType | undefined) {
		this._source = source;
		if (!this._audioNode) {
			this.setAudioNode(source);
		}
	}
	source() {
		return this._source;
	}
	setInstrument(instrument: InstrumentType | undefined) {
		this._instrument = instrument;
		if (!this._audioNode) {
			this.setAudioNode(instrument);
		}
	}
	instrument() {
		return this._instrument;
	}
	setOscillatorParams(params: OscillatorParamsType | undefined) {
		this._oscillatorParams = params;
	}
	oscillatorParams() {
		return this._oscillatorParams;
	}
	setEnvelopeParams(params: EnvelopeParamsType | undefined) {
		this._envelopeParams = params;
	}
	envelopeParams() {
		return this._envelopeParams;
	}

	clone() {
		const newAudioBuilder = new AudioBuilder();
		newAudioBuilder.setAudioNode(this._audioNode);
		newAudioBuilder.setSource(this._source);
		newAudioBuilder.setInstrument(this._instrument);
		newAudioBuilder.setEnvelopeParams(this._envelopeParams);
		return newAudioBuilder;
	}
}
