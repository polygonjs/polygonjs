/**
 * creates a Synth
 *
 *
 */
import {TypedAudioNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {AudioBuilder} from '../../../core/audio/AudioBuilder';
import {BaseNodeType} from '../_Base';
import {effectParamsOptions} from './utils/EffectsController';
import {Volume} from 'tone/build/esm/component/channel/Volume';

const VOLUME_DEFAULTS = {
	volume: 0,
};

const paramCallback = (node: BaseNodeType) => {
	VolumeAudioNode.PARAM_CALLBACK_updateEffect(node as VolumeAudioNode);
};

class VolumeAudioParamsConfig extends NodeParamsConfig {
	/** @param volume */
	volume = ParamConfig.FLOAT(VOLUME_DEFAULTS.volume, {
		range: [-20, 20],
		rangeLocked: [false, false],
		...effectParamsOptions(paramCallback),
	});
}
const ParamsConfig = new VolumeAudioParamsConfig();

export class VolumeAudioNode extends TypedAudioNode<VolumeAudioParamsConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return 'volume';
	}

	initializeNode() {
		this.io.inputs.setCount(1);
	}

	cook(inputContents: AudioBuilder[]) {
		const audioBuilder = inputContents[0];

		const effect = this._effect();

		const inputNode = audioBuilder.audioNode();
		if (inputNode) {
			inputNode.connect(effect);
		}
		audioBuilder.setAudioNode(effect);

		this.setAudioBuilder(audioBuilder);
	}

	private __effect__: Volume | undefined;
	private _effect() {
		return (this.__effect__ = this.__effect__ || this._createEffect());
	}
	private _createEffect() {
		return new Volume({
			volume: this.pv.volume,
		});
	}
	static PARAM_CALLBACK_updateEffect(node: VolumeAudioNode) {
		node._updateEffect();
	}
	private _updateEffect() {
		const effect = this._effect();
		effect.volume.linearRampToValueAtTime(this.pv.volume, '+1');
	}
}
