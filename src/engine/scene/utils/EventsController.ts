import {PolyScene} from 'src/engine/scene/PolyScene';

import {CoreGraphNode} from 'src/core/graph/CoreGraphNode';
import 'src/engine/Poly';

// type Callback = (emitter: CoreGraphNodeScene) => void; // TODO: typescript: maybe arg should be an event instead of the emitter
interface EventsListener {
	process_events: (emitter: CoreGraphNode, event_name: string, data: object | null) => void;
}

export class EventsController {
	constructor(private scene: PolyScene) {}

	_events_listener: EventsListener | undefined;

	set_listener(events_listener: EventsListener) {
		this._events_listener = events_listener;
		// this._store.scene = this;
	}
	get events_listener() {
		return this._events_listener;
	}
	dispatch(emitter: CoreGraphNode, event_name: string, data: object | null = {}) {
		// if (this._store && this._store.app) {
		this._events_listener?.process_events(emitter, event_name, data);
		// }
	}
	get emit_allowed(): boolean {
		return (
			this.scene.loading_controller.loaded &&
			this._events_listener != null &&
			this.scene.loading_controller.auto_updating &&
			!POLY.player_mode() // TODO: typecript: maybe I should still be able to emit events in player mode? - check how the Event Sop works
		);
	}
	// store_commit(event_name: string, payload: any = this) {
	// 	if (this._store) {
	// 		this._store.commit(`engine/${event_name}`, payload);
	// 	}
	// }
}
