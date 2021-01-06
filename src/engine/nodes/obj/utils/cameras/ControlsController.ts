import {BaseThreejsCameraObjNodeType, UpdateFromControlsMode, UPDATE_FROM_CONTROLS_MODES} from '../../_BaseCamera';
import {BaseCameraControlsEventNodeType, CameraControls} from '../../../event/_BaseCameraControls';
import {CameraControlsConfig} from '../../../event/utils/CameraControlConfig';
import {BaseParamType} from '../../../../params/_Base';
import {TypeAssert} from '../../../../poly/Assert';
import {CAMERA_CONTROLS_NODE_TYPES} from '../../../../poly/NodeContext';

const CONTROLS_PARAM_NAME = 'controls';

type HTMLElementId = string;
type ControlsId = string;
type AppliedControls = Map<HTMLElementId, Map<ControlsId, BaseCameraControlsEventNodeType>>;

export class ThreejsCameraControlsController {
	private _applied_controls_by_element_id: AppliedControls = new Map();
	private _controls_node: BaseCameraControlsEventNodeType | null = null;
	// private controls_start_listener: (() => void) | undefined;
	private controls_change_listener: (() => void) | undefined;
	private controls_end_listener: (() => void) | undefined;

	constructor(private node: BaseThreejsCameraObjNodeType) {}

	controls_param(): BaseParamType | null {
		if (this.node.params.has(CONTROLS_PARAM_NAME)) {
			return this.node.params.get(CONTROLS_PARAM_NAME);
		}
		return null;
	}

	async controls_node(): Promise<BaseCameraControlsEventNodeType | null> {
		const controls_param = this.node.p.controls;
		const raw_input = controls_param.raw_input;
		if (raw_input && raw_input != '') {
			if (controls_param.is_dirty) {
				await controls_param.compute();
			}
			const node = controls_param.value.node();
			if (node) {
				if (CAMERA_CONTROLS_NODE_TYPES.includes(node.type)) {
					return node as BaseCameraControlsEventNodeType;
				} else {
					this.node.states.error.set('found node is not of a camera control type');
				}
			} else {
				this.node.states.error.set('no node has been found');
			}
		}
		return null;
	}

	async update_controls() {
		const controls_node = await this.controls_node();
		if (controls_node) {
			if (this._controls_node != controls_node) {
				this._dispose_control_refs();
			}
		}

		this._controls_node = controls_node;
	}

	async apply_controls(html_element: HTMLElement) {
		const controls_node = await this.controls_node();
		if (controls_node) {
			const controls_id = controls_node.controls_id();
			let controls_aleady_applied = false;

			let map_for_element = this._applied_controls_by_element_id.get(html_element.id);
			if (map_for_element && map_for_element.get(controls_id)) {
				controls_aleady_applied = true;
			}
			if (!controls_aleady_applied) {
				// this._last_control_node_id = controls_id;
				map_for_element = new Map();
				this._applied_controls_by_element_id.set(html_element.id, map_for_element);
				map_for_element.set(controls_id, controls_node);

				// requestContainer forces a cook
				//controls_node.requestContainer (controls_container)=>
				const controls = await controls_node.apply_controls(this.node.object, html_element);
				const config = new CameraControlsConfig(this.node.graph_node_id, controls_node, controls);
				// controls_node.set_from_camera_node(controls, this.node);
				this.set_controls_events(controls);
				return config;
			}
		}
	}
	private _dispose_control_refs() {
		this._applied_controls_by_element_id.forEach((map_for_element, element_id) => {
			this._dispose_controls_for_element_id(element_id);
		});

		this._applied_controls_by_element_id.clear();
	}
	private _dispose_controls_for_element_id(html_element_id: string) {
		const map_for_element = this._applied_controls_by_element_id.get(html_element_id);
		if (map_for_element) {
			map_for_element.forEach((controls_node, controls_id) => {
				controls_node.dispose_controls_for_html_element_id(html_element_id);
			});
		}

		this._applied_controls_by_element_id.delete(html_element_id);
		// if (this._applied_controls_by_element_id[html_element.id]) {
		// 	const controls_node = await this.controls_node();
		// 	if (controls_node) {
		// 		const controls_id = controls_node.controls_id();
		// 		delete this._applied_controls_by_element_id[html_element.id][controls_id];
		// 	}
		// }
		// @_controls_node?.dispose_controls()
		// if(this._applied_controls_by_element_id[html_element.id]){
		// 	delete this._applied_controls_by_element_id[html_element.id][controls_id]
		// }
		// this._last_control_node_id = null
	}

	// calling dispose controls
	// ensure that we can set the camera menu to camera1, then camera2 and back to camera1
	// and controls will be cleared each time
	async dispose_controls(html_element: HTMLElement) {
		this._dispose_controls_for_element_id(html_element.id);
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

		// this.controls_start_listener = () => {
		// 	this.on_controls_start(controls);
		// };
		const update_mode = UPDATE_FROM_CONTROLS_MODES[this.node.pv.updateFromControlsMode];
		switch (update_mode) {
			case UpdateFromControlsMode.ON_END:
				return this._set_controls_events_to_update_on_end(controls);
			case UpdateFromControlsMode.ALWAYS:
				return this._set_controls_events_to_update_always(controls);
			case UpdateFromControlsMode.NEVER:
				return this._reset(controls);
		}
		TypeAssert.unreachable(update_mode);
	}
	private _reset(controls: CameraControls) {
		if (this.controls_change_listener) {
			controls.removeEventListener('change', this.controls_change_listener);
			this.controls_change_listener = undefined;
		}
		if (this.controls_end_listener) {
			controls.removeEventListener('end', this.controls_end_listener);
			this.controls_end_listener = undefined;
		}
	}
	private _set_controls_events_to_update_on_end(controls: CameraControls) {
		this._reset(controls);
		this.controls_end_listener = () => {
			this.node.update_transform_params_from_object();
		};
		controls.addEventListener('end', this.controls_end_listener);
	}
	private _set_controls_events_to_update_always(controls: CameraControls) {
		this._reset(controls);
		this.controls_change_listener = () => {
			this.node.update_transform_params_from_object();
		};
		controls.addEventListener('change', this.controls_change_listener);
	}

	// private _update_camera_params() {
	// 	if (this.node.pv.allowUpdateFromControls) {
	// 		this.node.update_transform_params_from_object();
	// 	}
	// }
}
