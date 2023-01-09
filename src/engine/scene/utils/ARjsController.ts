import type {PolyScene} from '../PolyScene';
import type {CoreARjsController} from '../../../core/webXR/arjs/CoreARjsController';
import type {CoreARjsControllerOptions} from '../../../core/webXR/arjs/Common';

export type CoreARjsControllerCreateFunc = (options: CoreARjsControllerOptions) => CoreARjsController;

export class SceneARjsController {
	constructor(protected scene: PolyScene) {}

	private _controllerCreateFunction: CoreARjsControllerCreateFunc | undefined;
	private _controller: CoreARjsController | null = null;
	setControllerCreationFunction(func: CoreARjsControllerCreateFunc) {
		this._controllerCreateFunction = func;
	}

	createController(options: CoreARjsControllerOptions) {
		if (!this._controllerCreateFunction) {
			return;
		}
		const controller = this._controllerCreateFunction(options);
		this._controller = controller;
		return controller;
	}

	controller() {
		return this._controller;
	}
}
