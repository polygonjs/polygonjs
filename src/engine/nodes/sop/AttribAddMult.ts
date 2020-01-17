import {TypedSopNode} from './_Base';
// import {Core} from 'src/Core/_Module';
import {CoreGroup} from 'src/core/geometry/Group';

import {NodeParamsConfig, ParamConfig} from 'src/engine/nodes/utils/params/ParamsConfig';
import {BufferGeometry, BufferAttribute} from 'three';
import {InputCloneMode} from 'src/engine/poly/InputCloneMode';
class AttribAddMultSopParamsConfig extends NodeParamsConfig {
	name = ParamConfig.STRING('');
	pre_add = ParamConfig.FLOAT(0, {range: [0, 1]});
	mult = ParamConfig.FLOAT(1, {range: [0, 1]});
	post_add = ParamConfig.FLOAT(0, {range: [0, 1]});
}
const ParamsConfig = new AttribAddMultSopParamsConfig();

export class AttribAddMultSopNode extends TypedSopNode<AttribAddMultSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'attrib_add_mult';
	}

	initialize_node() {
		this.io.inputs.set_count(1);
		this.io.inputs.init_inputs_clonable_state([InputCloneMode.FROM_NODE]);
	}

	cook(input_contents: CoreGroup[]) {
		const core_group = input_contents[0];
		const attrib_names = core_group.attrib_names_matching_mask(this.pv.name);

		for (let attrib_name of attrib_names) {
			const geometries = core_group.geometries();
			for (let geometry of geometries) {
				this._update_attrib(attrib_name, geometry);
			}
		}

		this.set_core_group(core_group);
	}

	private _update_attrib(attrib_name: string, geometry: BufferGeometry) {
		const attribute = geometry.getAttribute(attrib_name) as BufferAttribute;
		if (attribute) {
			const values = attribute.array as number[];

			const pre_add = this.pv.pre_add;
			const mult = this.pv.mult;
			const post_add = this.pv.post_add;
			for (let i = 0; i < values.length; i++) {
				const value = values[i];
				values[i] = (value + pre_add) * mult + post_add;
			}
			if (!this.io.inputs.input_cloned(0)) {
				attribute.needsUpdate = true;
			}
		}
	}
}
