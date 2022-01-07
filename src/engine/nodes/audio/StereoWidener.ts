/**
 * Applies a width factor to the mid/side seperation.
 * 0 is all mid and 1 is all side.
 * Algorithm found in [kvraudio forums](http://www.kvraudio.com/forum/viewtopic.php?t=212587).
 * ```
 * Mid *= 2*(1-width)<br>
 * Side *= 2*width
 *
 * See description on [Tone.js](https://tonejs.github.io/)
 *
 */

import {StereoWidener} from 'tone/build/esm/effect/StereoWidener';
const DEFAULTS = StereoWidener.getDefaults();

import {TypedAudioNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {AudioBuilder} from '../../../core/audio/AudioBuilder';

class StereoWidenerAudioParamsConfig extends NodeParamsConfig {
	/** @param width */
	width = ParamConfig.FLOAT(DEFAULTS.width, {
		range: [0, 1],
		rangeLocked: [true, true],
	});
}
const ParamsConfig = new StereoWidenerAudioParamsConfig();

export class StereoWidenerAudioNode extends TypedAudioNode<StereoWidenerAudioParamsConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return 'stereoWidener';
	}

	initializeNode() {
		this.io.inputs.setCount(1);
	}

	cook(inputContents: AudioBuilder[]) {
		const audioBuilder = inputContents[0];
		const effect = new StereoWidener(this.pv.width);

		const inputNode = audioBuilder.audioNode();
		if (inputNode) {
			inputNode.connect(effect);
		}
		audioBuilder.setAudioNode(effect);

		this.setAudioBuilder(audioBuilder);
	}
}
