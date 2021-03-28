/**
 * Creates or update uv attribute.
 *
 *
 */
import {Camera} from 'three/src/cameras/Camera';
import {Object3D} from 'three/src/core/Object3D';
import {Matrix4} from 'three/src/math/Matrix4';
import {Vector3} from 'three/src/math/Vector3';
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {CameraController} from '../../../core/CameraController';
import {BaseCameraObjNodeType} from '../obj/_BaseCamera';

const UV_NAME = 'uv';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {NodeContext} from '../../poly/NodeContext';
import {BaseObjNodeType} from '../obj/_Base';
class UvProjectSopParamsConfig extends NodeParamsConfig {
	/** @param camera node to use as projection */
	camera = ParamConfig.OPERATOR_PATH('/perspective_camera1', {
		nodeSelection: {
			context: NodeContext.OBJ,
		},
	});
	// force_aspect = ParamConfig.BOOLEAN(0)
	// aspect = ParamConfig.FLOAT(1, {
	// 	range: [0, 2],
	// 	visibleIf: {force_aspect: 1},
	// })
}
const ParamsConfig = new UvProjectSopParamsConfig();

export class UvProjectSopNode extends TypedSopNode<UvProjectSopParamsConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return 'uvProject';
	}

	private _cameraController: CameraController = new CameraController(this._updateUVsFromCamera.bind(this));
	private _processed_core_group: CoreGroup | undefined;
	private _camera_object: Camera | undefined;

	initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(InputCloneMode.FROM_NODE);
	}

	cook(core_groups: CoreGroup[]) {
		this._processed_core_group = core_groups[0];

		const camera_node = this.p.camera.found_node();
		if (camera_node != null) {
			this._camera_object = (camera_node as BaseCameraObjNodeType).object;
			this._cameraController.setTarget(this._camera_object);
		} else {
			this._camera_object = undefined;
			this._cameraController.removeTarget();
		}

		this.setCoreGroup(this._processed_core_group);
	}

	_updateUVsFromCamera(look_at_target: Object3D) {
		// let old_aspect;
		// if (this.pv.force_aspect) {
		// 	old_aspect = this._camera_object.aspect;
		// 	this._camera_node.setup_for_aspect_ratio(this.pv.aspect);
		// }
		const parent = this.parent();
		if (this._processed_core_group && parent) {
			const points = this._processed_core_group.points();
			const obj_world_matrix = (parent as BaseObjNodeType).object.matrixWorld;
			for (let point of points) {
				const position = point.position();
				const uvw = this._vectorInCameraSpace(position, obj_world_matrix);
				if (uvw) {
					const uv = {
						x: 1 - (uvw[0] * 0.5 + 0.5),
						y: uvw[1] * 0.5 + 0.5,
					};
					point.setAttribValue(UV_NAME, uv);
				}
			}

			// if (this.pv.force_aspect) {
			// 	this._camera_node.setup_for_aspect_ratio(old_aspect);
			// }
		}
	}

	private _vectorInCameraSpace(vector: Vector3, obj_world_matrix: Matrix4) {
		if (this._camera_object) {
			vector.applyMatrix4(obj_world_matrix);
			return vector.project(this._camera_object).toArray();
		}
	}
}
