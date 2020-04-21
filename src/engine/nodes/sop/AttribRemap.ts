import lodash_max from 'lodash/max';
import lodash_min from 'lodash/min';
import lodash_uniq from 'lodash/uniq';
import lodash_isNumber from 'lodash/isNumber';
import {Vector3} from 'three/src/math/Vector3';
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class AttribRemapSopParamsConfig extends NodeParamsConfig {
	name = ParamConfig.STRING();
	ramp = ParamConfig.RAMP();
	change_name = ParamConfig.BOOLEAN(0);
	new_name = ParamConfig.STRING('', {visible_if: {change_name: 1}});
}
const ParamsConfig = new AttribRemapSopParamsConfig();

export class AttribRemapSopNode extends TypedSopNode<AttribRemapSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'attrib_remap';
	}

	initialize_node() {
		this.io.inputs.set_count(1);
	}

	cook(input_contents: CoreGroup[]) {
		const core_group = input_contents[0];
		this._remap_attribute(core_group);
		this.set_core_group(core_group);
	}

	_remap_attribute(core_group: CoreGroup) {
		const points = core_group.points();
		if (points.length === 0) {
			return;
		}
		if (this.pv.name === '') {
			return;
		}

		const attrib_size = points[0].attrib_size(this.pv.name);
		const values = points.map((point) => point.attrib_value(this.pv.name));
		// let min: NumericAttribValue, max: NumericAttribValue;
		let normalized_values: NumericAttribValue[] = new Array(points.length);
		switch (attrib_size) {
			case 1:
				const valuesf = values as number[];
				if (this.pv.only_integer_values) {
					const sorted_values = lodash_uniq(valuesf);
					const index_by_value: Dictionary<number> = {};
					sorted_values.forEach((sorted_value, i) => (index_by_value[sorted_value] = i));
					normalized_values = valuesf.map((value) => index_by_value[value]);
				} else {
					const minf = lodash_min(valuesf);
					const maxf = lodash_max(valuesf);
					//this._save_min_max(group, min, max)
					if (lodash_isNumber(minf) && lodash_isNumber(maxf)) {
						for (let i = 0; i < valuesf.length; i++) {
							const value = valuesf[i];
							const normalized_value = maxf > minf ? (value - minf) / (maxf - minf) : 1;
							normalized_values[i] = normalized_value;
						}
					}
				}
				break;

			case 3:
				const valuesv = values as Vector3[];
				const minv = new Vector3(
					lodash_min(valuesv.map((v) => v.x)),
					lodash_min(valuesv.map((v) => v.y)),
					lodash_min(valuesv.map((v) => v.z))
				);
				const maxv = new Vector3(
					lodash_max(valuesv.map((v) => v.x)),
					lodash_max(valuesv.map((v) => v.y)),
					lodash_max(valuesv.map((v) => v.z))
				);
				//this._save_min_max(group, min, max)
				if (minv instanceof Vector3 && maxv instanceof Vector3) {
					for (let i = 0; i < valuesv.length; i++) {
						const value = valuesv[i];
						const normalized_value = new Vector3(
							(value.x - minv.x) / (maxv.x - minv.x),
							(value.y - minv.y) / (maxv.y - minv.y),
							(value.z - minv.z) / (maxv.z - minv.z)
						);
						normalized_values[i] = normalized_value;
					}
				}
				break;
		}

		let target_name = this.pv.name;
		if (this.pv.change_name) {
			target_name = this.pv.new_name;
			if (!core_group.has_attrib(target_name)) {
				core_group.add_numeric_vertex_attrib(target_name, attrib_size, 0);
			}
		}

		normalized_values.forEach((normalized_value, i) => {
			const point = points[i];
			point.set_attrib_value(target_name, normalized_value);
		});
	}
}

// TODO: they should be saved as a detail, not per object
// _save_min_max: (group, min, max)->
// 	group.traverse (object)=>
// 		object_wrapper = new Core.Geometry.Object(object)
// 		object_wrapper.add_attribute("#{@_param_name}_min", min)
// 		object_wrapper.add_attribute("#{@_param_name}_max", max)
