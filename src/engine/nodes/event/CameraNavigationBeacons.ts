/**
 * Allows to move the camera between different points
 *
 * @remarks
 * This node is still experimental.
 *
 */
import {TypedEventNode} from './_Base';
import {EventConnectionPoint, EventConnectionPointType} from '../utils/io/connections/Event';
import {EventContext} from '../../scene/utils/events/_BaseEventsController';
import {CameraNodeType, NodeContext} from '../../poly/NodeContext';
import {PerspectiveCameraObjNode} from '../obj/PerspectiveCamera';
import {Vector3} from 'three/src/math/Vector3';
import {Matrix4} from 'three/src/math/Matrix4';
import {Quaternion} from 'three/src/math/Quaternion';
import gsap from 'gsap/gsap-core';
import {CoreObject} from '../../../core/geometry/Object';
import {AnimNodeEasing, InOutMode} from '../../../core/animation/Constant';
import {BaseCameraControlsEventNodeType} from '../event/_BaseCameraControls';
import {CameraOrbitControlsEventNode} from './CameraOrbitControls';
import {Object3D} from 'three/src/core/Object3D';
import {CoreMath} from '../../../core/math/_Module';

enum CameraNavigationBeaconsEventInput {
	INIT = 'init',
	TRIGGER = 'trigger',
}

enum CameraNavigationBeaconsEventOutput {
	AFTER_INIT = 'after_init',
	AFTER_ANIM = 'after_anim',
}

interface CamData {
	t: Vector3;
	q: Quaternion;
	s: Vector3;
	fov: number;
	near: number;
	far: number;
	controls: {
		node?: BaseCameraControlsEventNodeType;
	};
}
function init_cam_data(): CamData {
	return {
		t: new Vector3(),
		q: new Quaternion(),
		s: new Vector3(),
		fov: 0,
		near: 0,
		far: 0,
		controls: {},
	};
}
interface ObjectScaleProxy {
	val: number;
}
interface NavBeaconProxy {
	prev: ObjectScaleProxy;
	current: ObjectScaleProxy;
}
const ATTRIB_NAME = {CAMERA: 'camera'};

const EASING = `${AnimNodeEasing.POWER2}.${InOutMode.IN_OUT}`;

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CoreSleep} from '../../../core/Sleep';
class CameraNavigationBeaconsEventParamsConfig extends NodeParamsConfig {
	/** @param sets the camera */
	camera = ParamConfig.OPERATOR_PATH('/perspective_camera_MASTER', {
		nodeSelection: {
			context: NodeContext.OBJ,
			types: [CameraNodeType.PERSPECTIVE],
		},
	});
	/** @param toogle on to initialize to a specific camera */
	init = ParamConfig.BOOLEAN(0);
	/** @param the camera to initialize to */
	initCamera = ParamConfig.OPERATOR_PATH('/perspective_camera_0', {
		nodeSelection: {
			context: NodeContext.OBJ,
			types: [CameraNodeType.PERSPECTIVE],
		},
		visibleIf: {init: 1},
	});
	/** @param duration of movement from one navigation point to another */
	duration = ParamConfig.FLOAT(2);
	/** @param time for the camera rotation animation to start, relative to translation animation */
	rotationDelay = ParamConfig.FLOAT(1);
	/** @param time for the camera projection matrix animation to start, relative to translation animation */
	projectionMatrixDelay = ParamConfig.FLOAT(0);
	/** @param toggle on if the camera should move to the nearest position. Toggle off if the camera should move to the current target camera position */
	toNearesPos = ParamConfig.BOOLEAN(0);
	/** @param toggle on to hide the current beacon and ensure it does not block the view */
	hideCurrentBeacon = ParamConfig.BOOLEAN(1);
}
const ParamsConfig = new CameraNavigationBeaconsEventParamsConfig();

export class CameraNavigationBeaconsEventNode extends TypedEventNode<CameraNavigationBeaconsEventParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'cameraNavigationBeacons';
	}

	private _src_data: CamData = init_cam_data();
	private _dest_data: CamData = init_cam_data();
	private _prev_nav_beacons: Object3D[] = [];
	private _current_nav_beacons: Object3D[] = [];
	private _cam_proxy = {
		t: 0,
		q: 0,
		fov: 0,
	};
	private _nav_beacon_proxy: NavBeaconProxy = {
		prev: {val: 0},
		current: {val: 0},
	};
	initialize_node() {
		this.io.inputs.set_named_input_connection_points([
			new EventConnectionPoint(
				CameraNavigationBeaconsEventInput.INIT,
				EventConnectionPointType.BASE,
				this._process_init_event.bind(this)
			),
			new EventConnectionPoint(
				CameraNavigationBeaconsEventInput.TRIGGER,
				EventConnectionPointType.BASE,
				this._process_trigger_event.bind(this)
			),
		]);
		this.io.outputs.set_named_output_connection_points([
			new EventConnectionPoint(CameraNavigationBeaconsEventOutput.AFTER_INIT, EventConnectionPointType.BASE),
			new EventConnectionPoint(CameraNavigationBeaconsEventOutput.AFTER_ANIM, EventConnectionPointType.BASE),
		]);
	}

	//
	//
	// INIT
	//
	//
	private async _process_init_event(context: EventContext<MouseEvent>) {
		if (!this.pv.init) {
			return;
		}
		const src_camera = this._get_src_camera();
		if (!src_camera) {
			return src_camera;
		}
		const target_camera = this._get_init_camera();
		if (!target_camera) {
			return;
		}

		CameraNavigationBeaconsEventNode._store_cam_data(target_camera, this._dest_data);

		await this._remove_current_camera_controls(src_camera);

		await CoreSleep.sleep(100);

		// place camera
		const src_camera_object = src_camera.camera();
		src_camera_object.position.copy(this._dest_data.t);
		src_camera_object.quaternion.copy(this._dest_data.q);
		src_camera_object.fov = this._dest_data.fov;
		src_camera_object.near = this._dest_data.near;
		src_camera_object.far = this._dest_data.far;
		src_camera_object.updateMatrix();
		src_camera_object.updateProjectionMatrix();

		// toggle objects scales
		if (this.pv.hideCurrentBeacon) {
			this._prev_nav_beacons = this._current_nav_beacons;
			this._current_nav_beacons = this._get_all_nav_beacon_objects(target_camera.name);
			for (let object of this._prev_nav_beacons) {
				object.scale.set(1, 1, 1);
				object.updateMatrix();
			}
			for (let object of this._current_nav_beacons) {
				object.scale.set(0, 0, 0);
				object.updateMatrix();
			}
		}

		await CoreSleep.sleep(100);

		await this._restore_camera_controls(src_camera, target_camera);
		this.dispatch_event_to_output(CameraNavigationBeaconsEventOutput.AFTER_INIT, context);
	}

	//
	//
	// TRIGGER
	//
	//
	private async _process_trigger_event(context: EventContext<MouseEvent>) {
		const clicked_object = this._get_clicked_camera(context);
		if (!clicked_object) {
			return;
		}
		const camera_path = CoreObject.stringAttribValue(clicked_object, ATTRIB_NAME.CAMERA, 0);
		if (!camera_path) {
			return;
		}

		const target_camera = this.scene.node(camera_path) as PerspectiveCameraObjNode;
		if (!target_camera) {
			console.warn(`no camera found with path ${camera_path}`);
			return;
		}

		const src_camera = this._get_src_camera();
		if (!src_camera) {
			return src_camera;
		}

		if (this.pv.hide_current_beacon) {
			this._prev_nav_beacons = this._current_nav_beacons;
			this._current_nav_beacons = this._get_all_nav_beacon_objects(camera_path);
		}

		CameraNavigationBeaconsEventNode._store_cam_data(src_camera, this._src_data);
		CameraNavigationBeaconsEventNode._store_cam_data(target_camera, this._dest_data);
		if (this.pv.toNearesPos) {
			this._compute_neares_pos();
		}

		await this._start(src_camera, target_camera);
		this.dispatch_event_to_output(CameraNavigationBeaconsEventOutput.AFTER_ANIM, context);
	}

	private async _start(src_camera: PerspectiveCameraObjNode, target_camera: PerspectiveCameraObjNode) {
		if (this.pv.hide_current_beacon) {
			this._animate_objects(this._current_nav_beacons, this._nav_beacon_proxy.current, 0);
		}
		await this._remove_current_camera_controls(src_camera);
		await this._animate_camera(src_camera);
		await this._restore_camera_controls(src_camera, target_camera);
		if (this.pv.hide_current_beacon) {
			this._animate_objects(this._prev_nav_beacons, this._nav_beacon_proxy.prev, 1);
		}
	}

	private async _animate_objects(objects: Object3D[], proxy: ObjectScaleProxy, target_scale: number) {
		const first_object = objects[0];
		if (!first_object) {
			return;
		}
		proxy.val = first_object.scale.x;
		gsap.to(proxy, {
			duration: 1,
			ease: EASING,
			val: target_scale,
			onUpdate: () => {
				for (let object of objects) {
					const s = proxy.val;
					object.scale.set(s, s, s);
					object.updateMatrix();
				}
			},
		});
	}

	private async _animate_camera(src_camera: PerspectiveCameraObjNode) {
		const src_camera_object = src_camera.camera();
		this._cam_proxy.t = 0;
		this._cam_proxy.q = 0;
		this._cam_proxy.fov = 0;

		const duration = this.pv.duration;
		return new Promise((resolve) => {
			const timeline = gsap.timeline({
				onUpdate: () => {
					if (!src_camera_object.matrixAutoUpdate) {
						src_camera_object.updateMatrix();
					}
				},
				onComplete: resolve,
			});

			// translation timeline
			timeline.to(this._cam_proxy, {
				duration: duration,
				t: 1,
				ease: EASING,
				onUpdate: () => {
					src_camera_object.position.copy(this._src_data.t).lerp(this._dest_data.t, this._cam_proxy.t);
				},
			});
			// quaternion timeline
			timeline.to(
				this._cam_proxy,
				{
					duration: duration,
					q: 1,
					ease: EASING,
					onUpdate: () => {
						src_camera_object.quaternion.copy(this._src_data.q).slerp(this._dest_data.q, this._cam_proxy.q);
					},
				},
				this.pv.rotationDelay
			);
			// fov timeline
			timeline.to(
				this._cam_proxy,
				{
					duration: duration,
					fov: 1,
					ease: EASING,
					onUpdate: () => {
						const blend = this._cam_proxy.fov;
						src_camera_object.fov = CoreMath.blend(this._src_data.fov, this._dest_data.fov, blend);
						src_camera_object.near = CoreMath.blend(this._src_data.near, this._dest_data.near, blend);
						src_camera_object.far = CoreMath.blend(this._src_data.far, this._dest_data.far, blend);
						src_camera_object.updateProjectionMatrix();
					},
				},
				this.pv.projectionMatrixDelay
			);
		});
	}

	private _get_src_camera() {
		return this.p.camera.found_node_with_context_and_type(NodeContext.OBJ, CameraNodeType.PERSPECTIVE);
	}
	private _get_init_camera() {
		return this.p.initCamera.found_node_with_context_and_type(NodeContext.OBJ, CameraNodeType.PERSPECTIVE);
	}

	private _get_clicked_camera(context: EventContext<MouseEvent>) {
		const value = context.value;
		if (!value) {
			return;
		}
		const intersect = value.intersect;
		if (!intersect) {
			return;
		}
		return intersect.object;
	}
	private _get_all_nav_beacon_objects(camera_path_attrib_value: string): Object3D[] {
		// find all other objects with same camera attribute
		const objects: Object3D[] = [];
		this.scene.defaultScene.traverse((child) => {
			const obj_camera_path = CoreObject.stringAttribValue(child, ATTRIB_NAME.CAMERA, 0);
			if (obj_camera_path && obj_camera_path == camera_path_attrib_value) {
				objects.push(child);
			}
		});
		return objects;
	}

	private async _remove_current_camera_controls(camera_node: PerspectiveCameraObjNode) {
		// first we need to update the params on the node, as the camera_object may be out of sync
		// if we are using an orbit_controls with damping for instance.
		// We could ideally not do that, since we are directly working with the camera matrix,
		// but as we remove the controls, this will update the matrix from the params
		// so it's best to have the params and camera matrix in sync.
		camera_node.transform_controller.update_node_transform_params_from_object();
		camera_node.p.controls.set('');
	}
	private async _restore_camera_controls(
		src_camera_node: PerspectiveCameraObjNode,
		target_camera_node: PerspectiveCameraObjNode
	) {
		this.scene.batch_update(() => {
			src_camera_node.transform_controller.update_node_transform_params_from_object();
			src_camera_node.p.fov.set(this._dest_data.fov);
			src_camera_node.p.near.set(this._dest_data.near);
			src_camera_node.p.far.set(this._dest_data.far);
			const node = this._dest_data.controls.node;
			if (node) {
				src_camera_node.p.controls.set(node.fullPath());
			}
		});
	}

	private static _store_cam_data(camera_node: PerspectiveCameraObjNode, data: CamData) {
		const camera_object = camera_node.camera();
		camera_object.updateMatrixWorld(false);
		camera_object.matrixWorld.decompose(data.t, data.q, data.s);
		data.fov = camera_object.fov;
		data.near = camera_object.near;
		data.far = camera_object.far;

		data.controls.node = camera_node.p.controls.found_node_with_context(
			NodeContext.EVENT
		) as BaseCameraControlsEventNodeType;
	}

	private _dest_delta = new Vector3();
	private _src_delta = new Vector3();
	private _dest_rot_m = new Matrix4();
	private _dest_rot_m_up = new Vector3(0, 1, 0);
	// private _dest_delta_q = new Quaternion();
	private _compute_neares_pos() {
		const controls_node = this._dest_data.controls.node;
		if (!controls_node) {
			return;
		}
		if (!(controls_node instanceof CameraOrbitControlsEventNode)) {
			return;
		}
		const target = controls_node.pv.target;

		// compute t
		this._dest_delta.copy(this._dest_data.t).sub(target);
		const dest_delta_size = this._dest_delta.length();
		this._src_delta.copy(this._src_data.t).sub(target);
		this._src_delta.normalize().multiplyScalar(dest_delta_size);
		this._dest_data.t.copy(target).add(this._src_delta);

		// compute q
		this._dest_rot_m.identity();
		this._dest_rot_m.lookAt(this._dest_data.t, target, this._dest_rot_m_up);
		this._dest_data.q.setFromRotationMatrix(this._dest_rot_m);
		// this._dest_delta.normalize().multiplyScalar(-1);
		// this._src_delta.normalize().multiplyScalar(-1);
		// this._dest_delta_q.setFromUnitVectors(this._dest_delta, this._src_delta);
		// this._dest_data.q.multiply(this._dest_delta_q);
	}
}
