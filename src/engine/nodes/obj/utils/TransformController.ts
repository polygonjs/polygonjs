import {Euler} from 'three/src/math/Euler';
import {Matrix4} from 'three/src/math/Matrix4';
import {Vector3} from 'three/src/math/Vector3';

import {CoreMath} from 'src/core/math/_Module';
import {CoreTransform, SetParamsFromMatrixOptions} from 'src/core/Transform';
import {BaseObjNode} from '../_Base';

export class TransformController {
	constructor(private node: BaseObjNode) {}

	post_set_input() {
		if (this.node.io.inputs.input(0) != null) {
			this.node.root().add_to_parent_transform(this.node);
		} else {
			this.node.root().remove_from_parent_transform(this.node);
		}
	}

	update_transform(matrix?: Matrix4) {
		const object = this.node.object;
		// const update_full_matrix = false; // if true the camera controls do not work anymore
		//matrix = Core.Transform.matrix_from_node_with_transform_params(this)

		if (object) {
			// if update_full_matrix
			// 	object.matrixAutoUpdate = false
			// 	object.matrix = matrix
			// else

			if (this.node.look_at_controller.active == true) {
				return this.node.look_at_controller.compute(); //this._use_look_at_param();
			} else {
				return this.update_transform_with_matrix(matrix);
			}
			// if matrix?
			// 	# do not apply to cameras with control
			// 	object.matrixAutoUpdate = false
			// 	object.matrix = matrix
			// else
			// 	this.update_transform_from_params()
		} else {
			console.warn(`no object to update for ${this.node.full_path()}`);
			return false;
		}
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

	update_transform_from_params() {
		const object = this.node.object;
		if (object) {
			const position: Vector3 = this.node.params.vector3('t');
			//quaternion = new Quaternion()
			const rotation: Vector3 = this.node.params.vector3('r');
			const scale: Vector3 = this.node.params
				.vector3('s')
				.clone()
				.multiplyScalar(this.node.params.float('scale'));
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
			object.scale.copy(scale);
			object.matrixAutoUpdate = true;
			object.updateMatrix();

			object.dispatchEvent({type: 'change'});
		}
	}

	set_params_from_matrix(matrix: Matrix4, options: SetParamsFromMatrixOptions = {}) {
		CoreTransform.set_params_from_matrix(matrix, this.node, options);
	}
}
