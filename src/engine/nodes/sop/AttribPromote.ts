import lodash_max from 'lodash/max';
import lodash_min from 'lodash/min';

import {InputCloneMode} from '../../poly/InputCloneMode';
import {TypedSopNode} from './_Base';
import {AttribClass, AttribClassMenuEntries} from '../../../core/geometry/Constant';
import {CoreObject} from '../../../core/geometry/Object';
import {CoreGroup} from '../../../core/geometry/Group';
import {CoreString} from '../../../core/String';

export enum AttribPromoteMode {
	MIN = 0,
	MAX = 1,
	FIRST_FOUND = 2,
}
// const PROMOTE_MODE:PROMOTE_MODE = {
// 	MIN: 0,
// 	MAX: 1,
// 	// AVERAGE: 2,
// 	FIRST_FOUND: 3,
// };
const PromoteModeMenuEntries = [
	{name: 'min', value: AttribPromoteMode.MIN},
	{name: 'max', value: AttribPromoteMode.MAX},
	{name: 'first_found', value: AttribPromoteMode.FIRST_FOUND},
];

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class AttribPromoteSopParamsConfig extends NodeParamsConfig {
	class_from = ParamConfig.INTEGER(AttribClass.VERTEX, {
		menu: {
			entries: AttribClassMenuEntries,
		},
	});
	class_to = ParamConfig.INTEGER(AttribClass.OBJECT, {
		menu: {
			entries: AttribClassMenuEntries,
		},
	});
	mode = ParamConfig.INTEGER(AttribPromoteMode.FIRST_FOUND, {
		menu: {
			entries: PromoteModeMenuEntries,
		},
	});
	name = ParamConfig.STRING('');
}
const ParamsConfig = new AttribPromoteSopParamsConfig();

export class AttribPromoteSopNode extends TypedSopNode<AttribPromoteSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'attrib_promote';
	}

	initialize_node() {
		this.io.inputs.set_count(1);
		this.io.inputs.init_inputs_cloned_state(InputCloneMode.FROM_NODE);
		// this.ui_data.set_icon('sort-amount-up');
	}

	create_params() {}

	private _core_group: CoreGroup | undefined;
	private _core_object: CoreObject | undefined;
	private _values_per_attrib_name: Dictionary<NumericAttribValue[]> = {};
	private _filtered_values_per_attrib_name: Dictionary<NumericAttribValue | undefined> = {};
	cook(input_contents: CoreGroup[]) {
		this._core_group = input_contents[0];

		this._values_per_attrib_name = {};
		this._filtered_values_per_attrib_name = {};

		for (let core_object of this._core_group.core_objects()) {
			this._core_object = core_object;
			this.find_values();
			this.filter_values();
			this.set_values();
		}

		// switch @_param_class_from
		// 	when Core.Geometry.ATTRIB_CLASS.VERTEX then this.promote_attribute_from_vertex()
		// 	when Core.Geometry.ATTRIB_CLASS.OBJECT then this.promote_attribute_from_object()
		this.set_core_group(this._core_group);
	}

	// private promote_attribute_from_vertex() {
	// 	// switch (this.pv.class_to) {
	// 	// 	case AttribClass.VERTEX:
	// 			return this.promote_attribute_from_vertex_to_vertex();
	// 		// case AttribClass.OBJECT:
	// 		// return this.promote_attribute_from_vertex_to_object();
	// 	// }
	// }

	// private promote_attribute_from_object() {
	// 	switch (this.pv.class_to) {
	// 		case AttribClass.VERTEX:
	// 		// return this.promote_attribute_from_object_to_vertex();
	// 		case AttribClass.OBJECT:
	// 		// return this.promote_attribute_from_object_to_object();
	// 	}
	// }

	// private promote_attribute_from_vertex_to_vertex() {
	// 	if (this._core_group) {
	// 		const attrib_names = CoreString.attrib_names(this.pv.name);
	// 		const points = this._core_group.points();
	// 		for (let attrib_name of attrib_names) {
	// 			const values = lodash_map(points, (point) => point.attrib_value(attrib_name));
	// 			const new_value = (() => {
	// 				switch (this.pv.mode) {
	// 					case PromoteMode.MIN:
	// 						return lodash_min(values);
	// 					case PromoteMode.MAX:
	// 						return lodash_max(values);
	// 					// case PROMOTE_MODE.AVERAGE: return lodash_average(values);
	// 					default:
	// 						return null;
	// 				}
	// 			})();

	// 			if (new_value != null) {
	// 				lodash_each(points, (point) => point.set_attrib_value(attrib_name, new_value));
	// 			}
	// 		}
	// 	}
	// }

	private find_values() {
		const attrib_names = CoreString.attrib_names(this.pv.name);
		for (let attrib_name of attrib_names) {
			switch (this.pv.class_from) {
				case AttribClass.VERTEX:
					return this.find_values_from_points(attrib_name);
				case AttribClass.OBJECT:
					return this.find_values_from_object(attrib_name);
			}
		}
	}

	private find_values_from_points(attrib_name: string) {
		if (this._core_object) {
			const points = this._core_object.points();
			const first_point = points[0];
			if (first_point) {
				if (!first_point.is_attrib_indexed(attrib_name)) {
					this._values_per_attrib_name[attrib_name] = points.map(
						(point) => point.attrib_value(attrib_name) as NumericAttribValue
					);
				}
			}
		}
	}

	private find_values_from_object(attrib_name: string) {
		this._values_per_attrib_name[attrib_name] = [];
		if (this._core_object) {
			this._values_per_attrib_name[attrib_name].push(this._core_object.attrib_value(attrib_name) as number);
		}
	}

	private filter_values() {
		const attrib_names = Object.keys(this._values_per_attrib_name);
		for (let attrib_name of attrib_names) {
			const values = this._values_per_attrib_name[attrib_name];
			switch (this.pv.mode) {
				case AttribPromoteMode.MIN:
					this._filtered_values_per_attrib_name[attrib_name] = lodash_min(values);
					break;
				case AttribPromoteMode.MAX:
					this._filtered_values_per_attrib_name[attrib_name] = lodash_max(values);
					break;
				// case PROMOTE_MODE.AVERAGE: return lodash_average(values);
				case AttribPromoteMode.FIRST_FOUND:
					this._filtered_values_per_attrib_name[attrib_name] = values[0];
					break;
				default:
					break;
			}
		}
	}

	private set_values() {
		const attrib_names = Object.keys(this._filtered_values_per_attrib_name);
		for (let attrib_name of attrib_names) {
			const new_value = this._filtered_values_per_attrib_name[attrib_name];
			if (new_value != null) {
				switch (this.pv.class_to) {
					case AttribClass.VERTEX:
						this.set_values_to_points(attrib_name, new_value);
						break;
					case AttribClass.OBJECT:
						this.set_values_to_object(attrib_name, new_value);
						break;
				}
			}
		}
	}

	private set_values_to_points(attrib_name: string, new_value: NumericAttribValue) {
		if (this._core_group && this._core_object) {
			const attribute_exists = this._core_group.has_attrib(attrib_name);
			if (!attribute_exists) {
				const param_size = 1; // TODO: allow size with larger params
				this._core_group.add_numeric_vertex_attrib(attrib_name, param_size, new_value);
			}

			const points = this._core_object.points();
			points.forEach((point) => point.set_attrib_value(attrib_name, new_value));
		}
	}

	private set_values_to_object(attrib_name: string, new_value: NumericAttribValue) {
		this._core_object?.set_attrib_value(attrib_name, new_value);
	}
}
