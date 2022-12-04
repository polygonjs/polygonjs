import {Player} from 'tone/build/esm/source/buffer/Player';

export type OnBeforePlayCallback = (offset: number) => void;
export type OnPlaySuccessCallback = () => void;
export type OnPlayErrorCallback = (err: unknown) => void;
export type OnStopCallback = () => void;
export interface PlayerCallbacks {
	onBeforePlay?: Set<OnBeforePlayCallback>;
	onPlaySuccess?: Set<OnPlaySuccessCallback>;
	onPlayError?: Set<OnPlayErrorCallback>;
	onStop?: Set<OnStopCallback>;
}
export type PlayerEventName = 'onBeforePlay' | 'onPlaySuccess' | 'onPlayError' | 'onStop';

type CallbackByEventNameGeneric = {
	[key in PlayerEventName]: OnBeforePlayCallback | OnPlaySuccessCallback | OnPlayErrorCallback | OnStopCallback;
};
export interface CallbackByEventName extends CallbackByEventNameGeneric {
	onBeforePlay: OnBeforePlayCallback;
	onPlaySuccess: OnPlaySuccessCallback;
	onPlayError: OnPlayErrorCallback;
	onStop: OnStopCallback;
}

export class AudioPlayerCallbacksManagerClass {
	private static _instance: AudioPlayerCallbacksManagerClass;
	private constructor() {}
	static instance() {
		return (this._instance = this._instance || new AudioPlayerCallbacksManagerClass());
	}

	private _callbacksByPlayer: Map<Player, PlayerCallbacks> = new Map();

	registerPlayer(player: Player) {
		if (this._callbacksByPlayer.get(player)) {
			return;
		}
		this._callbacksByPlayer.set(player, {});
	}
	deregisterPlayer(player: Player) {
		// in order for deregister to work,
		// we need to make sure that the player is not registered somewhere else by another node.
		// so we may instead have the players created here?
		this._callbacksByPlayer.delete(player);
	}

	// onBeforePlay
	onBeforePlay(player: Player, callback: OnBeforePlayCallback) {
		this._on(player, 'onBeforePlay', callback);
	}
	removeOnBeforePlay(player: Player, callback: OnStopCallback) {
		this._removeCallback(player, 'onBeforePlay', callback);
	}
	runOnBeforePlayCallbacks(player: Player, offset: number) {
		this._callbacksByPlayer.get(player)?.onBeforePlay?.forEach((callback) => callback(offset));
	}
	// onPlaySuccess
	onPlaySuccess(player: Player, callback: OnPlaySuccessCallback) {
		this._on(player, 'onPlaySuccess', callback);
	}
	removeOnPlaySuccess(player: Player, callback: OnStopCallback) {
		this._removeCallback(player, 'onPlaySuccess', callback);
	}
	runOnPlaySuccessCallbacks(player: Player) {
		this._callbacksByPlayer.get(player)?.onPlaySuccess?.forEach((callback) => callback());
	}
	// onPlayError
	onPlayError(player: Player, callback: OnPlayErrorCallback) {
		this._on(player, 'onPlayError', callback);
	}
	removeOnPlayError(player: Player, callback: OnStopCallback) {
		this._removeCallback(player, 'onPlayError', callback);
	}
	runOnPlayErrorCallbacks(player: Player, err: unknown) {
		this._callbacksByPlayer.get(player)?.onPlayError?.forEach((callback) => callback(err));
	}
	// onStop
	onStop(player: Player, callback: OnStopCallback) {
		this._on(player, 'onStop', callback);
	}
	removeOnStop(player: Player, callback: OnStopCallback) {
		this._removeCallback(player, 'onStop', callback);
	}
	runOnStopCallbacks(player: Player) {
		this._callbacksByPlayer.get(player)?.onStop?.forEach((callback) => callback());
	}
	// generic
	private _on<E extends PlayerEventName>(player: Player, eventName: E, callback: CallbackByEventName[E]) {
		let map = this._callbacksByPlayer.get(player);
		if (!map) {
			this.registerPlayer(player);
			map = this._callbacksByPlayer.get(player);
		}
		if (!map) {
			return;
		}
		map[eventName] = map[eventName] || (new Set() as any);
		map[eventName]?.add(callback as any);
	}
	private _removeCallback<E extends PlayerEventName>(player: Player, eventName: E, callback: CallbackByEventName[E]) {
		let map = this._callbacksByPlayer.get(player);
		if (!map) {
			this.registerPlayer(player);
			map = this._callbacksByPlayer.get(player);
		}
		if (!map) {
			return;
		}
		map[eventName]?.delete(callback as any);
	}
}

export const AudioPlayerCallbacksManager = AudioPlayerCallbacksManagerClass.instance();
