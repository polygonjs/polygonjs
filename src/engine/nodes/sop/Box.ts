import {TypedSopNode} from './_Base';
import {CoreTransform} from '../../../core/Transform';
import {CoreGroup} from '../../../core/geometry/Group';

// import {Vector3} from 'three/src/math/Vector3';
import {BoxBufferGeometry} from 'three/src/geometries/BoxGeometry';
// import {CoreGeometry} from '../../../core/geometry/Geometry'
// import {ParamType} from '../../poly/ParamType';
import {InputCloneMode} from '../../poly/InputCloneMode';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class BoxSopParamsConfig extends NodeParamsConfig {
	size = ParamConfig.FLOAT(1);
	divisions = ParamConfig.INTEGER(1, {
		range: [1, 10],
		range_locked: [true, false],
	});
	center = ParamConfig.VECTOR3([0, 0, 0]);
}
const ParamsConfig = new BoxSopParamsConfig();

export class BoxSopNode extends TypedSopNode<BoxSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'box';
	}

	static displayed_input_names(): string[] {
		return ['geometry to create bounding box from (optional)'];
	}

	private _core_transform = new CoreTransform();
	// constructor(scene: PolyScene) {
	// 	super(scene);
	// }
	initialize_node() {
		this.io.inputs.set_count(0, 1);
		this.io.inputs.init_inputs_clonable_state([InputCloneMode.NEVER]);
	}
	// create_params() {
	// 	this.add_param(ParamType.FLOAT, 'size', 1);
	// 	this.add_param(ParamType.INTEGER, 'divisions', 1, {
	// 		range: [1, 10],
	// 		range_locked: [true, false],
	// 	});
	// 	this.add_param(ParamType.VECTOR3, 'center', [0, 0, 0]);
	// }

	cook(input_contents: CoreGroup[]) {
		const core_group = input_contents[0];
		if (core_group) {
			this._cook_with_input(core_group);
		} else {
			this._cook_without_input();
		}
	}

	private _cook_without_input() {
		//		this.eval_all_params =>
		const divisions = this.pv.divisions;
		const size = this.pv.size;
		const geometry = new BoxBufferGeometry(size, size, size, divisions, divisions, divisions);

		geometry.translate(this.pv.center.x, this.pv.center.y, this.pv.center.z);

		geometry.computeVertexNormals();

		// const buffer_geometry = CoreGeometry.clone(geometry);
		this.set_geometry(geometry);
	}

	private _cook_with_input(core_group: CoreGroup) {
		const divisions = this.pv.divisions;

		const bbox = core_group.bounding_box();
		const size = bbox.max.clone().sub(bbox.min);
		const center = bbox.max.clone().add(bbox.min).multiplyScalar(0.5);

		const geometry = new BoxBufferGeometry(size.x, size.y, size.z, divisions, divisions, divisions);
		const matrix = this._core_transform.translation_matrix(center);
		geometry.applyMatrix4(matrix);

		// const buffer_geometry = CoreGeometry.clone(geometry);
		this.set_geometry(geometry);
	}

	// else
	// 	this.set_error("first input is invalid")

	// _divisions() {
	// 	return Math.max(1, this.pv.divisions);
	// }
}
