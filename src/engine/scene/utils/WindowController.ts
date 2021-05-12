import {CoreGraphNode} from '../../../core/graph/CoreGraphNode';
import {PolyScene} from '../PolyScene';

export class WindowController {
	private _coreGraphNode: CoreGraphNode | undefined;
	constructor(private _scene: PolyScene) {}
	graphNode() {
		return (this._coreGraphNode = this._coreGraphNode || this._createGraphNode());
	}
	private _createGraphNode() {
		const coreGraphNode = new CoreGraphNode(this._scene, 'SceneWindowController');

		window.addEventListener('resize', this._onWindowResizeBound);

		return coreGraphNode;
	}
	private _onWindowResizeBound = this._onWindowResize.bind(this);
	private _onWindowResize() {
		// TODO: consider throttle
		this.graphNode().setSuccessorsDirty();
	}

	dispose() {
		window.removeEventListener('resize', this._onWindowResizeBound);
	}
}
