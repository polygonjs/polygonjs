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
import {CoreGroup} from '../../../core/geometry/Group';
import {Object3D} from 'three';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ThreejsCoreObject} from '../../../core/geometry/modules/three/ThreejsCoreObject';
import {BaseCorePoint, CorePoint} from '../../../core/geometry/entities/point/CorePoint';
import {MapUtils} from '../../../core/MapUtils';
import {geometryBuilder} from '../../../core/geometry/modules/three/builders/geometryBuilder';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {pointsFromObject} from '../../../core/geometry/entities/point/CorePointUtils';
import { CoreObjectType } from '../../../core/geometry/ObjectContent';

const _points:CorePoint<CoreObjectType>[]=[]
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
		return SopType.SPLIT;
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
	}

	private _new_objects: Object3D[] = [];
	override cook(input_contents: CoreGroup[]) {
		const core_group = input_contents[0];

		this._new_objects = [];
		if (this.pv.attribName != '') {
			this._split_core_group(core_group);
		}

		this.setObjects(this._new_objects);
	}

	_split_core_group(core_group: CoreGroup) {
		const core_objects = core_group.threejsCoreObjects();
		for (let core_object of core_objects) {
			this._split_core_object(core_object);
		}
	}

	private _split_core_object(coreObject: ThreejsCoreObject) {
		const object = coreObject.object();
		let attribName: string = this.pv.attribName;
		let points_by_value: Map<string | number, BaseCorePoint[]> = new Map();
		// if (core_geometry) {
		// const object = core_object.object() as Object3DWithGeometry;
		pointsFromObject(object,_points);
		const firstPoint = _points[0];
		if (firstPoint) {
			const attrib_size = firstPoint.attribSize(attribName);
			if (!(attrib_size == AttribSize.FLOAT || firstPoint.isAttribIndexed(attribName))) {
				this.states.error.set(`attrib '${attribName}' must be a float or a string`);
				return;
			}
			let val: string | number | null;
			if (firstPoint.isAttribIndexed(attribName)) {
				for (const point of _points) {
					val = point.indexedAttribValue(attribName);
					MapUtils.pushOnArrayAtEntry(points_by_value, val, point);
				}
			} else {
				for (const point of _points) {
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
					const new_geometry = builder.fromPoints(object, points);
					if (new_geometry) {
						const object = this.createObject(new_geometry, objectType);
						ThreejsCoreObject.addAttribute(object, attribName, value);
						this._new_objects.push(object);
					}
				}
			});
		}
		// }
	}
}
