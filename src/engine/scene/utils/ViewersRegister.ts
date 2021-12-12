import {BaseViewerType} from '../../viewers/_Base';
import {PolyScene} from '../../scene/PolyScene';
import {BaseCameraObjNodeType} from '../../nodes/obj/_BaseCamera';

type CameraNode = BaseCameraObjNodeType;
export class ViewersRegister {
	private _viewersById: Map<number, BaseViewerType> = new Map();
	private _viewersByCamera: Map<CameraNode, BaseViewerType> = new Map();
	private _firstViewer: BaseViewerType | undefined;
	constructor(protected scene: PolyScene) {}

	registerViewer(viewer: BaseViewerType) {
		this._viewersById.set(viewer.id(), viewer);
		this._viewersByCamera.set(viewer.cameraNode(), viewer);
		this._updateCache();
	}
	unregisterViewer(viewer: BaseViewerType) {
		this._viewersById.delete(viewer.id());
		this._viewersByCamera.delete(viewer.cameraNode());
		this._updateCache();
	}
	traverseViewers(callback: (viewer: BaseViewerType) => void) {
		this._viewersById.forEach(callback);
	}

	viewerWithCamera(cameraNode: CameraNode) {
		const existingViewer = this._viewersByCamera.get(cameraNode);
		if (existingViewer) {
			return existingViewer;
		}
		const newViewer = cameraNode.createViewer();
		return newViewer;
	}

	firstViewer() {
		return this._firstViewer;
	}
	private _updateCache() {
		this._firstViewer = undefined;
		this._viewersById.forEach((viewer) => {
			this._firstViewer = this._firstViewer || viewer;
		});
	}
}
