import {PolyScene} from '../PolyScene';

// TODO: considerer removing this module
// since now the on create hooks should all be in the editor
export class LifeCycleController {
	constructor(private scene: PolyScene) {}

	private _lifecycle_on_create_allowed: boolean = true;

	onCreateHookAllowed(): boolean {
		return this.scene.loadingController.loaded() && this._lifecycle_on_create_allowed;
	}

	onCreatePrevent(callback: () => void) {
		this._lifecycle_on_create_allowed = false;
		callback();
		this._lifecycle_on_create_allowed = true;
	}
}
