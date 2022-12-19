/**
 * Play an audio source
 *
 *
 */

import {Player} from 'tone/build/esm/source/buffer/Player';
import {BaseAudioSourceActorNode} from './_BaseAudioSource';
import {AudioPlayerCallbacksManager} from './../../../core/audio/PlayerCallbacksManager';
export class PlayAudioSourceActorNode extends BaseAudioSourceActorNode {
	static override type() {
		return 'playAudioSource';
	}
	private _sourcePlayer: Player | undefined;
	onSourceFound(source: Player) {
		this._sourcePlayer = source;
		this._addPlayerEvent(source);
		source.start();
	}
	override dispose(): void {
		super.dispose();
		this._removePlayerEvent();
	}
	private _addPlayerEvent(sourcePlayer: Player) {
		AudioPlayerCallbacksManager.onStop(sourcePlayer, this._onSourcePlayerStopBound);
	}
	private _removePlayerEvent() {
		if (!this._sourcePlayer) {
			return;
		}
		AudioPlayerCallbacksManager.removeOnStop(this._sourcePlayer, this._onSourcePlayerStopBound);
	}
	private _onSourcePlayerStopBound = this._onSourcePlayerStop.bind(this);
	private _onSourcePlayerStop() {
		if (!this._sourcePlayerContext) {
			return;
		}
		this.runTrigger(this._sourcePlayerContext);
	}
}
