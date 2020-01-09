import {PolyScene} from 'src/engine/scene/PolyScene';

import {BaseNode} from 'src/engine/nodes/_Base';
import 'src/engine/Poly';

export class EmitController {
	constructor(private scene: PolyScene) {}

	_store: any;

	set_store(store: any) {
		this._store = store;
		this._store.scene = this;
	}
	store() {
		return this._store;
	}
	dispatch_event(node: BaseNode, properties: object) {
		if (this._store && this._store.app) {
			this._store.app.dispatch_event(node, properties);
		}
	}
	get emit_allowed() {
		return (
			this.scene.loading_controller.loaded &&
			this._store != null &&
			this.scene.loading_controller.auto_updating &&
			!POLY.player_mode()
		);
	}
	store_commit(event_name: string, payload: any = this) {
		if (this._store) {
			this._store.commit(`engine/${event_name}`, payload);
		}
	}
}
