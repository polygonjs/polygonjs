import {BaseViewerType} from '../../viewers/_Base';
import {PolyScene} from '../../scene/PolyScene';

export class ViewersRegister {
	private _viewers_by_id: Map<number, BaseViewerType> = new Map();
	constructor(protected scene: PolyScene) {}

	registerViewer(viewer: BaseViewerType) {
		this._viewers_by_id.set(viewer.id(), viewer);
	}
	unregisterViewer(viewer: BaseViewerType) {
		this._viewers_by_id.delete(viewer.id());
	}
	traverseViewers(callback: (viewer: BaseViewerType) => void) {
		this._viewers_by_id.forEach(callback);
	}
}
