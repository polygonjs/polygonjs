/**
 * import an audio file
 *
 *
 */
import {TypedAudioNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {AudioBuilder} from '../../../core/audio/AudioBuilder';
import {Player} from 'tone/build/esm/source/buffer/Player';
import {AUDIO_EXTENSIONS, CoreLoaderAudio} from '../../../core/loader/Audio';
import {isBooleanTrue} from '../../../core/Type';
import {BaseNodeType} from '../_Base';
import {Poly} from '../../Poly';

const EPSILON = 1e-6;

const LOOP_OPTIONS = {
	cook: false,
	callback: (node: BaseNodeType) => {
		FileAudioNode.PARAM_CALLBACK_updateLoop(node as FileAudioNode);
	},
};

type OnBeforePlayCallback = (offset: number) => void;
type OnPlaySuccessCallback = () => void;
type OnPlayErrorCallback = (err: unknown) => void;
type OnStopCallback = () => void;

class FileAudioParamsConfig extends NodeParamsConfig {
	/** @param url to fetch the audio file from */
	url = ParamConfig.STRING('', {
		fileBrowse: {extensions: AUDIO_EXTENSIONS},
	});
	/** @param auto start */
	autostart = ParamConfig.BOOLEAN(1);

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
	// useLoopRange = ParamConfig.BOOLEAN(0, {
	// 	visibleIf: {loop: 1},
	// 	...LOOP_OPTIONS,
	// });
	/** @param loop Range */
	// loopRange = ParamConfig.VECTOR2([-1, -1], {
	// 	visibleIf: {loop: 1, useLoopRange: 1},
	// 	...LOOP_OPTIONS,
	// });

	/** @param play the audio */
	play = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			FileAudioNode.PARAM_CALLBACK_play(node as FileAudioNode);
		},
		hidden: true,
	});
	/** @param stop the audio */
	pause = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			FileAudioNode.PARAM_CALLBACK_pause(node as FileAudioNode);
		},
		hidden: true,
	});
	/** @param restart the audio */
	restart = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			FileAudioNode.PARAM_CALLBACK_restart(node as FileAudioNode);
		},
		hidden: true,
	});
	/** @param seek 10 seconds back */
	seekM10 = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			FileAudioNode.PARAM_CALLBACK_seekOffset(node as FileAudioNode, -10);
		},
		hidden: true,
	});
	/** @param seek 5 seconds back */
	seekM5 = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			FileAudioNode.PARAM_CALLBACK_seekOffset(node as FileAudioNode, -5);
		},
		hidden: true,
	});
	/** @param seek 5 seconds forward */
	seekP5 = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			FileAudioNode.PARAM_CALLBACK_seekOffset(node as FileAudioNode, +5);
		},
		hidden: true,
	});
	/** @param seek 10 seconds forward */
	seekP10 = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			FileAudioNode.PARAM_CALLBACK_seekOffset(node as FileAudioNode, +10);
		},
		hidden: true,
	});
}
const ParamsConfig = new FileAudioParamsConfig();

export class FileAudioNode extends TypedAudioNode<FileAudioParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'file';
	}

	override initializeNode() {
		this.io.inputs.setCount(0);
	}

	override dispose(): void {
		super.dispose();
		if (this._player) {
			this.pause();
			this._player.dispose();
		}
		Poly.blobs.clearBlobsForNode(this);
	}

	private _startedAt: number | undefined;
	private _stoppedAt: number = 0;

	override async cook(inputContents: AudioBuilder[]) {
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
			const loader = new CoreLoaderAudio(this.pv.url, this);
			const buffer: AudioBuffer = await loader.load();

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
					// make sure to have the param loop set to false for the onstop callbacks to be run.
					onstop: () => {
						this._runOnStopCallbacks();
					},
				});

				this._reset();
				this.p.duration.set(buffer.duration);
				// this.p.loopRange.set([0, buffer.duration]);
				if (isBooleanTrue(this.pv.autostart)) {
					this.play();
				}
				resolve(this._player);
			});
		} catch (err) {
			this.states.error.set(`failed to load url '${this.pv.url}'`);
			return;
		}
	}
	async play() {
		if (!this._player) {
			return;
		}
		// const offset = this._stoppedAt;
		// using pv.currentTime is useful when reloading the page
		// and still starting from where we were
		const offset = isBooleanTrue(this.pv.updateCurrentTimeParam) ? this.pv.currentTime : this._currentTime();
		// always add 2 * EPSILON in the offset, which will not be noticeable
		// but helps avoiding errors when restarting
		const sanitizedOffset = Math.max(offset + 2 * EPSILON, 0);
		try {
			this._runOnBeforePlayCallbacks(sanitizedOffset);
			this._player.start(0, sanitizedOffset);
			this._runOnPlaySuccessCallbacks();
		} catch (err) {
			console.error(err);
			this._runOnPlayErrorCallbacks(err);
		}
		this._startedAt = this._player.now() - this._stoppedAt;
		this._stoppedAt = 0;
	}
	async pause() {
		if (!this._player) {
			return;
		}
		if (this._startedAt == null) {
			return;
		}
		const elapsed = this._player.now() - this._startedAt;
		this._player.stop();
		this._stoppedAt = elapsed;
	}
	private _reset() {
		this._stoppedAt = 0;
		this._startedAt = undefined;
		this.p.currentTime.set(0);
	}
	async restart() {
		if (!this._player) {
			return;
		}
		this._player.seek(0, 0);
		this._reset();
		this.play();
	}
	seekOffset(offset: number) {
		if (!this._player) {
			return;
		}
		if (this._startedAt == null) {
			return;
		}
		const currentTime = this._currentTime();
		this._startedAt -= offset;
		this._player.seek(currentTime + offset);
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
		const currentTime = this._currentTime();
		this.p.currentTime.set(currentTime);
	}
	private _currentTime() {
		if (this._stoppedAt) {
			return this._stoppedAt;
		}
		if (this._player && this._startedAt != null) {
			let current = this._player.now() - this._startedAt;
			const duration = this.pv.duration;
			if (current > duration) {
				current -= duration;
			}
			return current;
		}
		return 0;
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
		// if (this._player.loop) {
		// 	if (isBooleanTrue(this.pv.useLoopRange)) {
		// 		this._player.setLoopPoints(this.pv.loopRange.x, this.pv.loopRange.y);
		// 	}
		// }
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

	/*
	 * STATIC CALLBACKS
	 */
	static PARAM_CALLBACK_seekOffset(node: FileAudioNode, offset: number) {
		node.seekOffset(offset);
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
	 * HOOKS
	 */
	private _onBeforePlayCallbacks: Set<OnBeforePlayCallback> | undefined;
	private _onPlaySuccessCallbacks: Set<OnPlaySuccessCallback> | undefined;
	private _onPlayErrorCallbacks: Set<OnPlayErrorCallback> | undefined;
	private _onStopCallbacks: Set<OnStopCallback> | undefined;
	onBeforePlay(callback: OnBeforePlayCallback) {
		this._onBeforePlayCallbacks = this._onBeforePlayCallbacks || new Set();
		this._onBeforePlayCallbacks.add(callback);
	}
	private _runOnBeforePlayCallbacks(offset: number) {
		if (!this._onBeforePlayCallbacks) {
			return;
		}
		this._onBeforePlayCallbacks.forEach((callback) => callback(offset));
	}
	onPlaySuccess(callback: OnPlaySuccessCallback) {
		this._onPlaySuccessCallbacks = this._onPlaySuccessCallbacks || new Set();
		this._onPlaySuccessCallbacks.add(callback);
	}
	private _runOnPlaySuccessCallbacks() {
		if (!this._onPlaySuccessCallbacks) {
			return;
		}
		this._onPlaySuccessCallbacks.forEach((callback) => callback());
	}
	onPlayError(callback: OnPlayErrorCallback) {
		this._onPlayErrorCallbacks = this._onPlayErrorCallbacks || new Set();
		this._onPlayErrorCallbacks.add(callback);
	}
	private _runOnPlayErrorCallbacks(err: unknown) {
		if (!this._onPlayErrorCallbacks) {
			return;
		}
		this._onPlayErrorCallbacks.forEach((callback) => callback(err));
	}
	onStop(callback: OnStopCallback) {
		this._onStopCallbacks = this._onStopCallbacks || new Set();
		this._onStopCallbacks.add(callback);
	}
	private _runOnStopCallbacks() {
		if (!this._onStopCallbacks) {
			return;
		}
		this._onStopCallbacks.forEach((callback) => callback());
	}
}
