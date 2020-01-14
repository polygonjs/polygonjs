import {TypedSopNode} from './_Base';
// import {GroupParamController} from './utils/GroupParamController';

import {CoreGroup} from 'src/core/geometry/Group';
import {CoreTransform} from 'src/core/Transform';
// import {ParamType} from 'src/engine/poly/ParamType';
import {InputCloneMode} from 'src/engine/poly/InputCloneMode';

// const DEFAULT_PARAMS = {
// 	PIVOT: [0, 0, 0] as [number, number, number],
// };

import {NodeParamsConfig, ParamConfig} from 'src/engine/nodes/utils/params/ParamsConfig';
class TransformSopParamConfig extends NodeParamsConfig {
	group = ParamConfig.STRING('');

	// transform
	t = ParamConfig.VECTOR3([0, 0, 0]);
	r = ParamConfig.VECTOR3([0, 0, 0]);
	s = ParamConfig.VECTOR3([1, 1, 1]);
	scale = ParamConfig.FLOAT(1);
	look_at = ParamConfig.OPERATOR_PATH('');
	up = ParamConfig.VECTOR3([0, 1, 0]);
	pivot = ParamConfig.VECTOR3([0, 0, 0]);
}
const ParamsConfig = new TransformSopParamConfig();

export class TransformSopNode extends TypedSopNode<TransformSopParamConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'transform';
	}
	// allow_eval_key_check() {
	// 	return true;
	// }

	static displayed_input_names(): string[] {
		return ['geometry to transform'];
	}

	// constructor(scene: PolyScene) {
	// 	super(scene);
	initialize_node() {
		this.io.inputs.set_count(1);
		this.io.inputs.init_inputs_clonable_state([InputCloneMode.FROM_NODE]);
	}

	create_params() {
		// GroupParamController.add_param(this); // TODO: typescript
		// CoreTransform.create_params(this);
		// this.add_param(ParamType.VECTOR3, 'pivot', DEFAULT_PARAMS.PIVOT);
	}

	cook(input_contents: CoreGroup[]) {
		const objects = input_contents[0].objects();
		const matrix = CoreTransform.matrix(this.pv.t, this.pv.r, this.pv.s, this.pv.scale);

		if (this.pv.group === '') {
			for (let object of objects) {
				let geometry;
				if ((geometry = object.geometry) != null) {
					geometry.translate(-this.pv.pivot.x, -this.pv.pivot.y, -this.pv.pivot.z);
					geometry.applyMatrix(matrix);
					geometry.translate(this.pv.pivot.x, this.pv.pivot.y, this.pv.pivot.z);
				} else {
					object.applyMatrix(matrix);
				}
			}
		} else {
			const core_group = CoreGroup.from_objects(objects);
			const points = core_group.points_from_group(this.pv.group);
			for (let point of points) {
				const position = point.position().sub(this.pv.pivot);
				position.applyMatrix4(matrix);
				point.set_position(position.add(this.pv.pivot));
			}
		}

		this.set_objects(objects);
	}
}
