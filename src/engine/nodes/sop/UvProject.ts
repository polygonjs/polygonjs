import {Camera} from 'three/src/cameras/Camera';
import {Object3D} from 'three/src/core/Object3D';
import {Matrix4} from 'three/src/math/Matrix4';
import {Vector3} from 'three/src/math/Vector3';
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {CameraController} from '../../../core/CameraController';
import {BaseCameraObjNodeType} from '../obj/_BaseCamera';

// const MODE = [];
const UV_NAME = 'uv';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {NodeContext} from '../../poly/NodeContext';
import {BaseObjNodeType} from '../obj/_Base';
class UvProjectSopParamsConfig extends NodeParamsConfig {
	camera = ParamConfig.OPERATOR_PATH('/perspective_camera1', {
		node_selection: {
			context: NodeContext.OBJ,
		},
	});
	// force_aspect = ParamConfig.BOOLEAN(0)
	// aspect = ParamConfig.FLOAT(1, {
	// 	range: [0, 2],
	// 	visible_if: {force_aspect: 1},
	// })
}
const ParamsConfig = new UvProjectSopParamsConfig();

export class UvProjectSopNode extends TypedSopNode<UvProjectSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'uv_project';
	}

	private _camera_controller: CameraController = new CameraController(this._update_uvs_from_camera.bind(this));
	// private _param_camera: string
	private _processed_core_group: CoreGroup | undefined;
	// private _camera_node: BaseCameraObjNodeType | undefined;
	private _camera_object: Camera | undefined;

	initialize_node() {
		this.io.inputs.set_count(1);
		this.io.inputs.init_inputs_clonable_state([InputCloneMode.FROM_NODE]);
	}

	cook(core_groups: CoreGroup[]) {
		this._processed_core_group = core_groups[0];

		const camera_node = this.p.camera.found_node();
		if (camera_node != null) {
			this._camera_object = (camera_node as BaseCameraObjNodeType).object;
			this._camera_controller.set_target(this._camera_object);
			// this._add_camera_event()
		} else {
			this._camera_object = undefined;
			//this._remove_camera_event()
			this._camera_controller.remove_target();
		}

		this.set_core_group(this._processed_core_group);
	}

	_update_uvs_from_camera(look_at_target: Object3D) {
		// let old_aspect;
		// if (this.pv.force_aspect) {
		// 	old_aspect = this._camera_object.aspect;
		// 	this._camera_node.setup_for_aspect_ratio(this.pv.aspect);
		// }

		if (this._processed_core_group && this.parent) {
			const points = this._processed_core_group.points();
			const obj_world_matrix = (this.parent as BaseObjNodeType).object.matrixWorld;
			points.forEach((point) => {
				const position = point.position();
				const uvw = this._vector_in_camera_space(position, obj_world_matrix);
				if (uvw) {
					const uv = {
						x: 1 - (uvw[0] * 0.5 + 0.5),
						y: uvw[1] * 0.5 + 0.5,
					};
					point.set_attrib_value(UV_NAME, uv);
				}
			});

			// if (this.pv.force_aspect) {
			// 	this._camera_node.setup_for_aspect_ratio(old_aspect);
			// }
		}
	}

	private _vector_in_camera_space(vector: Vector3, obj_world_matrix: Matrix4) {
		if (this._camera_object) {
			vector.applyMatrix4(obj_world_matrix);
			return vector.project(this._camera_object).toArray();
		}
	}
}
