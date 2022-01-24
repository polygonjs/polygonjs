import {BaseSopOperation} from './_Base';
import {DefaultOperationParams} from '../_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {AttribClass} from '../../../core/geometry/Constant';
import {CoreObject} from '../../../core/geometry/Object';
import {CorePoint} from '../../../core/geometry/Point';
import {CoreString} from '../../../core/String';
import {ArrayUtils} from '../../../core/ArrayUtils';
import {NumericAttribValue, PolyDictionary} from '../../../types/GlobalTypes';
import {CoreAttribute} from '../../../core/geometry/Attribute';
interface AttribPromoteSopParams extends DefaultOperationParams {
	classFrom: number;
	classTo: number;
	mode: number;
	name: string;
}

export enum AttribPromoteMode {
	MIN = 0,
	MAX = 1,
	FIRST_FOUND = 2,
}

export class AttribPromoteSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: AttribPromoteSopParams = {
		classFrom: AttribClass.VERTEX,
		classTo: AttribClass.OBJECT,
		mode: AttribPromoteMode.FIRST_FOUND,
		name: '',
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static override type(): Readonly<'attribPromote'> {
		return 'attribPromote';
	}

	private _core_group: CoreGroup | undefined;
	private _core_object: CoreObject | undefined;
	private _values_per_attrib_name: PolyDictionary<NumericAttribValue[]> = {};
	private _filtered_values_per_attrib_name: PolyDictionary<NumericAttribValue | undefined> = {};
	override cook(input_contents: CoreGroup[], params: AttribPromoteSopParams) {
		this._core_group = input_contents[0];

		this._values_per_attrib_name = {};
		this._filtered_values_per_attrib_name = {};

		for (let core_object of this._core_group.coreObjects()) {
			this._core_object = core_object;
			this.find_values(params);
			this.filter_values(params);
			this.set_values(params);
		}

		return this._core_group;
	}
	private find_values(params: AttribPromoteSopParams) {
		const attrib_names = CoreString.attribNames(params.name);
		for (let attrib_name of attrib_names) {
			this._find_values_for_attrib_name(attrib_name, params);
		}
	}
	private _find_values_for_attrib_name(attrib_name: string, params: AttribPromoteSopParams) {
		switch (params.classFrom) {
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
				if (!first_point.isAttribIndexed(attrib_name)) {
					const values: NumericAttribValue[] = new Array(points.length);
					let point: CorePoint;
					for (let i = 0; i < points.length; i++) {
						point = points[i];
						values[i] = point.attribValue(attrib_name) as NumericAttribValue;
					}
					this._values_per_attrib_name[attrib_name] = values;
				}
			}
		}
	}

	private find_values_from_object(attrib_name: string, params: AttribPromoteSopParams) {
		this._values_per_attrib_name[attrib_name] = [];
		if (this._core_object) {
			this._values_per_attrib_name[attrib_name].push(this._core_object.attribValue(attrib_name) as number);
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
				switch (params.classTo) {
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
			const attribute_exists = this._core_group.hasAttrib(attrib_name);
			if (!attribute_exists) {
				const attribSize = CoreAttribute.attribSizeFromValue(new_value);
				if (attribSize) {
					this._core_group.addNumericVertexAttrib(attrib_name, attribSize, new_value);
				}
			}

			const points = this._core_object.points();
			for (let point of points) {
				point.setAttribValue(attrib_name, new_value);
			}
		}
	}

	private set_values_to_object(attrib_name: string, new_value: NumericAttribValue, params: AttribPromoteSopParams) {
		this._core_object?.setAttribValue(attrib_name, new_value);
	}
}
