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
import {CoreObjectType} from '../../../core/geometry/ObjectContent';

const _points: CorePoint<CoreObjectType>[] = [];
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

	private _newObjects: Object3D[] = [];
	override cook(input_contents: CoreGroup[]) {
		const core_group = input_contents[0];

		this._newObjects.length = 0;
		if (this.pv.attribName != '') {
			this._split_core_group(core_group);
		}

		this.setObjects(this._newObjects);
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
		const pointsByValue: Map<string | number, BaseCorePoint[]> = new Map();
		// if (core_geometry) {
		// const object = core_object.object() as Object3DWithGeometry;
		pointsFromObject(object, _points);
		const firstPoint = _points[0];
		if (firstPoint) {
			const attribSize = firstPoint.attribSize(attribName);
			if (!(attribSize == AttribSize.FLOAT || firstPoint.isAttribIndexed(attribName))) {
				this.states.error.set(`attrib '${attribName}' must be a float or a string`);
				return;
			}
			let val: string | number | null;
			if (firstPoint.isAttribIndexed(attribName)) {
				for (const point of _points) {
					val = point.indexedAttribValue(attribName);
					MapUtils.pushOnArrayAtEntry(pointsByValue, val, point);
				}
			} else {
				for (const point of _points) {
					val = point.attribValue(attribName) as number;
					MapUtils.pushOnArrayAtEntry(pointsByValue, val, point);
				}
			}
		}

		const objectType = objectTypeFromConstructor(object.constructor);
		if (objectType) {
			pointsByValue.forEach((points, value) => {
				const builder = geometryBuilder(objectType);
				if (builder) {
					const newGeometry = builder.fromPoints(object, points);
					if (newGeometry) {
						const object = this.createObject(newGeometry, objectType);
						if (object) {
							ThreejsCoreObject.addAttribute(object, attribName, value);
							this._newObjects.push(object);
						}
					}
				}
			});
		}
		// }
	}
}
