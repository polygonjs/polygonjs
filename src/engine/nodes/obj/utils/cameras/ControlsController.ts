import {BaseCameraObjNode} from 'src/engine/nodes/obj/_BaseCamera';
import {BaseCameraControlsEventNode, CameraControls} from 'src/engine/nodes/event/_BaseCameraControls';
import {CameraControlsConfig} from 'src/engine/nodes/event/utils/CameraControlConfig';
import {BaseParam} from 'src/engine/params/_Base';

const CONTROLS_PARAM_NAME = 'controls';

export class ControlsController {
	_applied_controls_by_element_id: Dictionary<Dictionary<boolean>> = {};
	private _controls_node: BaseCameraControlsEventNode | null;
	private controls_start_listener: () => void;
	private controls_end_listener: () => void;

	constructor(private node: BaseCameraObjNode) {}

	controls_param(): BaseParam | null {
		if (this.node.params.has(CONTROLS_PARAM_NAME)) {
			return this.node.params.get(CONTROLS_PARAM_NAME);
		}
		return null;
	}

	controls_node(): BaseCameraControlsEventNode | null {
		if (this.node.params.has(CONTROLS_PARAM_NAME)) {
			return this.node.params.get_operator_path(CONTROLS_PARAM_NAME).found_node() as BaseCameraControlsEventNode;
		}
		return null;
	}

	update_controls() {
		const controls_node = this.controls_node();
		if (controls_node) {
			if (this._controls_node != controls_node) {
				this.dispose_control_refs();
			}
		}

		this._controls_node = controls_node;
	}

	async apply_controls(html_element: HTMLElement) {
		const controls_node = this.controls_node();
		if (controls_node) {
			// keep last_control_node_id to ensure we don't apply the controls more than once
			// OR it allow the viewer to remain in control of this
			//if !@_last_control_node_id? || (@_last_control_node_id != controls_node.graph_node_id())
			// but for now, the controls are still applied again after mouse up
			const controls_id = controls_node.graph_node_id();
			let controls_aleady_applied = false;
			if (
				this._applied_controls_by_element_id[html_element.id] &&
				this._applied_controls_by_element_id[html_element.id][controls_id]
			) {
				controls_aleady_applied = true;
			}
			if (!controls_aleady_applied) {
				// this._last_control_node_id = controls_id
				this._applied_controls_by_element_id[html_element.id] =
					this._applied_controls_by_element_id[html_element.id] || {};
				this._applied_controls_by_element_id[html_element.id][controls_id] = true;

				// request_container forces a cook
				//controls_node.request_container (controls_container)=>
				const controls = await controls_node.apply_controls(this.node.object, html_element);
				const config = new CameraControlsConfig(this.node.graph_node_id(), controls_node, controls);
				controls_node.set_from_camera_node(controls, this.node);
				this.set_controls_events(controls);
				return config;
			}
		}
	}
	dispose_control_refs() {
		this._applied_controls_by_element_id = {};
	}

	// calling dispose controls
	// ensure that we can set the camera menu to camera1, then camera2 and back to camera1
	// and controls will be cleared each time
	dispose_controls(html_element: HTMLElement) {
		if (this._applied_controls_by_element_id[html_element.id]) {
			const controls_node = this.controls_node();
			if (controls_node) {
				const controls_id = controls_node.graph_node_id();
				delete this._applied_controls_by_element_id[html_element.id][controls_id];
			}
		}
		// @_controls_node?.dispose_controls()
		// if(this._applied_controls_by_element_id[html_element.id]){
		// 	delete this._applied_controls_by_element_id[html_element.id][controls_id]
		// }
		// this._last_control_node_id = null
	}
	set_controls_events(controls: CameraControls) {
		// restore target (for orbit controls only for now)
		// to ensure that camera does not reset its target on 0,0,0 on first move
		// const controls_node = this.controls_node()
		// if (controls_node){
		// 	controls_node.
		// }
		// if(controls.target){
		// 	controls.target.copy(this._param_target) //.clone()
		// }

		this.controls_start_listener = () => {
			this.on_controls_start(controls);
		};
		this.controls_end_listener = () => {
			this.on_controls_end(controls);
		};
		controls.addEventListener('start', this.controls_start_listener);
		controls.addEventListener('end', this.controls_end_listener);
	}

	on_controls_start(controls: CameraControls) {
		// this.param('is_updating').set(1)
	}
	on_controls_end(controls: CameraControls) {
		// this.param('is_updating').set(0)
		if (controls.target) {
			const val = controls.target.toArray() as [number, number, number];
			this.node.params.set_vector3('target', val);
		}
		this.node.update_transform_params_from_object();
	}
}
