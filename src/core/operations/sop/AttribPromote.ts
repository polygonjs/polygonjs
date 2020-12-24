import {BaseSopOperation} from './_Base';
import {DefaultOperationParams} from '../_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {AttribClass} from '../../geometry/Constant';
import {CoreObject} from '../../geometry/Object';
import {CorePoint} from '../../geometry/Point';
import {CoreString} from '../../String';
import {ArrayUtils} from '../../ArrayUtils';
interface AttribPromoteSopParams extends DefaultOperationParams {
	class_from: number;
	class_to: number;
	mode: number;
	name: string;
}

export enum AttribPromoteMode {
	MIN = 0,
	MAX = 1,
	FIRST_FOUND = 2,
}

export class AttribPromoteSopOperation extends BaseSopOperation {
	static readonly DEFAULT_PARAMS: AttribPromoteSopParams = {
		class_from: AttribClass.VERTEX,
		class_to: AttribClass.OBJECT,
		mode: AttribPromoteMode.FIRST_FOUND,
		name: '',
	};
	static readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static type(): Readonly<'attrib_promote'> {
		return 'attrib_promote';
	}

	private _core_group: CoreGroup | undefined;
	private _core_object: CoreObject | undefined;
	private _values_per_attrib_name: Dictionary<NumericAttribValue[]> = {};
	private _filtered_values_per_attrib_name: Dictionary<NumericAttribValue | undefined> = {};
	cook(input_contents: CoreGroup[], params: AttribPromoteSopParams) {
		this._core_group = input_contents[0];

		this._values_per_attrib_name = {};
		this._filtered_values_per_attrib_name = {};

		for (let core_object of this._core_group.core_objects()) {
			this._core_object = core_object;
			this.find_values(params);
			this.filter_values(params);
			this.set_values(params);
		}

		return this._core_group;
	}
	private find_values(params: AttribPromoteSopParams) {
		const attrib_names = CoreString.attrib_names(params.name);
		for (let attrib_name of attrib_names) {
			this._find_values_for_attrib_name(attrib_name, params);
		}
	}
	private _find_values_for_attrib_name(attrib_name: string, params: AttribPromoteSopParams) {
		switch (params.class_from) {
			case AttribClass.VERTEX:
				return this.find_values_from_points(attrib_name, params);
			case AttribClass.OBJECT:
				return this.find_values_from_object(attrib_name, params);
		}
	}

	private find_values_from_points(attrib_name: string, params: AttribPromoteSopParams) {
		if (this._core_object) {
			const points = this._core_object.points();
			const first_point = points[0];
			if (first_point) {
				if (!first_point.is_attrib_indexed(attrib_name)) {
					const values: NumericAttribValue[] = new Array(points.length);
					let point: CorePoint;
					for (let i = 0; i < points.length; i++) {
						point = points[i];
						values[i] = point.attrib_value(attrib_name) as NumericAttribValue;
					}
					this._values_per_attrib_name[attrib_name] = values;
				}
			}
		}
	}

	private find_values_from_object(attrib_name: string, params: AttribPromoteSopParams) {
		this._values_per_attrib_name[attrib_name] = [];
		if (this._core_object) {
			this._values_per_attrib_name[attrib_name].push(this._core_object.attrib_value(attrib_name) as number);
		}
	}

	private filter_values(params: AttribPromoteSopParams) {
		const attrib_names = Object.keys(this._values_per_attrib_name);
		for (let attrib_name of attrib_names) {
			const values = this._values_per_attrib_name[attrib_name];
			switch (params.mode) {
				case AttribPromoteMode.MIN:
					this._filtered_values_per_attrib_name[attrib_name] = ArrayUtils.min(values);
					break;
				case AttribPromoteMode.MAX:
					this._filtered_values_per_attrib_name[attrib_name] = ArrayUtils.max(values);
					break;
				case AttribPromoteMode.FIRST_FOUND:
					this._filtered_values_per_attrib_name[attrib_name] = values[0];
					break;
				default:
					break;
			}
		}
	}

	private set_values(params: AttribPromoteSopParams) {
		const attrib_names = Object.keys(this._filtered_values_per_attrib_name);
		for (let attrib_name of attrib_names) {
			const new_value = this._filtered_values_per_attrib_name[attrib_name];
			if (new_value != null) {
				switch (params.class_to) {
					case AttribClass.VERTEX:
						this.set_values_to_points(attrib_name, new_value, params);
						break;
					case AttribClass.OBJECT:
						this.set_values_to_object(attrib_name, new_value, params);
						break;
				}
			}
		}
	}

	private set_values_to_points(attrib_name: string, new_value: NumericAttribValue, params: AttribPromoteSopParams) {
		if (this._core_group && this._core_object) {
			const attribute_exists = this._core_group.has_attrib(attrib_name);
			if (!attribute_exists) {
				const param_size = 1; // TODO: allow size with larger params
				this._core_group.add_numeric_vertex_attrib(attrib_name, param_size, new_value);
			}

			const points = this._core_object.points();
			for (let point of points) {
				point.set_attrib_value(attrib_name, new_value);
			}
		}
	}

	private set_values_to_object(attrib_name: string, new_value: NumericAttribValue, params: AttribPromoteSopParams) {
		this._core_object?.set_attrib_value(attrib_name, new_value);
	}
}
