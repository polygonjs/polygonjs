/**
 * UserMedia uses MediaDevices.getUserMedia to open up and external microphone or audio input.
 * Check [MediaDevices API Support](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)
 * to see which browsers are supported. Access to an external input
 * is limited to secure (HTTPS) connections.
 *
 * See description on [Tone.js](https://tonejs.github.io/)
 */

import {TypedAudioNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {AudioBuilder} from '../../../core/audio/AudioBuilder';
import {UserMedia} from 'tone/build/esm/source/UserMedia';
import {effectParamsOptions} from './utils/EffectsController';
import {BaseNodeType} from '../_Base';
import {isBooleanTrue} from '../../../core/Type';

const paramCallback = (node: BaseNodeType) => {
	UserMediaAudioNode.PARAM_CALLBACK_updateUserMedia(node as UserMediaAudioNode);
};

class UserMediaAudioParamsConfig extends NodeParamsConfig {
	play = ParamConfig.BOOLEAN(1, effectParamsOptions(paramCallback));
}
const ParamsConfig = new UserMediaAudioParamsConfig();

export class UserMediaAudioNode extends TypedAudioNode<UserMediaAudioParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'userMedia';
	}

	override initializeNode() {
		this.io.inputs.setCount(0);
	}

	override async cook(inputContents: AudioBuilder[]) {
		const audioBuilder = new AudioBuilder();
		const userMedia = this._userMedia();
		audioBuilder.setSource(userMedia);
		this.setAudioBuilder(audioBuilder);
	}
	private __userMedia__: UserMedia | undefined;
	private _userMedia() {
		return (this.__userMedia__ = this.__userMedia__ || this._createEffect());
	}
	private _createEffect() {
		return new UserMedia();
	}
	static PARAM_CALLBACK_updateUserMedia(node: UserMediaAudioNode) {
		node._updateUserMedia();
	}
	private _updateUserMedia() {
		const userMedia = this._userMedia();

		if (isBooleanTrue(this.pv.play)) {
			userMedia.open();
		} else {
			userMedia.close();
		}
	}
}
