import {TypedSopNode} from './_Base';
import {SubdivisionModifier} from 'three/examples/jsm/modifiers/SubdivisionModifier';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CoreGroup} from '../../../core/geometry/Group';
import {Mesh} from 'three/src/objects/Mesh';
import {BufferGeometry} from 'three';
class SubdivideSopParamsConfig extends NodeParamsConfig {
	subdivisions = ParamConfig.INTEGER(1, {
		range: [0, 5],
		range_locked: [true, false],
	});
}
const ParamsConfig = new SubdivideSopParamsConfig();

export class SubdivideSopNode extends TypedSopNode<SubdivideSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'subdivide';
	}

	initialize_node() {
		this.io.inputs.set_count(1);
	}

	cook(input_contents: CoreGroup[]) {
		const core_group = input_contents[0];
		const modifier = new SubdivisionModifier(this.pv.subdivisions);

		for (let object of core_group.objects()) {
			const geometry = (object as Mesh).geometry as BufferGeometry;
			if (geometry) {
				const subdivided_legacy_geometry = modifier.modify(geometry);
				const subdivided_geometry = new BufferGeometry().fromGeometry(subdivided_legacy_geometry);
				(object as Mesh).geometry = subdivided_geometry;
			}
		}
		this.set_core_group(core_group);
	}
}
