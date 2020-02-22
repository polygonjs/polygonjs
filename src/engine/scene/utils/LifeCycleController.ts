import {PolyScene} from '../PolyScene';

export class LifeCycleController {
	constructor(private scene: PolyScene) {}

	private _lifecycle_on_create_allowed: boolean = true;

	on_create_hook_allowed(): boolean {
		return this.scene.loading_controller.loaded && this._lifecycle_on_create_allowed;
	}

	on_create_prevent(callback: () => void) {
		this._lifecycle_on_create_allowed = false;
		callback();
		this._lifecycle_on_create_allowed = true;
	}
}
