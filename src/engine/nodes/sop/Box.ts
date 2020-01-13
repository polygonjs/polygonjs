import {BaseNode} from '../_Base';
import {BaseSopNode} from './_Base';
import {CoreTransform} from 'src/core/Transform';
import {CoreGroup} from 'src/core/geometry/Group';

import {Vector3} from 'three/src/math/Vector3';
import {BoxBufferGeometry} from 'three/src/geometries/BoxGeometry';
// import {CoreGeometry} from 'src/core/geometry/Geometry'
import {ParamType} from 'src/engine/poly/ParamType';
import {InputCloneMode} from 'src/engine/poly/InputCloneMode';

// @param( ParamType.FLOAT, 'size', 1 )
export class BoxSopNode extends BaseSopNode {
	@BaseNode.ParamVector3('center') _param_center: Vector3;
	@BaseNode.ParamFloat('divisions') _param_divisions: number;
	@BaseNode.ParamFloat('size') _param_size: number;
	static type() {
		return 'box';
	}

	static displayed_input_names(): string[] {
		return ['geometry to create bounding box from (optional)'];
	}

	constructor() {
		super();
		this.io.inputs.set_count_to_one_max();
		this.io.inputs.init_inputs_clonable_state([InputCloneMode.NEVER]);
	}

	create_params() {
		this.add_param(ParamType.FLOAT, 'size', 1);
		this.add_param(ParamType.INTEGER, 'divisions', 1, {
			range: [1, 10],
			range_locked: [true, false],
		});
		this.add_param(ParamType.VECTOR3, 'center', [0, 0, 0]);
	}

	cook(input_contents: CoreGroup[]) {
		const core_group = input_contents[0];
		if (core_group) {
			this._cook_with_input(core_group);
		} else {
			this._cook_without_input();
		}
	}

	_cook_without_input() {
		//		this.eval_all_params =>
		const divisions = this._divisions();
		const size = this._param_size;
		const geometry = new BoxBufferGeometry(size, size, size, divisions, divisions, divisions);

		geometry.translate(this._param_center.x, this._param_center.y, this._param_center.z);

		geometry.computeVertexNormals();
		// const buffer_geometry = CoreGeometry.clone(geometry);
		this.set_geometry(geometry);
	}

	_cook_with_input(core_group: CoreGroup) {
		// this.request_input_container 0, (container)=>
		// 	if container? && (group = container.group({clone: false}))?
		// 		this.eval_all_params =>

		const divisions = this._divisions();

		const bbox = core_group.bounding_box();
		const size = bbox.max.clone().sub(bbox.min);
		const center = bbox.max
			.clone()
			.add(bbox.min)
			.multiplyScalar(0.5);

		const geometry = new BoxBufferGeometry(size.x, size.y, size.z, divisions, divisions, divisions);
		const matrix = CoreTransform.translation_matrix(center.x, center.y, center.z);
		geometry.applyMatrix(matrix);

		// const buffer_geometry = CoreGeometry.clone(geometry);
		this.set_geometry(geometry);
	}

	// else
	// 	this.set_error("first input is invalid")

	_divisions() {
		return Math.max(1, this._param_divisions);
	}
}
