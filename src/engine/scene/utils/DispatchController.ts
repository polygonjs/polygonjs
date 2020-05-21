import {PolyScene} from '../PolyScene';

import {CoreGraphNode} from '../../../core/graph/CoreGraphNode';
import '../../Poly';
import {Poly} from '../../Poly';
import {SceneEvent} from '../../poly/SceneEvent';
import {NodeEvent} from '../../poly/NodeEvent';
import {ParamEvent} from '../../poly/ParamEvent';

// type Callback = (emitter: CoreGraphNodeScene) => void; // TODO: typescript: maybe arg should be an event instead of the emitter
interface EventsListener {
	process_events: (emitter: CoreGraphNode, event_name: SceneEvent | NodeEvent | ParamEvent, data?: any) => void;
}
type OnAddListenerCallback = () => void;

export class DispatchController {
	private _on_add_listener_callbacks: OnAddListenerCallback[] | undefined;
	constructor(private scene: PolyScene) {}

	private _events_listener: EventsListener | undefined;

	set_listener(events_listener: EventsListener) {
		// let's have a single listener for now
		// which is a constraint I've added when adding on_add_listener
		if (!this._events_listener) {
			this._events_listener = events_listener;
			this.run_on_add_listener_callbacks();
		} else {
			console.warn('scene already has a listener');
		}
		// this._store.scene = this;
	}
	on_add_listener(callback: OnAddListenerCallback) {
		if (this._events_listener) {
			callback();
		} else {
			this._on_add_listener_callbacks = this._on_add_listener_callbacks || [];
			this._on_add_listener_callbacks.push(callback);
		}
	}
	private run_on_add_listener_callbacks() {
		if (this._on_add_listener_callbacks) {
			let callback: OnAddListenerCallback | undefined;
			while ((callback = this._on_add_listener_callbacks.pop())) {
				callback();
			}
			this._on_add_listener_callbacks = undefined;
		}
	}
	get events_listener() {
		return this._events_listener;
	}
	dispatch(emitter: CoreGraphNode, event_name: SceneEvent | NodeEvent | ParamEvent, data?: any) {
		this._events_listener?.process_events(emitter, event_name, data);
	}
	get emit_allowed(): boolean {
		return (
			this.scene.loading_controller.loaded &&
			this._events_listener != null &&
			this.scene.loading_controller.auto_updating &&
			!Poly.instance().player_mode() // TODO: typecript: maybe I should still be able to emit events in player mode? - check how the Event Sop works
		);
	}
	// store_commit(event_name: string, payload: any = this) {
	// 	if (this._store) {
	// 		this._store.commit(`engine/${event_name}`, payload);
	// 	}
	// }
}
