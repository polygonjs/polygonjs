import {BaseViewerType} from '../../viewers/_Base';
import {PolyScene} from '../../scene/PolyScene';
import {Camera} from 'three';
import {Poly} from '../../Poly';
import {ViewerCallbackOptions} from '../../poly/registers/cameras/PolyCamerasRegister';
import {CoreGraphNode} from '../../../core/graph/CoreGraphNode';

interface GetViewerOptions {
	camera: Camera;
	canvas?: HTMLCanvasElement;
}
export class ViewersRegister {
	private _viewersById: Map<string, BaseViewerType> = new Map();
	private _firstViewer: BaseViewerType | undefined;
	private _lastRenderedViewer: BaseViewerType | undefined;
	constructor(protected _scene: PolyScene) {}

	registerViewer(viewer: BaseViewerType) {
		this._viewersById.set(viewer.id(), viewer);
		this._updateCache();
	}
	unregisterViewer(viewer: BaseViewerType) {
		this._viewersById.delete(viewer.id());
		this._updateCache();
	}

	traverseViewers(callback: (viewer: BaseViewerType) => void) {
		this._viewersById.forEach(callback);
	}

	viewer(options: GetViewerOptions) {
		const createViewerOptions: ViewerCallbackOptions<Camera> = {
			camera: options.camera,
			canvas: options.canvas,
			scene: this._scene,
		};
		return Poly.camerasRegister.createViewer(createViewerOptions);
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
	/**
	 * resize graphNode
	 */
	private _graphNode: CoreGraphNode | undefined;
	graphNode() {
		return (this._graphNode = this._graphNode || this._createGraphNode());
	}
	private _createGraphNode() {
		const coreGraphNode = new CoreGraphNode(this._scene, 'SceneViewersRegister');
		return coreGraphNode;
	}
	// private _viewerWithResizeRequired: Set<string> = new Set();
	markViewerAsSizeUpdated(viewer: BaseViewerType) {
		if (!this._viewersById.has(viewer.id())) {
			return;
		}
		// if (this._viewerWithResizeRequired.has(viewer.id())) {
		// 	return;
		// }
		// this._viewerWithResizeRequired.add(viewer.id());
		this._graphNode?.setDirty();
	}
	// markViewerAsResizeCompleted(viewer: BaseViewerType) {
	// 	if (!this._viewersById.has(viewer.id())) {
	// 		return;
	// 	}
	// 	this._viewerWithResizeRequired.delete(viewer.id());
	// }
	// isViewerResizeRequired(viewer: BaseViewerType) {
	// 	return this._viewerWithResizeRequired.has(viewer.id());
	// }
	// updateViewersSize() {
	// 	this._viewerWithResizeRequired.forEach((viewerId) => {
	// 		const viewer = this._viewersById.get(viewerId);
	// 		if (viewer) {
	// 			viewer.updateSize();
	// 		}
	// 	});
	// }
}
