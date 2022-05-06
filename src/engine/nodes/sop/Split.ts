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

import {Object3D} from 'three';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CoreObject} from '../../../core/geometry/Object';
import {CorePoint} from '../../../core/geometry/Point';
import {MapUtils} from '../../../core/MapUtils';
import {geometryBuilder} from '../../../core/geometry/builders/geometryBuilder';
class SplitSopParamsConfig extends NodeParamsConfig {
	/** @param type of attribute to use */
	attribType = ParamConfig.INTEGER(ATTRIBUTE_TYPES.indexOf(AttribType.NUMERIC), {
		menu: {
			entries: AttribTypeMenuEntries,
		},
	});
	/** @param name of the attribute */
	attribName = ParamConfig.STRING('');
}
const ParamsConfig = new SplitSopParamsConfig();

export class SplitSopNode extends TypedSopNode<SplitSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'split';
	}

	static override displayedInputNames(): string[] {
		return ['geometry to split in multiple objects'];
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
	}

	private _new_objects: Object3D[] = [];
	override async cook(input_contents: CoreGroup[]) {
		const core_group = input_contents[0];

		this._new_objects = [];
		if (this.pv.attribName != '') {
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
		let attribName: string = this.pv.attribName;
		let points_by_value: Map<string | number, CorePoint[]> = new Map();
		if (core_geometry) {
			const object = core_object.object() as Object3DWithGeometry;
			const points = core_geometry.pointsFromGeometry();
			const first_point = points[0];
			if (first_point) {
				const attrib_size = first_point.attribSize(attribName);
				if (!(attrib_size == AttribSize.FLOAT || first_point.isAttribIndexed(attribName))) {
					this.states.error.set(`attrib '${attribName}' must be a float or a string`);
					return;
				}
				let val: string | number;
				if (first_point.isAttribIndexed(attribName)) {
					for (let point of points) {
						val = point.indexedAttribValue(attribName);
						MapUtils.pushOnArrayAtEntry(points_by_value, val, point);
					}
				} else {
					for (let point of points) {
						val = point.attribValue(attribName) as number;
						MapUtils.pushOnArrayAtEntry(points_by_value, val, point);
					}
				}
			}

			const objectType = objectTypeFromConstructor(object.constructor);
			if (objectType) {
				points_by_value.forEach((points, value) => {
					const builder = geometryBuilder(objectType);
					if (builder) {
						const new_geometry = builder.from_points(points);
						if (new_geometry) {
							const object = this.createObject(new_geometry, objectType);
							CoreObject.addAttribute(object, attribName, value);
							this._new_objects.push(object);
						}
					}
				});
			}
		}
	}
}
