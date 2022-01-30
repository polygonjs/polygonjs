/**
 * BitCrusher down-samples the incoming signal to a different bit depth.
 * Lowering the bit depth of the signal creates distortion. Read more about BitCrushing
 *
 *
 */

import {BitCrusher} from 'tone/build/esm/effect/BitCrusher';
const DEFAULTS = {bits: 4}; //BitCrusher.getDefaults();

import {TypedAudioNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {AudioBuilder} from '../../../core/audio/AudioBuilder';
// import {BaseNodeType} from '../_Base';
// import {effectParamsOptions} from './utils/EffectsController';

// const paramCallback = (node: BaseNodeType) => {
// 	BitCrusherAudioNode.PARAM_CALLBACK_updateEffect(node as BitCrusherAudioNode);
// };

class BitCrusherAudioParamsConfig extends NodeParamsConfig {
	/** @param bits */
	bits = ParamConfig.INTEGER(DEFAULTS.bits, {
		range: [1, 16],
		rangeLocked: [true, true],
		// ...effectParamsOptions(paramCallback),
	});
}
const ParamsConfig = new BitCrusherAudioParamsConfig();

export class BitCrusherAudioNode extends TypedAudioNode<BitCrusherAudioParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'bitCrusher';
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
	}

	override cook(inputContents: AudioBuilder[]) {
		const audioBuilder = inputContents[0];

		// since the .bits property is readonly, we need to re-create it on every cook
		const effect = new BitCrusher(this.pv.bits);

		const inputNode = audioBuilder.audioNode();
		if (inputNode) {
			inputNode.connect(effect);
		}
		audioBuilder.setAudioNode(effect);

		this.setAudioBuilder(audioBuilder);
	}
	// private __effect__: BitCrusher | undefined;
	// private _effect() {
	// 	return (this.__effect__ = this.__effect__ || this._createEffect());
	// }
	// private _createEffect() {
	// 	return new BitCrusher(this.pv.bits);
	// }
	// static PARAM_CALLBACK_updateEffect(node: BitCrusherAudioNode) {
	// 	node._updateEffect();
	// }
	// private _updateEffect() {
	// 	const effect = this._effect();
	// 	effect.bits = this.pv.bits;
	// }
}
