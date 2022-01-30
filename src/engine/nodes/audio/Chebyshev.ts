/**
 * Chebyshev is a waveshaper which is good
 * for making different types of distortion sounds.
 * Note that odd orders sound very different from even ones,
 * and order = 1 is no change.
 *
 *
 */

import {Chebyshev} from 'tone/build/esm/effect/Chebyshev';
interface ChebyshevDefault {
	order: number;
	oversample: OverSampleType;
}
const DEFAULTS: ChebyshevDefault = {order: 4, oversample: 'none'}; //Chebyshev.getDefaults();

const OVER_SAMPLE_TYPES: OverSampleType[] = ['2x', '4x', 'none'];

import {TypedAudioNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {AudioBuilder} from '../../../core/audio/AudioBuilder';
import {BaseNodeType} from '../_Base';
import {effectParamsOptions} from './utils/EffectsController';

const paramCallback = (node: BaseNodeType) => {
	ChebyshevAudioNode.PARAM_CALLBACK_updateEffect(node as ChebyshevAudioNode);
};

class ChebyshevAudioParamsConfig extends NodeParamsConfig {
	/** @param order */
	order = ParamConfig.INTEGER(DEFAULTS.order, {
		range: [1, 100],
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
const ParamsConfig = new ChebyshevAudioParamsConfig();

export class ChebyshevAudioNode extends TypedAudioNode<ChebyshevAudioParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'chebyshev';
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
	private __effect__: Chebyshev | undefined;
	private _effect() {
		return (this.__effect__ = this.__effect__ || this._createEffect());
	}
	private _createEffect() {
		return new Chebyshev({
			order: this.pv.order,
			oversample: OVER_SAMPLE_TYPES[this.pv.oversample],
		});
	}
	static PARAM_CALLBACK_updateEffect(node: ChebyshevAudioNode) {
		node._updateEffect();
	}
	private _updateEffect() {
		const effect = this._effect();
		effect.order = this.pv.order;
		effect.oversample = OVER_SAMPLE_TYPES[this.pv.oversample];
	}
}
