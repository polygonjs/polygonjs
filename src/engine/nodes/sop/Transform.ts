import {Vector3} from 'three/src/math/Vector3';

import {BaseNode} from '../_Base';
import {BaseSopNode} from './_Base';
import {GroupParamController} from './utils/GroupParamController';

import {CoreGroup} from 'src/core/geometry/Group';
import {CoreTransform} from 'src/core/Transform';
import {ParamType} from 'src/engine/poly/ParamType';
import {InputCloneMode} from 'src/engine/poly/InputCloneMode';

const DEFAULT_PARAMS = {
	PIVOT: [0, 0, 0] as [number, number, number],
};

export class TransformSopNode extends BaseSopNode {
	@BaseNode.ParamString('group') _param_group: string;
	@BaseNode.ParamVector3('pivot') _param_pivot: Vector3;
	static type() {
		return 'transform';
	}
	// allow_eval_key_check() {
	// 	return true;
	// }

	static displayed_input_names(): string[] {
		return ['geometry to transform'];
	}

	constructor() {
		super();

		this.io.inputs.set_count(1);
		this.io.inputs.init_inputs_clonable_state([InputCloneMode.FROM_NODE]);
	}

	create_params() {
		GroupParamController.add_param(this);
		CoreTransform.create_params(this);
		this.add_param(ParamType.VECTOR3, 'pivot', DEFAULT_PARAMS.PIVOT);
	}

	cook(input_contents: CoreGroup[]) {
		const objects = input_contents[0].objects();
		const matrix = CoreTransform.matrix_from_node_with_transform_params(this);

		if (this._param_group === '') {
			for (let object of objects) {
				let geometry;
				if ((geometry = object.geometry) != null) {
					geometry.translate(-this._param_pivot.x, -this._param_pivot.y, -this._param_pivot.z);
					geometry.applyMatrix(matrix);
					geometry.translate(this._param_pivot.x, this._param_pivot.y, this._param_pivot.z);
				} else {
					object.applyMatrix(matrix);
				}
			}
		} else {
			const core_group = CoreGroup.from_objects(objects);
			const points = core_group.points_from_group(this._param_group);
			for (let point of points) {
				const position = point.position().sub(this._param_pivot);
				position.applyMatrix4(matrix);
				point.set_position(position.add(this._param_pivot));
			}
		}

		this.set_objects(objects);
	}
}
