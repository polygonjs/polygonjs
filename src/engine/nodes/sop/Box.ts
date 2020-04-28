import {TypedSopNode} from './_Base';
import {CoreTransform} from '../../../core/Transform';
import {CoreGroup} from '../../../core/geometry/Group';
import {BoxBufferGeometry} from 'three/src/geometries/BoxGeometry';
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

	initialize_node() {
		this.io.inputs.set_count(0, 1);
		this.io.inputs.init_inputs_cloned_state(InputCloneMode.NEVER);
	}

	cook(input_contents: CoreGroup[]) {
		const core_group = input_contents[0];
		if (core_group) {
			this._cook_with_input(core_group);
		} else {
			this._cook_without_input();
		}
	}

	private _cook_without_input() {
		const divisions = this.pv.divisions;
		const size = this.pv.size;
		const geometry = new BoxBufferGeometry(size, size, size, divisions, divisions, divisions);
		geometry.translate(this.pv.center.x, this.pv.center.y, this.pv.center.z);
		geometry.computeVertexNormals();

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

		this.set_geometry(geometry);
	}
}
