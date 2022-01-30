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
import {BaseNodeType} from '../_Base';
import {isBooleanTrue} from '../../../core/Type';

class UserMediaAudioParamsConfig extends NodeParamsConfig {
	autostart = ParamConfig.BOOLEAN(1);
	/** @param play the audio */
	open = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			UserMediaAudioNode.PARAM_CALLBACK_open(node as UserMediaAudioNode);
		},
	});
	/** @param stop the audio */
	close = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			UserMediaAudioNode.PARAM_CALLBACK_close(node as UserMediaAudioNode);
		},
	});
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
		if (isBooleanTrue(this.pv.autostart)) {
			await userMedia.open();
		}
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

	async open() {
		return await this._userMedia().open();
	}
	close() {
		this._userMedia().close();
	}

	/*
	 * STATIC CALLBACKS
	 */
	static PARAM_CALLBACK_open(node: UserMediaAudioNode) {
		node.open();
	}
	static PARAM_CALLBACK_close(node: UserMediaAudioNode) {
		node.close();
	}
}
