import {PolyScene} from '../PolyScene';

import {CoreGraphNode} from '../../../core/graph/CoreGraphNode';
import '../../Poly';
import {SceneEvent} from '../../poly/SceneEvent';
import {NodeEvent} from '../../poly/NodeEvent';
import {ParamEvent} from '../../poly/ParamEvent';

interface EventsListener {
	process_events: (emitter: CoreGraphNode, event: SceneEvent | NodeEvent | ParamEvent, data?: any) => void;
}
type OnAddListenerCallback = () => void;

export class DispatchController {
	private _onAddListenerCallbacks: OnAddListenerCallback[] | undefined;
	constructor(private scene: PolyScene) {}

	private _eventsListener: EventsListener | undefined;

	setListener(eventsListener: EventsListener) {
		// let's have a single listener for now
		// which is a constraint I've added when adding on_add_listener
		if (!this._eventsListener) {
			this._eventsListener = eventsListener;
			this._runOnAddListenerCallbacks();
		} else {
			console.warn('scene already has a listener');
		}
	}
	onAddListener(callback: OnAddListenerCallback) {
		if (this._eventsListener) {
			callback();
		} else {
			this._onAddListenerCallbacks = this._onAddListenerCallbacks || [];
			this._onAddListenerCallbacks.push(callback);
		}
	}
	private _runOnAddListenerCallbacks() {
		if (this._onAddListenerCallbacks) {
			let callback: OnAddListenerCallback | undefined;
			while ((callback = this._onAddListenerCallbacks.pop())) {
				callback();
			}
			this._onAddListenerCallbacks = undefined;
		}
	}

	dispatch(emitter: CoreGraphNode, event: SceneEvent | NodeEvent | ParamEvent, data?: any) {
		this._eventsListener?.process_events(emitter, event, data);
	}
	emitAllowed(): boolean {
		return (
			this._eventsListener != null &&
			this.scene.loadingController.loaded() &&
			this.scene.loadingController.autoUpdating()
		);
	}
}
