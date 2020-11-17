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

enum CameraNavigationBeaconsEventInput {
	TRIGGER = 'trigger',
}

enum CameraNavigationBeaconsEventOutput {
	// BEFORE_ANIM = 'before_anim',
	AFTER_ANIM = 'after_anim',
}

interface CamData {
	t: Vector3;
	q: Quaternion;
	s: Vector3;
	fov: number;
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
		controls: {},
	};
}

const EASING = `${AnimNodeEasing.POWER2}.${InOutMode.IN_OUT}`;

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CameraOrbitControlsEventNode} from './CameraOrbitControls';
class CameraNavigationBeaconsEventParamsConfig extends NodeParamsConfig {
	camera = ParamConfig.OPERATOR_PATH('/perspective_camera1', {
		node_selection: {
			context: NodeContext.OBJ,
			types: [CameraNodeType.PERSPECTIVE],
		},
	});
	duration = ParamConfig.FLOAT(2);
	rotation_delay = ParamConfig.FLOAT(1);
	fov_delay = ParamConfig.FLOAT(0);
	to_neares_pos = ParamConfig.BOOLEAN(0);
}
const ParamsConfig = new CameraNavigationBeaconsEventParamsConfig();

export class CameraNavigationBeaconsEventNode extends TypedEventNode<CameraNavigationBeaconsEventParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'camera_navigation_beacons';
	}

	private _src_data: CamData = init_cam_data();
	private _dest_data: CamData = init_cam_data();

	initialize_node() {
		this.io.inputs.set_named_input_connection_points([
			new EventConnectionPoint(
				CameraNavigationBeaconsEventInput.TRIGGER,
				EventConnectionPointType.BASE,
				this._process_trigger_event.bind(this)
			),
		]);
		this.io.outputs.set_named_output_connection_points([
			// new EventConnectionPoint(CameraNavigationBeaconsEventOutput.BEFORE_ANIM, EventConnectionPointType.BASE),
			new EventConnectionPoint(CameraNavigationBeaconsEventOutput.AFTER_ANIM, EventConnectionPointType.BASE),
		]);
	}

	private async _process_trigger_event(context: EventContext<MouseEvent>) {
		const target_camera = this._get_target_camera(context);
		if (!target_camera) {
			return;
		}
		const src_camera = this._get_src_camera();
		if (!src_camera) {
			return src_camera;
		}

		CameraNavigationBeaconsEventNode._store_cam_data(src_camera, this._src_data);
		CameraNavigationBeaconsEventNode._store_cam_data(target_camera, this._dest_data);
		if (this.pv.to_neares_pos) {
			this._compute_neares_pos();
		}

		await this._start(src_camera, target_camera);
		this.dispatch_event_to_output(CameraNavigationBeaconsEventOutput.AFTER_ANIM, context);
	}

	private async _start(src_camera: PerspectiveCameraObjNode, target_camera: PerspectiveCameraObjNode) {
		await this._remove_current_camera_controls(src_camera);
		await this._start_animation(src_camera);
		await this._restore_camera_controls(src_camera, target_camera);
	}

	private _proxy = {
		t: 0,
		q: 0,
		fov: 0,
	};
	private async _start_animation(src_camera: PerspectiveCameraObjNode) {
		const src_camera_object = src_camera.camera();
		this._proxy.t = 0;
		this._proxy.q = 0;
		this._proxy.fov = 0;

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
			timeline.to(this._proxy, {
				duration: duration,
				t: 1,
				ease: EASING,
				onUpdate: () => {
					src_camera_object.position.copy(this._src_data.t).lerp(this._dest_data.t, this._proxy.t);
				},
			});
			// quaternion timeline
			timeline.to(
				this._proxy,
				{
					duration: duration,
					q: 1,
					ease: EASING,
					onUpdate: () => {
						src_camera_object.quaternion.copy(this._src_data.q).slerp(this._dest_data.q, this._proxy.q);
					},
				},
				this.pv.rotation_delay
			);
			// fov timeline
			timeline.to(
				this._proxy,
				{
					duration: duration,
					fov: 1,
					ease: EASING,
					onUpdate: () => {
						const blend = this._proxy.fov;
						src_camera_object.fov = (1 - blend) * this._src_data.fov + blend * this._dest_data.fov;
						src_camera_object.updateProjectionMatrix();
					},
				},
				this.pv.fov_delay
			);
		});
	}

	private _get_src_camera() {
		return this.p.camera.found_node_with_context_and_type(NodeContext.OBJ, CameraNodeType.PERSPECTIVE);
	}

	private _get_target_camera(context: EventContext<MouseEvent>) {
		const value = context.value;
		if (!value) {
			return;
		}
		const intersect = value.intersect;
		if (!intersect) {
			return;
		}

		const core_object = new CoreObject(intersect.object, 0);
		const camera = core_object.string_attrib_value('camera');
		const camera_node = this.scene.node(camera) as PerspectiveCameraObjNode;
		if (!camera_node) {
			console.warn(`no camera found with name ${camera_node}`);
		}
		return camera_node;
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
			const node = this._dest_data.controls.node;
			if (node) {
				src_camera_node.p.controls.set(node.full_path());
			}
		});
	}

	private static _store_cam_data(camera_node: PerspectiveCameraObjNode, data: CamData) {
		const camera_object = camera_node.camera();
		camera_object.updateMatrixWorld(false);
		camera_object.matrixWorld.decompose(data.t, data.q, data.s);
		data.fov = camera_object.fov;

		data.controls.node = camera_node.p.controls.found_node_with_context(
			NodeContext.EVENT
		) as BaseCameraControlsEventNodeType;

		// if (data.controls.node) {
		// 	if (data.controls.node instanceof CameraOrbitControlsEventNode) {
		// 		data.controls.target.copy(data.controls.node.pv.target);
		// 	}
		// }
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
