/**
 * allows to import multiple audio files to use as samples
 *
 *
 */
import {TypedAudioNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {AudioBuilder} from '../../../core/audio/AudioBuilder';
import {Sampler, SamplerOptions} from 'tone/build/esm/instrument/Sampler';
import {PolyDictionary} from '../../../types/GlobalTypes';
import {StringParamLanguage} from '../../params/utils/OptionsController';
import {UrlHelper} from '../../../core/UrlHelper';
import {CoreLoaderAudio} from '../../../core/loader/Audio';

export const SAMPLER_DEFAULTS: Partial<SamplerOptions> = {
	attack: 0.01,
	release: 1,
};

const DEFAULT_NOTE_MAP = {
	A0: 'A0',
	C1: 'C1',
	'D#1': 'Ds1',
	'F#1': 'Fs1',
	A1: 'A1',
	C2: 'C2',
	'D#2': 'Ds2',
	'F#2': 'Fs2',
	A2: 'A2',
	C3: 'C3',
	'D#3': 'Ds3',
	'F#3': 'Fs3',
	A3: 'A3',
	C4: 'C4',
	'D#4': 'Ds4',
	'F#4': 'Fs4',
	A4: 'A4',
	C5: 'C5',
	'D#5': 'Ds5',
	'F#5': 'Fs5',
	A5: 'A5',
	C6: 'C6',
	'D#6': 'Ds6',
	'F#6': 'Fs6',
	A6: 'A6',
	C7: 'C7',
	'D#7': 'Ds7',
	'F#7': 'Fs7',
	A7: 'A7',
	C8: 'C8',
};

class SamplerAudioParamsConfig extends NodeParamsConfig {
	/** @param map of notes to load */
	urlsMap = ParamConfig.STRING(JSON.stringify(DEFAULT_NOTE_MAP, null, 2), {
		multiline: true,
		language: StringParamLanguage.JSON,
	});
	/** @param base url */
	baseUrl = ParamConfig.STRING('./');
	/** @param extension */
	extension = ParamConfig.STRING('mp3');
}
const ParamsConfig = new SamplerAudioParamsConfig();

export class SamplerAudioNode extends TypedAudioNode<SamplerAudioParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'sampler';
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
	}

	override async cook(inputContents: AudioBuilder[]) {
		const envelopeBuilder = inputContents[0];
		const envelopeParams = envelopeBuilder.envelopeParams() || SAMPLER_DEFAULTS;

		let urlsJSON: PolyDictionary<string> = {};
		let urls: string[] = [];
		try {
			const extension = this.pv.extension;
			urlsJSON = JSON.parse(this.pv.urlsMap);
			const noteNames = Object.keys(urlsJSON);
			for (let noteName of noteNames) {
				const urlFileName = urlsJSON[noteName];
				const url = `${this.pv.baseUrl}/${urlFileName}.${extension}`;
				urlsJSON[noteName] = UrlHelper.sanitize(url);
				urls.push(url);
			}
		} catch (err) {
			this.states.error.set('urlsMap is invalid JSON');
		}

		// preload urls for export
		const loaders: CoreLoaderAudio[] = urls.map(
			(url) => new CoreLoaderAudio(url, this.scene(), this, {multiAssetsForNode: true})
		);
		await Promise.all(loaders.map((loader) => loader.load()));

		// create sample
		const sampler = new Sampler({
			urls: urlsJSON,
			attack: envelopeParams.attack,
			release: envelopeParams.release,
			baseUrl: '',
			onerror: (err) => {
				this.states.error.set(err.message);
			},
			onload: () => {
				const audioBuilder = new AudioBuilder();
				audioBuilder.setInstrument(sampler);

				this.setAudioBuilder(audioBuilder);
			},
		});
	}
}
