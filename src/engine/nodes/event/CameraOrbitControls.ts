import {Vector2} from 'three/src/math/Vector2';
import {Camera} from 'three/src/cameras/Camera';

import {BaseCameraControlsEventNode, CameraControls} from './_BaseCameraControls';
import {BaseCameraObjNode} from 'src/engine/nodes/obj/_BaseCamera';
import {CoreScriptLoader} from 'src/core/loader/Script';

import {OrbitControls} from 'modules/three/examples/jsm/controls/OrbitControls';

export class CameraOrbitControlsEventNode extends BaseCameraControlsEventNode {
	@ParamB('allow_pan') _param_allow_pan: boolean;
	@ParamB('allow_rotate') _param_allow_rotate: boolean;
	@ParamB('allow_zoom') _param_allow_zoom: boolean;
	@ParamB('tdamping') _param_tdamping: boolean;
	@ParamF('damping') _param_damping: number;
	@ParamF('rotate_speed') _param_rotate_speed: number;
	@ParamB('screen_space_panning') _param_screen_space_panning: boolean;
	@ParamF('min_distance') _param_min_distance: number;
	@ParamF('max_distance') _param_max_distance: number;
	@ParamV2('polar_angle_range') _param_polar_angle_range: Vector2;
	static type() {
		return 'camera_orbit_controls';
	}
	static required_three_imports() {
		return ['controls/OrbitControls'];
	}

	constructor() {
		super();
		// this/.set_inputs_count_to_zero();
	}

	create_params() {
		this.add_param(ParamType.BOOLEAN, 'allow_pan', 1);
		this.add_param(ParamType.BOOLEAN, 'allow_rotate', 1);
		this.add_param(ParamType.BOOLEAN, 'allow_zoom', 1);

		this.add_param(ParamType.BOOLEAN, 'tdamping', 0);
		this.add_param(ParamType.FLOAT, 'damping', 0.1, {
			visible_if: {tdamping: true},
		});

		this.add_param(ParamType.BOOLEAN, 'screen_space_panning', 1);
		this.add_param(ParamType.FLOAT, 'rotate_speed', 0.5);

		this.add_param(ParamType.FLOAT, 'min_distance', 1, {range: [0, 100], range_locked: [true, false]});
		this.add_param(ParamType.FLOAT, 'max_distance', 50, {range: [0, 100], range_locked: [true, false]});

		this.add_param(ParamType.VECTOR2, 'polar_angle_range', [0, '$PI']);
	}

	async create_controls_instance(camera: Camera, element: HTMLElement) {
		const c = this.constructor as typeof CameraOrbitControlsEventNode;
		const {OrbitControls} = await CoreScriptLoader.module(c.required_imports()[0]);

		const controls = new OrbitControls(camera, element);
		return controls as CameraControls;
	}

	setup_controls(controls: OrbitControls) {
		controls.enablePan = this._param_allow_pan;
		controls.enableRotate = this._param_allow_rotate;
		controls.enableZoom = this._param_allow_zoom;

		controls.enableDamping = this._param_tdamping;
		controls.dampingFactor = this._param_damping;

		controls.rotateSpeed = this._param_rotate_speed;

		controls.screenSpacePanning = this._param_screen_space_panning;

		controls.minDistance = this._param_min_distance;
		controls.maxDistance = this._param_max_distance;

		controls.minPolarAngle = this._param_polar_angle_range.x;
		controls.maxPolarAngle = this._param_polar_angle_range.y;

		// to prevent moving the camera when using the arrows to change frame
		controls.enableKeys = false;
	}

	set_from_camera_node(controls: CameraControls, camera_node: BaseCameraObjNode): void {
		const target = camera_node.params.vector3('target');
		controls.target.copy(target);
	}
}
