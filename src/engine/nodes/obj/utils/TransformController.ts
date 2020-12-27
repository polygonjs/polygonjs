import {TypedObjNode} from '../_Base';
import {Matrix4} from 'three/src/math/Matrix4';
import {CoreTransform, SetParamsFromMatrixOptions, ROTATION_ORDERS, RotationOrder} from '../../../../core/Transform';
import {Object3D} from 'three/src/core/Object3D';
// import {Vector3} from 'three/src/math/Vector3';
// import {Quaternion} from 'three/src/math/Quaternion';
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
		/** @param toggle on to keep world position when adding a parent or removing from one */
		keep_pos_when_parenting = ParamConfig.BOOLEAN(0);
		/** @param rotation order */
		rotation_order = ParamConfig.INTEGER(ROTATION_ORDERS.indexOf(RotationOrder.XYZ), {
			menu: {
				entries: ROTATION_ORDERS.map((order, v) => {
					return {name: order, value: v};
				}),
			},
		});
		/** @param translate */
		t = ParamConfig.VECTOR3([0, 0, 0]);
		/** @param rotation */
		r = ParamConfig.VECTOR3([0, 0, 0]);
		/** @param scale */
		s = ParamConfig.VECTOR3([1, 1, 1]);
		/** @param scale */
		scale = ParamConfig.FLOAT(1);
		// pivot = ParamConfig.VECTOR3([0, 0, 0]);
		/** @param set for the matrix to be updated every frame */
		matrix_auto_update = ParamConfig.BOOLEAN(matrix_auto_update ? 1 : 0);
		tlook_at = ParamConfig.BOOLEAN(0);
		look_at_pos = ParamConfig.VECTOR3([0, 0, 0], {
			visibleIf: {tlook_at: 1},
		});
		// look_at = ParamConfig.OPERATOR_PATH('', {
		// 	visibleIf: {tlook_at: 1},
		// 	nodeSelection: {context: NodeContext.OBJ},
		// });
		up = ParamConfig.VECTOR3([0, 1, 0], {
			visibleIf: {tlook_at: 1},
		});
	};
}
class TransformedParamsConfig extends TransformedParamConfig(NodeParamsConfig) {}
export class TransformedObjNode extends TypedObjNode<Object3D, TransformedParamsConfig> {
	readonly transform_controller: TransformController = new TransformController(this);
}

const HOOK_NAME = '_cook_main_without_inputs_when_dirty';
export class TransformController {
	constructor(private node: TransformedObjNode) {}

	initialize_node() {
		if (!this.node.dirty_controller.has_hook(HOOK_NAME)) {
			this.node.dirty_controller.add_post_dirty_hook(HOOK_NAME, this._cook_main_without_inputs_when_dirty_bound);
		}
	}
	// TODO: this will have to be checked via the parent, when I will have obj managers at lower levels than root
	private _cook_main_without_inputs_when_dirty_bound = this._cook_main_without_inputs_when_dirty.bind(this);
	private async _cook_main_without_inputs_when_dirty() {
		await this.node.cook_controller.cook_main_without_inputs();
	}

	update() {
		this.update_transform_with_matrix();
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
		this._apply_look_at();
		object.updateMatrix();

		if (prev_auto_update) {
			object.matrixAutoUpdate = true;
		}

		object.dispatchEvent({type: 'change'});
	}

	// private _look_at_target_t = new Vector3();
	// private _look_at_target_q = new Quaternion();
	// private _look_at_target_s = new Vector3();
	private _apply_look_at() {
		const pv = this.node.pv;
		if (!pv.tlook_at) {
			return;
		}
		this.node.object.up.copy(pv.up);
		this.node.object.lookAt(pv.look_at_pos);
		// const target_node = this.node.p.look_at.found_node_with_context(NodeContext.OBJ);
		// if (target_node) {
		// 	const target_object = target_node.object;
		// 	target_object.ma.decompose(this._look_at_target_t, this._look_at_target_q, this._look_at_target_s);
		// 	this.node.object.up.copy(this.node.pv.up);
		// 	this.node.object.lookAt(this._look_at_target_t);
		// 	console.log('lookat', this.node.object, target_object, this._look_at_target_t);
		// }
	}

	set_params_from_matrix(matrix: Matrix4, options: SetParamsFromMatrixOptions = {}) {
		CoreTransform.set_params_from_matrix(matrix, this.node, options);
	}

	//
	//
	// KEEP POS WHEN PARENTING
	//
	//
	static update_node_transform_params_if_required(node: TransformedObjNode, new_parent_object: Object3D) {
		node.transform_controller.update_node_transform_params_if_required(new_parent_object);
	}
	// private _keep_pos_when_parenting_t = new Vector3();
	// private _keep_pos_when_parenting_q = new Quaternion();
	// private _keep_pos_when_parenting_s = new Vector3();
	private _keep_pos_when_parenting_m_object = new Matrix4();
	private _keep_pos_when_parenting_m_new_parent_inv = new Matrix4();
	update_node_transform_params_if_required(new_parent_object: Object3D) {
		if (!this.node.pv.keep_pos_when_parenting) {
			return;
		}
		if (!this.node.scene.loading_controller.loaded) {
			return;
		}
		if (new_parent_object == this.node.object.parent) {
			return;
		}
		const object = this.node.object;
		object.updateMatrixWorld(true);
		new_parent_object.updateMatrixWorld(true);
		// compute mat
		this._keep_pos_when_parenting_m_object.copy(object.matrixWorld);
		this._keep_pos_when_parenting_m_new_parent_inv.copy(new_parent_object.matrixWorld);
		this._keep_pos_when_parenting_m_new_parent_inv.invert();
		this._keep_pos_when_parenting_m_object.premultiply(this._keep_pos_when_parenting_m_new_parent_inv);
		// apply mat
		CoreTransform.set_params_from_matrix(this._keep_pos_when_parenting_m_object, this.node, {scale: true});
	}
	update_node_transform_params_from_object(update_matrix = false) {
		const object = this.node.object;
		if (update_matrix) {
			object.updateMatrixWorld(true);
		}
		CoreTransform.set_params_from_matrix(object.matrixWorld, this.node, {scale: true});
	}
}
