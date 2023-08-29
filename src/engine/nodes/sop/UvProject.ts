/**
 * Creates or update uv attribute.
 *
 *
 */
import {Camera, Vector3, Object3D, Matrix4} from 'three';
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {CameraController} from '../../../core/CameraController';
import {BaseCameraObjNodeType} from '../obj/_BaseCamera';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {CAMERA_TYPES, NodeContext} from '../../poly/NodeContext';
import {BaseObjNodeType} from '../obj/_Base';

const UV_NAME = 'uv';
const _position = new Vector3();

class UvProjectSopParamsConfig extends NodeParamsConfig {
	/** @param camera node to use as projection */
	camera = ParamConfig.NODE_PATH('', {
		nodeSelection: {
			context: NodeContext.OBJ,
			types: CAMERA_TYPES,
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
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'uvProject';
	}

	private _cameraController: CameraController = new CameraController(this._updateUVsFromCamera.bind(this));
	private _processed_core_group: CoreGroup | undefined;
	private _camera_object: Camera | undefined;

	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(InputCloneMode.FROM_NODE);
	}

	override cook(core_groups: CoreGroup[]) {
		this._processed_core_group = core_groups[0];

		const cameraNode = this.pv.camera.nodeWithContext(NodeContext.OBJ, this.states.error);
		if (cameraNode != null && (CAMERA_TYPES as string[]).includes(cameraNode.type())) {
			this._camera_object = (cameraNode as BaseCameraObjNodeType).object;
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
				point.position(_position);
				const uvw = this._vectorInCameraSpace(_position, obj_world_matrix);
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
