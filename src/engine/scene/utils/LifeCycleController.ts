import {PolyScene} from '../PolyScene';

// TODO: considerer removing this module
// since now the on create hooks should all be in the editor
export class SceneLifeCycleController {
	constructor(private scene: PolyScene) {}

	private _lifecycleOnAfterCreatedAllowed: boolean = true;

	onAfterCreatedCallbackAllowed(): boolean {
		return this.scene.loadingController.loaded() && this._lifecycleOnAfterCreatedAllowed;
	}

	onAfterCreatedPrevent(callback: () => void) {
		this._lifecycleOnAfterCreatedAllowed = false;
		callback();
		this._lifecycleOnAfterCreatedAllowed = true;
	}
}
