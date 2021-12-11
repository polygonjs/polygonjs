/**
 * creates a Synth
 *
 *
 */
import {TypedAudioNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {AudioBuilder, InstrumentType, SourceType} from '../../../core/audio/AudioBuilder';
import {BaseNodeType} from '../_Base';
import {effectParamsOptions} from './utils/EffectsController';

const VOLUME_DEFAULTS = {
	volume: 0,
};

const paramCallback = (node: BaseNodeType) => {
	VolumeAudioNode.PARAM_CALLBACK_updateVolume(node as VolumeAudioNode);
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

		this._updateInputVolume(audioBuilder.instrument());
		this._updateInputVolume(audioBuilder.source());

		this.setAudioBuilder(audioBuilder);
	}
	static PARAM_CALLBACK_updateVolume(node: VolumeAudioNode) {
		node._updateVolume();
	}
	private async _updateVolume() {
		const inputs = await this._getVolumeControllables();
		this._updateInputVolume(inputs?.instrument);
		this._updateInputVolume(inputs?.source);
	}
	private _updateInputVolume(input: InstrumentType | SourceType | undefined) {
		if (!input) {
			return;
		}
		input.volume.value = this.pv.volume;
	}
	private async _getVolumeControllables() {
		if (this.isDirty()) {
			await this.compute();
		}
		const audioBuilder = this.containerController.container().coreContent();
		if (!audioBuilder) {
			return;
		}
		return {instrument: audioBuilder.instrument(), source: audioBuilder.source()};
	}
}
