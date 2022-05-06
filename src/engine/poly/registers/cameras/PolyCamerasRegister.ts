import {Camera, Object3D} from 'three';
import {PolyScene} from '../../../scene/PolyScene';
import {PolyEngine} from '../../../Poly';
import {TypedViewer} from '../../../viewers/_Base';

export interface ViewerCallbackOptions<C extends Camera> {
	camera: C;
	scene: PolyScene;
	canvas?: HTMLCanvasElement;
}

export type ViewerCreateCallback<C extends Camera> = (options: ViewerCallbackOptions<C>) => TypedViewer<C>;

export class PolyCamerasRegister {
	private _cameraNodeTypes: string[] = [];
	private _registeredViewerCreateCallbackByCamera: Map<typeof Camera, ViewerCreateCallback<Camera>> = new Map();

	constructor(poly: PolyEngine) {}

	registerNodeType(nodeType: string) {
		if (!this._cameraNodeTypes.includes(nodeType)) {
			this._cameraNodeTypes.push(nodeType);
		}
	}
	registeredNodeTypes() {
		return this._cameraNodeTypes;
	}
	register<C extends Camera>(cameraClass: any, viewerCreateCallback: ViewerCreateCallback<C>) {
		this._registeredViewerCreateCallbackByCamera.set(cameraClass, viewerCreateCallback as any);
	}
	createViewer<C extends Camera>(options: ViewerCallbackOptions<C>) {
		const callback = this._registeredViewerCreateCallbackByCamera.get(options.camera.constructor as typeof Camera);
		if (!callback) {
			console.error('no createViewer callback available');
			console.log(
				'createViewer',
				options.camera,
				options.camera.constructor,
				this._registeredViewerCreateCallbackByCamera
			);
			return;
		}
		return callback(options);
	}
	objectRegistered(object: Object3D) {
		const callback = this._registeredViewerCreateCallbackByCamera.get(object.constructor as typeof Camera);
		return callback != null;
	}
}
