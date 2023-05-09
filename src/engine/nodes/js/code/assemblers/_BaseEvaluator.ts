import {PolyScene} from '../../../../scene/PolyScene';
import {BaseNodeType} from '../../../../nodes/_Base';
import {TimeController} from '../../../../scene/utils/TimeController';
import {WatchStopHandle} from '@vue-reactivity/watch';

type OnDisposeCallback = () => void;
export class BaseEvaluator {
	protected scene: PolyScene;
	protected timeController: TimeController;
	protected _watchStopHandles: WatchStopHandle[] = [];
	constructor(public readonly node: BaseNodeType) {
		this.scene = node.scene();
		this.timeController = this.scene.timeController;
	}

	// dispose logic
	_onDisposeCallbacks?: OnDisposeCallback[];
	onDispose(callback: OnDisposeCallback) {
		this._onDisposeCallbacks = this._onDisposeCallbacks || [];
		this._onDisposeCallbacks.push(callback);
	}
	dispose() {
		const _disposeWatchEffects = () => {
			if (!this._watchStopHandles) {
				return;
			}
			let watchStopHandle: WatchStopHandle | undefined;
			while ((watchStopHandle = this._watchStopHandles.pop())) {
				watchStopHandle();
			}
		};

		const _runOnDisposeCallback = () => {
			if (!this._onDisposeCallbacks) {
				return;
			}
			let callback: OnDisposeCallback | undefined;
			while ((callback = this._onDisposeCallbacks.pop())) {
				callback();
			}
		};
		_runOnDisposeCallback();
		_disposeWatchEffects();
	}
}
