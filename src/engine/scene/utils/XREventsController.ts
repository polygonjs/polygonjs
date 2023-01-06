import {CoreARController} from '../../../core/xr/CoreARController';
import {CoreVRController} from '../../../core/xr/CoreVRController';
import {BaseCoreXRController} from '../../../core/xr/_BaseCoreXRController';
import {PolyScene} from '../PolyScene';

export class SceneXRController {
	constructor(protected scene: PolyScene) {}

	private _XRController: BaseCoreXRController | undefined;
	private _VRController: CoreVRController | undefined;
	private _ARController: CoreARController | undefined;
	setARController(ARController: CoreARController) {
		this._XRController = ARController;
		this._ARController = ARController;
	}

	setVRController(VRController: CoreVRController) {
		this._XRController = VRController;
		this._VRController = VRController;
	}
	XRController() {
		return this._XRController;
	}
	ARController() {
		return this._ARController;
	}
	VRController() {
		return this._VRController;
	}
}
