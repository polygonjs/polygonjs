/**
 * applies a Distortion
 *
 *
 */

import {Distortion} from 'tone/build/esm/effect/Distortion';
interface DistortionDefault {
	distortion: number;
	oversample: OverSampleType;
}
const DEFAULTS: DistortionDefault = {
	distortion: 0.4,
	oversample: 'none',
}; //Distortion.getDefaults();

const OVER_SAMPLE_TYPES: OverSampleType[] = ['2x', '4x', 'none'];

import {TypedAudioNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {AudioBuilder} from '../../../core/audio/AudioBuilder';
import {BaseNodeType} from '../_Base';
import {effectParamsOptions} from './utils/EffectsController';

const paramCallback = (node: BaseNodeType) => {
	DistortionAudioNode.PARAM_CALLBACK_updateEffect(node as DistortionAudioNode);
};

class DistortionAudioParamsConfig extends NodeParamsConfig {
	/** @param distortion */
	distortion = ParamConfig.FLOAT(DEFAULTS.distortion, {
		range: [0, 1],
		rangeLocked: [true, true],
		...effectParamsOptions(paramCallback),
	});
	/** @param oversample */
	oversample = ParamConfig.INTEGER(OVER_SAMPLE_TYPES.indexOf(DEFAULTS.oversample), {
		menu: {
			entries: OVER_SAMPLE_TYPES.map((name, value) => ({name, value})),
		},
	});
}
const ParamsConfig = new DistortionAudioParamsConfig();

export class DistortionAudioNode extends TypedAudioNode<DistortionAudioParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'distortion';
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
	}

	override cook(inputContents: AudioBuilder[]) {
		const audioBuilder = inputContents[0];
		const effect = this._effect();

		const inputNode = audioBuilder.audioNode();
		if (inputNode) {
			inputNode.connect(effect);
		}
		audioBuilder.setAudioNode(effect);

		this.setAudioBuilder(audioBuilder);
	}
	private __effect__: Distortion | undefined;
	private _effect() {
		return (this.__effect__ = this.__effect__ || this._createEffect());
	}
	private _createEffect() {
		return new Distortion({
			distortion: this.pv.distortion,
			oversample: OVER_SAMPLE_TYPES[this.pv.oversample],
		});
	}
	static PARAM_CALLBACK_updateEffect(node: DistortionAudioNode) {
		node._updateEffect();
	}
	private _updateEffect() {
		const effect = this._effect();
		effect.distortion = this.pv.distortion;
		effect.oversample = OVER_SAMPLE_TYPES[this.pv.oversample];
	}
}
