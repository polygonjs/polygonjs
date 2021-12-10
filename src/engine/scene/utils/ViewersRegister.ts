import {BaseViewerType} from '../../viewers/_Base';
import {PolyScene} from '../../scene/PolyScene';

export class ViewersRegister {
	private _viewersById: Map<number, BaseViewerType> = new Map();
	private _firstViewer: BaseViewerType | undefined;
	constructor(protected scene: PolyScene) {}

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
