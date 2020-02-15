import {BaseViewer} from '../_Base';
import {CameraControls} from 'src/engine/nodes/event/_BaseCameraControls';

export class ControlsController {
	protected _active: boolean = false;
	protected _controls: CameraControls | null = null;
	_bound_on_controls_start: () => void = this._on_controls_start.bind(this);
	_bound_on_controls_end: () => void = this._on_controls_end.bind(this);
	constructor(private viewer: BaseViewer) {}

	get active() {
		return this._active;
	}
	get camera_node() {
		return this.viewer.cameras_controller.camera_node;
	}

	async create_controls() {
		this.dispose_controls();

		const config = await this.camera_node?.controls_controller.apply_controls(this.viewer.canvas);
		if (config) {
			// this.current_camera_controls_node_graph_id = config.camera_controls_node_id()
			this._controls = config.controls;
			// this._controls_node = config.controls_node()

			if (this._controls) {
				if (this.viewer.active) {
					this._controls.addEventListener('start', this._bound_on_controls_start);
					this._controls.addEventListener('end', this._bound_on_controls_end);
				} else {
					this.dispose_controls();
				}
			}

			// test in case @_is_active has changed
			// if (this._is_active != true && this._controls){
			// 	this._dispose_controls()

			// }
			// TODO
			// we have to reassign the camera here, as this method is called twice
			// and the first time without the controls being present apparently.. (more tests needed)
			// CURRENT ANSWER: the method this.prepare_current_camera() is called twice on app load
			// which only cause problems when switching back to perspective.
			// @_current_camera = cloned_camera
			//@_controls = controls
			// this.$emit('before_controls_apply', controls)
		}
	}
	update() {
		if (this._controls) {
			this._controls.update();
		}
	}

	dispose_controls() {
		if (this._controls) {
			this.camera_node?.controls_controller.dispose_controls(this.viewer.canvas);

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
}
