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
	controllerCreateFunction() {
		return this._controllerCreateFunction;
	}
	setController(controller: CoreARjsController | null) {
		this._controller = controller;
	}
	controller() {
		return this._controller;
	}
}
