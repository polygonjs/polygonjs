import {Euler} from 'three/src/math/Euler';
import {Matrix4} from 'three/src/math/Matrix4';
import {Vector3} from 'three/src/math/Vector3';

// import {Object3D} from 'three/src/core/Object3D';
// import {BaseTransformedObjNodeType} from '../_BaseTransformed';
import {CoreMath} from 'src/core/math/_Module';
import {CoreTransform, SetParamsFromMatrixOptions} from 'src/core/Transform';
// import {BaseObjNodeType} from '../_Base';

import {NodeParamsConfig, ParamConfig} from 'src/engine/nodes/utils/params/ParamsConfig';
// import {NodeContext} from 'src/engine/poly/NodeContext';
import {TypedObjNode, BaseObjNodeType} from '../_Base';
import {Object3D} from 'three/src/core/Object3D';
// import {FlagsControllerD} from '../../utils/FlagsController';
// import {LookAtController} from './LookAtController';
export function TransformedParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		transform = ParamConfig.FOLDER();
		t = ParamConfig.VECTOR3([0, 0, 0]);
		r = ParamConfig.VECTOR3([0, 0, 0]);
		s = ParamConfig.VECTOR3([1, 1, 1]);
		scale = ParamConfig.FLOAT(1);
		// look_at = ParamConfig.OPERATOR_PATH('', {node_selection: {context: NodeContext.OBJ}});
		// up = ParamConfig.VECTOR3([0, 1, 0]);
		// pivot = ParamConfig.VECTOR3([0, 0, 0]);
	};
}
class TransformedParamsConfig extends TransformedParamConfig(NodeParamsConfig) {}
export class TransformedObjNode extends TypedObjNode<Object3D, TransformedParamsConfig> {
	// public readonly flags: FlagsControllerD = new FlagsControllerD(this);
	readonly transform_controller: TransformController = new TransformController(this);
	// get transform_controller(): TransformController {
	// 	return this._transform_controller; // = this._transform_controller || new TransformController(this));
	// }
}

export class TransformController {
	constructor(private node: TransformedObjNode) {}

	// protected _look_at_controller = new LookAtController(this.node);
	// get look_at_controller(): LookAtController {
	// 	return (this._look_at_controller = this._look_at_controller || new LookAtController(this));
	// }

	initialize_node() {
		// not sure we should change if it is used in the scene, as parented children may still be
		// this.node.flags.display.add_hook(() => {
		// 	// this.node.set_used_in_scene(this.node.flags.display.active || false);
		// 	this.node.object.visible = this.node.flags.display.active;
		// });
		// this.node.set_used_in_scene(true);

		this.node.io.inputs.set_count(0, 1);
		this.node.io.inputs.set_depends_on_inputs(false);
		this.node.io.outputs.set_has_one_output();
		this.node.io.inputs.add_hook(() => {
			this.on_input_updated();
		});

		const hook_name = '_cook_main_without_inputs_when_dirty';
		if (!this.node.dirty_controller.has_hook(hook_name)) {
			this.node.dirty_controller.add_post_dirty_hook(hook_name, this._cook_main_without_inputs_when_dirty_bound);
		}
	}
	// TODO: this will have to be checked via the parent, when I will have obj managers at lower levels than root
	private _cook_main_without_inputs_when_dirty_bound = this._cook_main_without_inputs_when_dirty.bind(this);
	private async _cook_main_without_inputs_when_dirty() {
		// if (this.node.used_in_scene) {
		await this.node.cook_controller.cook_main_without_inputs();
		// }
	}

	static on_input_updated(node: BaseObjNodeType) {
		if (node.io.inputs.input(0) != null) {
			node.root.add_to_parent_transform(node);
		} else {
			node.root.remove_from_parent_transform(node);
		}
	}
	on_input_updated() {
		TransformController.on_input_updated(this.node);
	}

	update(matrix?: Matrix4) {
		// const object = this.node.object;
		// const update_full_matrix = false; // if true the camera controls do not work anymore
		//matrix = Core.Transform.matrix_from_node_with_transform_params(this)

		// if (object) {
		// if update_full_matrix
		// 	object.matrixAutoUpdate = false
		// 	object.matrix = matrix
		// else

		// if (this._look_at_controller.active == true) {
		// 	return this._look_at_controller.compute(); //this._use_look_at_param();
		// } else {
		this.update_transform_with_matrix(matrix);
		// }
		// if matrix?
		// 	# do not apply to cameras with control
		// 	object.matrixAutoUpdate = false
		// 	object.matrix = matrix
		// else
		// 	this.update_transform_from_params()
		// } else {
		// 	console.warn(`no object to update for ${this.node.full_path()}`);
		// 	// return false;
		// }
	}

	update_transform_with_matrix(matrix?: Matrix4) {
		//console.warn "no object to update for #{this.full_path()}"
		const object = this.node.object;
		//matrix ?= Core.Transform.matrix_from_node_with_transform_params(this)
		if (matrix != null && !matrix.equals(object.matrix)) {
			// do not apply to cameras with control

			object.matrixAutoUpdate = false;
			object.matrix = matrix;

			return object.dispatchEvent({type: 'change'});
		} else {
			return this.update_transform_from_params();
		}
	}

	private _update_transform_from_params_scale = new Vector3();
	update_transform_from_params() {
		const object = this.node.object;
		if (object) {
			const position: Vector3 = this.node.pv.t;
			//quaternion = new Quaternion()
			const rotation: Vector3 = this.node.pv.r;

			this._update_transform_from_params_scale.copy(this.node.pv.s).multiplyScalar(this.node.pv.scale);
			// const scale: Vector3 = this.node.pv.s
			// 	.clone()
			// 	.multiplyScalar(this.node.pv.scale);
			//matrix.decompose( position, quaternion, scale )

			object.matrixAutoUpdate = false;
			object.position.copy(position);
			//object.quaternion.copy(quaternion)
			const radians = [
				CoreMath.degrees_to_radians(rotation.x),
				CoreMath.degrees_to_radians(rotation.y),
				CoreMath.degrees_to_radians(rotation.z),
			];
			const euler = new Euler(
				radians[0],
				radians[1],
				radians[2]
				//'XYZ'
			);
			object.rotation.copy(euler);
			object.scale.copy(this._update_transform_from_params_scale);
			object.matrixAutoUpdate = true;
			object.updateMatrix();

			object.dispatchEvent({type: 'change'});
		}
	}

	set_params_from_matrix(matrix: Matrix4, options: SetParamsFromMatrixOptions = {}) {
		CoreTransform.set_params_from_matrix(matrix, this.node, options);
	}
}
