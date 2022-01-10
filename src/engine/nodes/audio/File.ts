/**
 * import an audio file
 *
 *
 */
import {TypedAudioNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {AudioBuilder} from '../../../core/audio/AudioBuilder';
import {Player} from 'tone/build/esm/source/buffer/Player';
import {CoreLoaderAudio} from '../../../core/loader/Audio';
import {isBooleanTrue} from '../../../core/Type';
import {BaseNodeType} from '../_Base';
import {FileType} from '../../params/utils/OptionsController';

const LOOP_OPTIONS = {
	cook: false,
	callback: (node: BaseNodeType) => {
		FileAudioNode.PARAM_CALLBACK_updateLoop(node as FileAudioNode);
	},
};
class FileAudioParamsConfig extends NodeParamsConfig {
	/** @param url to fetch the audio file from */
	url = ParamConfig.STRING('', {
		fileBrowse: {type: [FileType.AUDIO]},
	});
	/** @param auto start */
	autostart = ParamConfig.BOOLEAN(1);
	/** @param play the audio */
	play = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			FileAudioNode.PARAM_CALLBACK_play(node as FileAudioNode);
		},
	});
	/** @param stop the audio */
	pause = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			FileAudioNode.PARAM_CALLBACK_pause(node as FileAudioNode);
		},
	});
	/** @param restart the audio */
	restart = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			FileAudioNode.PARAM_CALLBACK_restart(node as FileAudioNode);
		},
	});
	/** @param duration */
	duration = ParamConfig.FLOAT(-1, {
		cook: false,
		editable: false,
	});
	/** @param display currentTime param */
	updateCurrentTimeParam = ParamConfig.BOOLEAN(0, {
		cook: false,
		callback: (node: BaseNodeType) => {
			FileAudioNode.PARAM_CALLBACK_updateUpdateCurrentTimeParam(node as FileAudioNode);
		},
	});
	/** @param currentTime */
	currentTime = ParamConfig.FLOAT(0, {
		visibleIf: {updateCurrentTimeParam: 1},
		range: [0, 100],
		editable: false,
		cook: false,
	});
	/** @param loop */
	loop = ParamConfig.BOOLEAN(1, {
		...LOOP_OPTIONS,
	});
	/** @param useLoopRange */
	useLoopRange = ParamConfig.BOOLEAN(0, {
		visibleIf: {loop: 1},
		...LOOP_OPTIONS,
	});
	/** @param loop Range */
	loopRange = ParamConfig.VECTOR2([-1, -1], {
		visibleIf: {loop: 1, useLoopRange: 1},
		...LOOP_OPTIONS,
	});
}
const ParamsConfig = new FileAudioParamsConfig();

export class FileAudioNode extends TypedAudioNode<FileAudioParamsConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return 'file';
	}

	initializeNode() {
		this.io.inputs.setCount(0);
	}

	async cook(inputContents: AudioBuilder[]) {
		await this._loadUrl();
		this._updateOnTickHook();
		if (this._player) {
			const audioBuilder = new AudioBuilder();
			audioBuilder.setSource(this._player);
			this.setAudioBuilder(audioBuilder);
		} else {
			this.cookController.endCook();
		}
	}
	private _player: Player | undefined;
	private async _loadUrl(): Promise<Player | void> {
		try {
			const loader = new CoreLoaderAudio(this.pv.url, this.scene(), this);
			const buffer = await loader.load();

			return new Promise((resolve) => {
				if (this._player) {
					this._player.dispose();
				}

				this._player = new Player({
					url: buffer,
					loop: isBooleanTrue(this.pv.loop),
					volume: 0,
					// no onload event if a buffer is provided instead of a url
					// onload: () => {
					// 	resolve(player);
					// },
				});
				this.p.duration.set(buffer.duration);
				this.p.loopRange.set([0, buffer.duration]);
				if (isBooleanTrue(this.pv.autostart)) {
					this._player.start();
				}
				resolve(this._player);
			});
		} catch (err) {
			this.states.error.set(`failed to load url '${this.pv.url}'`);
			return;
		}
	}
	async play(): Promise<void> {
		this._player?.start();
	}
	async pause() {
		this._player?.stop();
	}
	async restart() {
		this._player?.seek(0);
	}
	async seek(time: number) {
		this._player?.seek(0);
	}

	static PARAM_CALLBACK_play(node: FileAudioNode) {
		node.play();
	}
	static PARAM_CALLBACK_pause(node: FileAudioNode) {
		node.pause();
	}
	static PARAM_CALLBACK_restart(node: FileAudioNode) {
		node.restart();
	}
	/*
	 * UPDATE CURRENT TIME PARAM
	 */
	static PARAM_CALLBACK_updateUpdateCurrentTimeParam(node: FileAudioNode) {
		node._updateCurrentTimeParam();
		node._updateOnTickHook();
	}

	private _updateCurrentTimeParam() {
		if (!this._player) {
			return;
		}
		const currentTime = this._player.now();
		this.p.currentTime.set(currentTime);
	}
	/*
	 * LOOP
	 */
	static PARAM_CALLBACK_updateLoop(node: FileAudioNode) {
		node._updateLoop();
	}
	private _updateLoop() {
		if (!this._player) {
			return;
		}
		this._player.loop = this.pv.loop;
		if (this._player.loop) {
			if (isBooleanTrue(this.pv.useLoopRange)) {
				this._player.setLoopPoints(this.pv.loopRange.x, this.pv.loopRange.y);
			}
		}
	}

	/*
	 * REGISTER TICK CALLBACK
	 */
	private _updateOnTickHook() {
		if (isBooleanTrue(this.pv.updateCurrentTimeParam)) {
			this._registerOnTickHook();
		} else {
			this._unRegisterOnTickHook();
		}
	}
	private async _registerOnTickHook() {
		if (this.scene().registeredBeforeTickCallbacks().has(this._tickCallbackName())) {
			return;
		}
		this.scene().registerOnBeforeTick(this._tickCallbackName(), this._updateCurrentTimeParam.bind(this));
	}
	private async _unRegisterOnTickHook() {
		this.scene().unRegisterOnBeforeTick(this._tickCallbackName());
	}
	private _tickCallbackName() {
		return `audio/File-${this.graphNodeId()}`;
	}
}
