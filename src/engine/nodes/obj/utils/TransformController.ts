import {TypedObjNode} from '../_Base';
import {Matrix4} from 'three/src/math/Matrix4';
import {CoreTransform, SetParamsFromMatrixOptions, ROTATION_ORDERS, RotationOrder} from '../../../../core/Transform';
import {Object3D} from 'three/src/core/Object3D';
import {NodeParamsConfig, ParamConfig} from '../../utils/params/ParamsConfig';

interface TransformedParamConfigDefaultParams {
	matrix_auto_update?: boolean;
}

export function TransformedParamConfig<TBase extends Constructor>(
	Base: TBase,
	default_params?: TransformedParamConfigDefaultParams
) {
	const matrix_auto_update = default_params?.matrix_auto_update || false;
	return class Mixin extends Base {
		transform = ParamConfig.FOLDER();
		rotation_order = ParamConfig.INTEGER(ROTATION_ORDERS.indexOf(RotationOrder.XYZ), {
			menu: {
				entries: ROTATION_ORDERS.map((order, v) => {
					return {name: order, value: v};
				}),
			},
		});
		t = ParamConfig.VECTOR3([0, 0, 0]);
		r = ParamConfig.VECTOR3([0, 0, 0]);
		s = ParamConfig.VECTOR3([1, 1, 1]);
		scale = ParamConfig.FLOAT(1);
		matrix_auto_update = ParamConfig.BOOLEAN(matrix_auto_update ? 1 : 0);
		// look_at = ParamConfig.OPERATOR_PATH('', {node_selection: {context: NodeContext.OBJ}});
		// up = ParamConfig.VECTOR3([0, 1, 0]);
		// pivot = ParamConfig.VECTOR3([0, 0, 0]);
	};
}
class TransformedParamsConfig extends TransformedParamConfig(NodeParamsConfig) {}
export class TransformedObjNode extends TypedObjNode<Object3D, TransformedParamsConfig> {
	readonly transform_controller: TransformController = new TransformController(this);
}

export class TransformController {
	constructor(private node: TransformedObjNode) {}

	initialize_node() {
		const hook_name = '_cook_main_without_inputs_when_dirty';
		if (!this.node.dirty_controller.has_hook(hook_name)) {
			this.node.dirty_controller.add_post_dirty_hook(hook_name, this._cook_main_without_inputs_when_dirty_bound);
		}
	}
	// TODO: this will have to be checked via the parent, when I will have obj managers at lower levels than root
	private _cook_main_without_inputs_when_dirty_bound = this._cook_main_without_inputs_when_dirty.bind(this);
	private async _cook_main_without_inputs_when_dirty() {
		await this.node.cook_controller.cook_main_without_inputs();
	}

	update(matrix?: Matrix4) {
		this.update_transform_with_matrix(matrix);
		const object = this.node.object;
		object.matrixAutoUpdate = this.node.pv.matrix_auto_update;
	}

	update_transform_with_matrix(matrix?: Matrix4) {
		const object = this.node.object;
		if (matrix != null && !matrix.equals(object.matrix)) {
			// do not apply to cameras with control

			// object.matrixAutoUpdate = false;
			object.matrix.copy(matrix);

			object.dispatchEvent({type: 'change'});
		} else {
			this._update_matrix_from_params_with_core_transform();
			// this.update_transform_from_params();
		}
	}

	// private _update_transform_from_params_scale = new Vector3();
	// protected update_transform_from_params() {
	// 	const object = this.node.object;
	// 	if (object) {
	// 		const position: Vector3 = this.node.pv.t;
	// 		const rotation: Vector3 = this.node.pv.r;

	// 		this._update_transform_from_params_scale.copy(this.node.pv.s).multiplyScalar(this.node.pv.scale);

	// 		object.matrixAutoUpdate = false;
	// 		object.position.copy(position);
	// 		const radians = [
	// 			CoreMath.degrees_to_radians(rotation.x),
	// 			CoreMath.degrees_to_radians(rotation.y),
	// 			CoreMath.degrees_to_radians(rotation.z),
	// 		];
	// 		const euler = new Euler(
	// 			radians[0],
	// 			radians[1],
	// 			radians[2]
	// 			//'XYZ'
	// 		);
	// 		object.rotation.copy(euler);
	// 		object.scale.copy(this._update_transform_from_params_scale);
	// 		object.matrixAutoUpdate = true;
	// 		object.updateMatrix();

	// 		object.dispatchEvent({type: 'change'});
	// 	}
	// }
	private _core_transform = new CoreTransform();
	private _update_matrix_from_params_with_core_transform() {
		const object = this.node.object;

		let prev_auto_update = object.matrixAutoUpdate;
		if (prev_auto_update) {
			object.matrixAutoUpdate = false;
		}
		const matrix = this._core_transform.matrix(
			this.node.pv.t,
			this.node.pv.r,
			this.node.pv.s,
			this.node.pv.scale,
			ROTATION_ORDERS[this.node.pv.rotation_order]
		);
		object.matrix.identity();
		object.applyMatrix4(matrix);
		object.updateMatrix();
		if (prev_auto_update) {
			object.matrixAutoUpdate = true;
		}

		object.dispatchEvent({type: 'change'});
	}

	set_params_from_matrix(matrix: Matrix4, options: SetParamsFromMatrixOptions = {}) {
		CoreTransform.set_params_from_matrix(matrix, this.node, options);
	}
}
