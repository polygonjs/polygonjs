import {Camera} from 'three/src/cameras/Camera';

import {TypedCameraControlsEventNode} from './_BaseCameraControls';
// import {BaseCameraObjNodeType} from '../obj/_BaseCamera';

import {OrbitControls} from '../../../../modules/three/examples/jsm/controls/OrbitControls';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {EventConnectionPoint, EventConnectionPointType} from '../utils/io/connections/Event';
import {BaseNodeType} from '../_Base';

const OUTPUT_START = 'start';
const OUTPUT_CHANGE = 'change';
const OUTPUT_END = 'end';
class CameraOrbitEventParamsConfig extends NodeParamsConfig {
	allow_pan = ParamConfig.BOOLEAN(1);
	allow_rotate = ParamConfig.BOOLEAN(1);
	allow_zoom = ParamConfig.BOOLEAN(1);
	tdamping = ParamConfig.BOOLEAN(1);
	damping = ParamConfig.FLOAT(0.1, {
		visible_if: {tdamping: true},
	});
	screen_space_panning = ParamConfig.BOOLEAN(1);
	rotate_speed = ParamConfig.FLOAT(0.5);
	min_distance = ParamConfig.FLOAT(1, {
		range: [0, 100],
		range_locked: [true, false],
	});
	max_distance = ParamConfig.FLOAT(50, {
		range: [0, 100],
		range_locked: [true, false],
	});
	polar_angle_range = ParamConfig.VECTOR2([0, '$PI']);
	target28 = ParamConfig.VECTOR3([0, 0, 0], {
		cook: false,
		compute_on_dirty: true,
		callback: (node: BaseNodeType) => {
			CameraOrbitControlsEventNode.PARAM_CALLBACK_update_target(node as CameraOrbitControlsEventNode);
		},
	});
}
const ParamsConfig = new CameraOrbitEventParamsConfig();

export class CameraOrbitControlsEventNode extends TypedCameraControlsEventNode<CameraOrbitEventParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'camera_orbit_controls';
	}
	initialize_node() {
		this.io.outputs.set_named_output_connection_points([
			new EventConnectionPoint(OUTPUT_START, EventConnectionPointType.BASE),
			new EventConnectionPoint(OUTPUT_CHANGE, EventConnectionPointType.BASE),
			new EventConnectionPoint(OUTPUT_END, EventConnectionPointType.BASE),
		]);
	}

	private _controls_by_element_id: Map<string, OrbitControls> = new Map();

	async create_controls_instance(camera: Camera, element: HTMLElement) {
		console.log('create_controls_instance');
		const controls = new OrbitControls(camera, element);
		controls.addEventListener('end', () => {
			this._on_controls_end(controls);
		});
		// let x = controls.target.x;
		// Object.defineProperty(controls.target, 'thisismytarget', {
		// 	get: function () {
		// 		return 'thisismytarget';
		// 	},
		// });
		// Object.defineProperty(controls.target, 'x', {
		// 	set: function (b) {
		// 		console.warn('assign x', b);
		// 		x = b;
		// 	},
		// 	get: function () {
		// 		return x;
		// 	},
		// });
		// Object.defineProperty(controls.target, 'y', {
		// 	set: function (b) {
		// 		console.warn('assign y', b);
		// 		controls.target.y = b;
		// 	},
		// 	get: function () {
		// 		return controls.target.y;
		// 	},
		// });
		// Object.defineProperty(controls.target, 'z', {
		// 	set: function (b) {
		// 		console.warn('assign z', b);
		// 		controls.target.setZ = b;
		// 	},
		// 	get: function () {
		// 		return controls.target.z;
		// 	},
		// });

		this._controls_by_element_id.set(element.id, controls);
		this._bind_listeners_to_controls_instance(controls);
		return controls;
	}
	protected _bind_listeners_to_controls_instance(controls: OrbitControls) {
		controls.addEventListener('start', () => {
			this.dispatch_event_to_output(OUTPUT_START, {});
		});
		controls.addEventListener('change', () => {
			this.dispatch_event_to_output(OUTPUT_CHANGE, {});
		});
		controls.addEventListener('end', () => {
			this.dispatch_event_to_output(OUTPUT_END, {});
		});
	}

	setup_controls(controls: OrbitControls) {
		controls.enablePan = this.pv.allow_pan;
		controls.enableRotate = this.pv.allow_rotate;
		controls.enableZoom = this.pv.allow_zoom;

		controls.enableDamping = this.pv.tdamping;
		controls.dampingFactor = this.pv.damping;

		controls.rotateSpeed = this.pv.rotate_speed;

		controls.screenSpacePanning = this.pv.screen_space_panning;

		controls.minDistance = this.pv.min_distance;
		controls.maxDistance = this.pv.max_distance;

		controls.minPolarAngle = this.pv.polar_angle_range.x;
		controls.maxPolarAngle = this.pv.polar_angle_range.y;
		controls.target.copy(this.pv.target28);

		// to prevent moving the camera when using the arrows to change frame
		controls.enableKeys = false;
	}

	// set_from_camera_node(controls: CameraControls, camera_node: BaseCameraObjNodeType): void {
	// 	const target = camera_node.params.vector3('target');
	// 	controls.target.copy(target);
	// 	console.warn('set from camera node');
	// }

	private _target_array: Number3 = [0, 0, 0];
	private _on_controls_end(controls: OrbitControls) {
		// console.log('_on_controls_end');
		controls.target.toArray(this._target_array);
		console.log('end', controls.target, this._target_array);
		this.p.target28.set(this._target_array);
	}

	static PARAM_CALLBACK_update_target(node: CameraOrbitControlsEventNode) {
		node._update_target();
	}
	private _update_target() {
		// const src_target = this.pv.target;
		// this._controls_by_element_id.forEach((control, element_id) => {
		// 	const dest_target = control.target;
		// 	if (dest_target.x != src_target.x || dest_target.y != src_target.y || dest_target.z != src_target.z) {
		// 		dest_target.copy(src_target);
		// 		console.log('_update_target', element_id, this.pv.target, control);
		// 	}
		// });
	}
}
