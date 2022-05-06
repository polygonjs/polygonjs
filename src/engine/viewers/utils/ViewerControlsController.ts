import {Camera} from 'three';
import {CameraControls} from '../../nodes/event/_BaseCameraControls';
import {TypedViewer} from '../_Base';

type UpdateControlsFunc = (delta: number) => void;

export class ViewerControlsController<C extends Camera> {
	protected _active: boolean = false;
	// protected _config: CameraControlsConfig | undefined;
	private _updateControlsFunc: UpdateControlsFunc | undefined;
	protected _controls: CameraControls | undefined;
	private _unmounted = false;
	// _bound_on_controls_start: () => void = this._on_controls_start.bind(this);
	// _bound_on_controls_end: () => void = this._on_controls_end.bind(this);
	constructor(private viewer: TypedViewer<C>) {
		// this._update_graph_node();
	}

	controls() {
		return this._controls;
	}

	mount() {
		this._unmounted = false;
		const controlsNode = this.viewer.controlsNode();
		const camera = this.viewer.camera();
		if (!(controlsNode && camera)) {
			return;
		}
		controlsNode.applyControls(camera, this.viewer).then((controls) => {
			this._controls = controls;
			this._updateControlsFunc = controls ? controls.update : undefined;

			if (this._unmounted) {
				this._disposeControls();
			}
		});
	}
	unmount() {
		this._unmounted = true;
		this._disposeControls();
		// dispose controls
		// this._controlsNode = undefined;
	}
	private _disposeControls() {
		if (this._controls) {
			this._controls.dispose();
			// this._controls = undefined;
			// this._updateControlsFunc = undefined;
		}
		this._updateControlsFunc = undefined;
	}
	update(delta: number) {
		if (this._updateControlsFunc) {
			this._updateControlsFunc(delta);
		}
	}

	// async create_controls() {
	// 	this.dispose_controls();
	// 	const canvas = this.viewer.canvas();

	// 	if (!canvas) {
	// 		return;
	// 	}

	// 	// this._config = await this.viewer.cameraControlsController()?.apply_controls(this.viewer);
	// 	// if (this._config) {
	// 	// 	this._controls = this._config.controls;

	// 	// 	if (this._controls) {
	// 	// 		if (this.viewer.active()) {
	// 	// 			this._controls.addEventListener('start', this._bound_on_controls_start);
	// 	// 			this._controls.addEventListener('end', this._bound_on_controls_end);
	// 	// 		} else {
	// 	// 			this.dispose_controls();
	// 	// 		}
	// 	// 	}
	// 	// }
	// }
	// update(delta: number) {
	// 	if (this._config && this._controls) {
	// 		if (this._config.updateRequired()) {
	// 			this._controls.update(delta);
	// 		}
	// 	}
	// }

	// dispose() {
	// 	this._graph_node?.graphDisconnectPredecessors();
	// 	this.dispose_controls();
	// }
	// dispose_controls() {
	// 	if (this._controls) {
	// 		const canvas = this.viewer.canvas();
	// 		if (canvas) {
	// 			// this.viewer?.cameraControlsController().dispose_controls(canvas);
	// 		}

	// 		if (this._bound_on_controls_start) {
	// 			this._controls.removeEventListener('start', this._bound_on_controls_start);
	// 		}
	// 		if (this._bound_on_controls_end) {
	// 			this._controls.removeEventListener('end', this._bound_on_controls_end);
	// 		}

	// 		this._controls.dispose();
	// 		this._controls = null;
	// 	}
	// }
	// private _on_controls_start() {
	// 	this._active = true;
	// }
	// private _on_controls_end() {
	// 	this._active = false;
	// }

	// private _graph_node: CoreGraphNode | undefined;
	// private _update_graph_node() {
	// 	// const controlsParam = this.viewer.cameraNode().p.controls;
	// 	// this._graph_node = this._graph_node || this._create_graph_node();
	// 	// if (!this._graph_node) {
	// 	// 	return;
	// 	// }
	// 	// this._graph_node.graphDisconnectPredecessors();
	// 	// this._graph_node.addGraphInput(controlsParam);
	// }
	// private _create_graph_node() {
	// 	// const node = new CoreGraphNode(this.viewer.cameraNode().scene(), 'viewer-controls');
	// 	// node.addPostDirtyHook('this.viewer.controlsController', async () => {
	// 	// 	await this.create_controls();
	// 	// });
	// 	// return node;
	// }
}
