import {ThreejsViewer} from '../Threejs';
import {CameraControls} from '../../nodes/event/_BaseCameraControls';
import {CoreGraphNode} from '../../../core/graph/CoreGraphNode';
import {CameraControlsConfig} from '../../nodes/event/utils/CameraControlConfig';

export class ViewerControlsController {
	protected _active: boolean = false;
	protected _config: CameraControlsConfig | undefined;
	protected _controls: CameraControls | null = null;
	_bound_on_controls_start: () => void = this._on_controls_start.bind(this);
	_bound_on_controls_end: () => void = this._on_controls_end.bind(this);
	constructor(private viewer: ThreejsViewer) {
		this._update_graph_node();
	}

	controls() {
		return this._controls;
	}

	async create_controls() {
		this.dispose_controls();
		const canvas = this.viewer.canvas();

		if (!canvas) {
			return;
		}

		this._config = await this.viewer.cameraControlsController?.apply_controls(this.viewer);
		if (this._config) {
			this._controls = this._config.controls;

			if (this._controls) {
				if (this.viewer.active()) {
					this._controls.addEventListener('start', this._bound_on_controls_start);
					this._controls.addEventListener('end', this._bound_on_controls_end);
				} else {
					this.dispose_controls();
				}
			}
		}
	}
	update() {
		if (this._config && this._controls) {
			if (this._config.update_required()) {
				this._controls.update();
			}
		}
	}

	dispose() {
		this._graph_node?.graphDisconnectPredecessors();
		this.dispose_controls();
	}
	dispose_controls() {
		if (this._controls) {
			const canvas = this.viewer.canvas();
			if (canvas) {
				this.viewer?.cameraControlsController.dispose_controls(canvas);
			}

			if (this._bound_on_controls_start) {
				this._controls.removeEventListener('start', this._bound_on_controls_start);
			}
			if (this._bound_on_controls_end) {
				this._controls.removeEventListener('end', this._bound_on_controls_end);
			}

			this._controls.dispose();
			this._controls = null;
		}
	}
	private _on_controls_start() {
		this._active = true;
	}
	private _on_controls_end() {
		this._active = false;
	}

	private _graph_node: CoreGraphNode | undefined;
	private _update_graph_node() {
		const controls_param = this.viewer.cameraNode().p.controls;
		this._graph_node = this._graph_node || this._create_graph_node();
		if (!this._graph_node) {
			return;
		}
		this._graph_node.graphDisconnectPredecessors();
		this._graph_node.addGraphInput(controls_param);
	}
	private _create_graph_node() {
		const node = new CoreGraphNode(this.viewer.cameraNode().scene(), 'viewer-controls');
		node.addPostDirtyHook('this.viewer.controls_controller', async () => {
			await this.viewer.controlsController.create_controls();
		});
		return node;
	}
}
