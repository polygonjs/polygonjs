/**
 * Splits a geometry into multiple objects
 *
 * @remarks
 * This is useful to isolate parts of a geometry that matches a specific attribute.
 *
 */

import {TypedSopNode} from './_Base';
import {
	AttribSize,
	ATTRIBUTE_TYPES,
	AttribType,
	AttribTypeMenuEntries,
	objectTypeFromConstructor,
} from '../../../core/geometry/Constant';
import {CoreGroup, Object3DWithGeometry} from '../../../core/geometry/Group';

import {Object3D} from 'three/src/core/Object3D';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CoreObject} from '../../../core/geometry/Object';
import {CorePoint} from '../../../core/geometry/Point';
import {CoreGeometry} from '../../../core/geometry/Geometry';
import {MapUtils} from '../../../core/MapUtils';
class DeleteSopParamsConfig extends NodeParamsConfig {
	/** @param type of attribute to use */
	attrib_type = ParamConfig.INTEGER(ATTRIBUTE_TYPES.indexOf(AttribType.NUMERIC), {
		menu: {
			entries: AttribTypeMenuEntries,
		},
	});
	/** @param name of the attribute */
	attrib_name = ParamConfig.STRING('');
}
const ParamsConfig = new DeleteSopParamsConfig();

export class SplitSopNode extends TypedSopNode<DeleteSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'split';
	}

	static displayed_input_names(): string[] {
		return ['geometry to split in multiple objects'];
	}

	initialize_node() {
		this.io.inputs.set_count(1);
	}

	private _new_objects: Object3D[] = [];
	async cook(input_contents: CoreGroup[]) {
		const core_group = input_contents[0];

		this._new_objects = [];
		if (this.pv.attrib_name != '') {
			this._split_core_group(core_group);
		}

		this.setObjects(this._new_objects);
	}

	async _split_core_group(core_group: CoreGroup) {
		const core_objects = core_group.coreObjects();
		for (let core_object of core_objects) {
			this._split_core_object(core_object);
		}
	}

	private _split_core_object(core_object: CoreObject) {
		let core_geometry = core_object.coreGeometry();
		let attrib_name: string = this.pv.attrib_name;
		let points_by_value: Map<string | number, CorePoint[]> = new Map();
		if (core_geometry) {
			const object = core_object.object() as Object3DWithGeometry;
			const points = core_geometry.pointsFromGeometry();
			const first_point = points[0];
			if (first_point) {
				const attrib_size = first_point.attribSize(attrib_name);
				if (!(attrib_size == AttribSize.FLOAT || first_point.isAttribIndexed(attrib_name))) {
					this.states.error.set(`attrib '${attrib_name}' must be a float or a string`);
					return;
				}
				let val: string | number;
				if (first_point.isAttribIndexed(attrib_name)) {
					for (let point of points) {
						val = point.indexedAttribValue(attrib_name);
						MapUtils.push_on_array_at_entry(points_by_value, val, point);
					}
				} else {
					for (let point of points) {
						val = point.attribValue(attrib_name) as number;
						MapUtils.push_on_array_at_entry(points_by_value, val, point);
					}
				}
			}

			const object_type = objectTypeFromConstructor(object.constructor);
			points_by_value.forEach((points, value) => {
				const new_geometry = CoreGeometry.geometryFromPoints(points, object_type);
				if (new_geometry) {
					const object = this.create_object(new_geometry, object_type);
					CoreObject.addAttribute(object, attrib_name, value);
					this._new_objects.push(object);
				}
			});
		}
	}
}
