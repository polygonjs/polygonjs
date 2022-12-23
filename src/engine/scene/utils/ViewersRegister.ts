import {BaseViewerType} from '../../viewers/_Base';
import {PolyScene} from '../../scene/PolyScene';
// import {BaseCameraObjNodeType} from '../../nodes/obj/_BaseCamera';
import {Camera} from 'three';
import {Poly} from '../../Poly';
import {ViewerCallbackOptions} from '../../poly/registers/cameras/PolyCamerasRegister';

// type CameraNode = BaseCameraObjNodeType;
interface GetViewerOptions {
	camera: Camera;
	canvas?: HTMLCanvasElement;
}
export class ViewersRegister {
	private _viewersById: Map<string, BaseViewerType> = new Map();
	// private _viewersByCamera: Map<Camera, BaseViewerType> = new Map();
	private _firstViewer: BaseViewerType | undefined;
	private _lastRenderedViewer: BaseViewerType | undefined;
	constructor(protected scene: PolyScene) {}

	registerViewer(viewer: BaseViewerType) {
		this._viewersById.set(viewer.id(), viewer);
		// this._viewersByCamera.set(viewer.camera(), viewer);
		this._updateCache();
	}
	unregisterViewer(viewer: BaseViewerType) {
		this._viewersById.delete(viewer.id());
		// this._viewersByCamera.delete(viewer.camera());
		this._updateCache();
	}

	traverseViewers(callback: (viewer: BaseViewerType) => void) {
		this._viewersById.forEach(callback);
	}

	viewer(options: GetViewerOptions) {
		// const existingViewer = this._viewersByCamera.get(camera);
		// if (existingViewer) {
		// 	return existingViewer;
		// }
		const createViewerOptions: ViewerCallbackOptions<Camera> = {
			camera: options.camera,
			canvas: options.canvas,
			scene: this.scene,
		};
		const newViewer = Poly.camerasRegister.createViewer(createViewerOptions); //cameraNode.createViewer();
		return newViewer;
	}

	firstViewer() {
		return this._firstViewer;
	}
	markViewerAsRendered(viewer: BaseViewerType) {
		this._lastRenderedViewer = viewer;
	}
	lastRenderedViewer() {
		return this._lastRenderedViewer;
	}
	private _updateCache() {
		this._firstViewer = undefined;
		this._viewersById.forEach((viewer) => {
			this._firstViewer = this._firstViewer || viewer;
		});
	}
}
