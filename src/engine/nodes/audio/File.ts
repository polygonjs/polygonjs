/**
 * imports an audio file
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
import {Poly} from '../../Poly';
import {AUDIO_EXTENSIONS} from '../../../core/FileTypeController';
import {
	AudioPlayerCallbacksManager,
	OnBeforePlayCallback,
	OnPlaySuccessCallback,
	OnPlayErrorCallback,
	OnStopCallback,
	PlayerCallbacks,
	PlayerEventName,
	CallbackByEventName,
} from './../../../core/audio/PlayerCallbacksManager';

const EPSILON = 1e-6;

const LOOP_OPTIONS = {
	cook: false,
	callback: (node: BaseNodeType) => {
		FileAudioNode.PARAM_CALLBACK_updateLoop(node as FileAudioNode);
	},
};

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

				const player = new Player({
					url: buffer,
					loop: isBooleanTrue(this.pv.loop),
					volume: 0,
					// no onload event if a buffer is provided instead of a url
					// onload: () => {
					// 	resolve(player);
					// },
					// make sure to have the param loop set to false for the onstop callbacks to be run.
					onstop: () => {
						this._runOnStop(player);
					},
				});
				this._player = player;

				this._reset();
				this.p.duration.set(buffer.duration);
				// this.p.loopRange.set([0, buffer.duration]);
				if (isBooleanTrue(this.pv.autostart)) {
					this.play();
				}
				AudioPlayerCallbacksManager.registerPlayer(this._player);
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
			this._runOnBeforePlay(this._player, sanitizedOffset);
			this._player.start(0, sanitizedOffset);
			this._runOnPlaySuccess(this._player);
		} catch (err) {
			console.error(err);
			this._runOnPlayError(this._player, err);
		}
		this._startedAt = this._player.now() - this._stoppedAt;
		this._stoppedAt = 0;
	}
	async pause() {
		if (!this._player) {
			console.warn('no player');
			return;
		}

		if (this._player.state != 'started') {
			console.warn(`player state is not "started", but "${this._player.state}"`);
			return;
		}
		if (this._startedAt != null) {
			const elapsed = this._player.now() - this._startedAt;
			this._stoppedAt = elapsed;
		}
		this._player.stop();
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

	private _playerCallbacks: PlayerCallbacks = {};
	// onBeforePlay
	onBeforePlay(callback: OnBeforePlayCallback) {
		this._on('onBeforePlay', callback);
	}
	private _runOnBeforePlay(player: Player, offset: number) {
		this._playerCallbacks.onBeforePlay?.forEach((callback) => callback(offset));
		AudioPlayerCallbacksManager.runOnBeforePlayCallbacks(player, offset);
	}

	// onPlaySuccess
	onPlaySuccess(callback: OnPlaySuccessCallback) {
		this._on('onPlaySuccess', callback);
	}
	private _runOnPlaySuccess(player: Player) {
		this._playerCallbacks.onPlaySuccess?.forEach((callback) => callback());
		AudioPlayerCallbacksManager.runOnPlaySuccessCallbacks(player);
	}

	// onPlayError
	onPlayError(callback: OnPlayErrorCallback) {
		this._on('onPlayError', callback);
	}
	private _runOnPlayError(player: Player, err: unknown) {
		this._playerCallbacks.onPlayError?.forEach((callback) => callback(err));
		AudioPlayerCallbacksManager.runOnPlayErrorCallbacks(player, err);
	}

	// onStop
	onStop(callback: OnStopCallback) {
		this._on('onStop', callback);
	}
	removeOnStop(callback: OnStopCallback) {
		this._removeCallback('onStop', callback);
	}
	private _runOnStop(player: Player) {
		this._playerCallbacks.onStop?.forEach((callback) => callback());
		AudioPlayerCallbacksManager.runOnStopCallbacks(player);
	}
	// generic
	private _on<E extends PlayerEventName>(eventName: E, callback: CallbackByEventName[E]) {
		this._playerCallbacks[eventName] = this._playerCallbacks[eventName] || (new Set() as any);
		this._playerCallbacks[eventName]?.add(callback as any);
	}
	private _removeCallback<E extends PlayerEventName>(eventName: E, callback: CallbackByEventName[E]) {
		this._playerCallbacks[eventName]?.delete(callback as any);
	}
}
