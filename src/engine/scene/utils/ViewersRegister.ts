import {BaseViewerType} from '../../viewers/_Base';
import {PolyScene} from '../..';

export class ViewersRegister {
	private _viewers_by_id: Map<number, BaseViewerType> = new Map();
	constructor(protected scene: PolyScene) {}

	register_viewer(viewer: BaseViewerType) {
		this._viewers_by_id.set(viewer.id, viewer);
	}
	unregister_viewer(viewer: BaseViewerType) {
		this._viewers_by_id.delete(viewer.id);
	}
	traverse_viewers(callback: (viewer: BaseViewerType) => void) {
		this._viewers_by_id.forEach(callback);
	}
}
