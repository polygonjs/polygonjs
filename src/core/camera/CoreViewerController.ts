import {Camera} from 'three';
import {TypedViewer} from '../../engine/viewers/_Base';

type ViewerCreateCallback<C extends Camera> = (camera: C) => TypedViewer<C>;

export class CoreViewerController {
	private _registeredViewerCreateCallbackByCamera: Map<Camera, ViewerCreateCallback<Camera>> = new Map();

	constructor() {}

	register<C extends Camera>(cameraClass: any, viewerCreateCallback: ViewerCreateCallback<any>) {
		this._registeredViewerCreateCallbackByCamera.set(cameraClass, viewerCreateCallback);
	}
	createViewer<C extends Camera>(camera: any) {
		const callback = this._registeredViewerCreateCallbackByCamera.get(camera.constructor);
		if (callback) {
			return callback(camera);
		}
	}
}
