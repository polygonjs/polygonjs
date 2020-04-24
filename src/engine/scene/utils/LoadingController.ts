import {PolyScene} from '../PolyScene';
import {SceneEventType} from './events/SceneEventsController';

const LOADED_EVENT_CONTEXT = {event: new Event(SceneEventType.LOADED)};
export class LoadingController {
	constructor(private scene: PolyScene) {}

	_loading_state: boolean = true;
	_auto_updating: boolean = true;
	_first_object_loaded: boolean = false;

	mark_as_loading() {
		this._set_loading_state(true);
	}
	async mark_as_loaded() {
		await this._set_loading_state(false);
		this.scene.events_dispatcher.process_event(LOADED_EVENT_CONTEXT);
	}
	private async _set_loading_state(state: boolean) {
		this._loading_state = state;
		await this.set_auto_update(!this._loading_state);
	}
	get is_loading() {
		return this._loading_state;
	}
	get loaded() {
		return !this._loading_state;
	}
	get auto_updating() {
		return this._auto_updating;
	}
	async set_auto_update(new_state: boolean) {
		if (this._auto_updating !== new_state) {
			this._auto_updating = new_state;
			if (this._auto_updating) {
				// if this.env_is_development()
				// 	this.performance().start()

				const root = this.scene.root;
				if (root) {
					await root.process_queue();
				}
			}
		}
	}

	on_first_object_loaded() {
		if (!this._first_object_loaded) {
			this._first_object_loaded = true;

			const loader = document.getElementById('scene_loading_container');
			if (loader) {
				loader.parentElement?.removeChild(loader);
			}
		}
	}

	// on_all_objects_loaded() {
	// 	// POLY.viewer_loaders_manager().dipose_loaders()
	// }
}
