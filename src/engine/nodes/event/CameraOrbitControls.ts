import {Camera} from 'three/src/cameras/Camera';

import {TypedCameraControlsEventNode, CameraControls} from './_BaseCameraControls';
import {BaseCameraObjNodeType} from '../obj/_BaseCamera';

import {OrbitControls} from '../../../../modules/three/examples/jsm/controls/OrbitControls';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
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
}
const ParamsConfig = new CameraOrbitEventParamsConfig();

export class CameraOrbitControlsEventNode extends TypedCameraControlsEventNode<CameraOrbitEventParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'camera_orbit_controls';
	}
	async create_controls_instance(camera: Camera, element: HTMLElement) {
		const controls = new OrbitControls(camera, element);
		return controls;
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

		// to prevent moving the camera when using the arrows to change frame
		controls.enableKeys = false;
	}

	set_from_camera_node(controls: CameraControls, camera_node: BaseCameraObjNodeType): void {
		const target = camera_node.params.vector3('target');
		controls.target.copy(target);
	}
}
