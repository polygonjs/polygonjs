import {PolyScene} from 'src/engine/scene/PolyScene';

export class LoadingController {
	constructor(private scene: PolyScene) {}

	_loading_state: boolean;
	_auto_updating: boolean;
	_first_object_loaded: boolean = false;

	mark_as_loading() {
		this._set_loading_state(true);
	}
	mark_as_loaded() {
		this._set_loading_state(false);
		POLY.notify_scene_loaded(this.scene);
		// this.cooker().block()
		// this.root().set_children_dirty_without_propagation()
		// this.cooker().unblock()
	}
	_set_loading_state(state: boolean) {
		this._loading_state = state;
		this.set_auto_update(!this._loading_state);
	}
	get is_loading() {
		return this._loading_state;
	}
	get loaded() {
		return !this._loading_state;
	}
	get auto_updating() {
		return this._auto_updating;
	} // _init_auto_update: ->
	// 	this.set_auto_update(true)
	set_auto_update(new_state: boolean) {
		if (this._auto_updating !== new_state) {
			this._auto_updating = new_state;
			if (this._auto_updating) {
				// if this.env_is_development()
				// 	this.performance().start()

				const root = this.scene.root;
				if (root) {
					const c = async () => {
						await root.process_queue();
					};
					setTimeout(c, 50);
				}
			} else {
				// if (callback != null) { callback(); }
			}
		} else {
			// if (callback != null) { callback(); }
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

	on_all_objects_loaded() {
		// POLY.viewer_loaders_manager().dipose_loaders()
	}
}
