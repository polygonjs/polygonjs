/**
 * Boolean Intersect Operation
 *
 *
 */
import {CSGSopNode} from './_BaseCSG';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CoreGroup} from '../../../core/geometry/Group';
import {CsgGeometryType, CsgGeometry} from '../../../core/geometry/csg/CsgCommon';
import {csgIsGeom2, csgIsGeom3} from '../../../core/geometry/csg/CsgCoreType';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {csgApplyTransform} from '../../../core/geometry/csg/math/CsgMat4';
import {booleans} from '@jscad/modeling';
import {CsgObject} from '../../../core/geometry/csg/CsgObject';
const {intersect, union, subtract} = booleans;

export enum BooleanCsgOperationType {
	INTERSECT = 'intersect',
	SUBTRACT = 'subtract',
	UNION = 'union',
}
export const BOOLEAN_CSG_OPERATION_TYPES: BooleanCsgOperationType[] = [
	BooleanCsgOperationType.INTERSECT,
	BooleanCsgOperationType.SUBTRACT,
	BooleanCsgOperationType.UNION,
];

class CSGBooleanSopParamsConfig extends NodeParamsConfig {
	/** @param operation */
	operation = ParamConfig.INTEGER(BOOLEAN_CSG_OPERATION_TYPES.indexOf(BooleanCsgOperationType.INTERSECT), {
		menu: {entries: BOOLEAN_CSG_OPERATION_TYPES.map((name, value) => ({name, value}))},
	});
}
const ParamsConfig = new CSGBooleanSopParamsConfig();

export class CSGBooleanSopNode extends CSGSopNode<CSGBooleanSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.CSG_BOOLEAN;
	}
	protected override initializeNode() {
		this.io.inputs.setCount(2);
	}
	setOperation(operation: BooleanCsgOperationType) {
		this.p.operation.set(BOOLEAN_CSG_OPERATION_TYPES.indexOf(operation));
	}

	override cook(inputCoreGroups: CoreGroup[]) {
		const objects: CsgObject<CsgGeometryType>[] = [];

		const objects0 = inputCoreGroups[0].csgObjects();
		const objects1 = inputCoreGroups[1].csgObjects();
		if (objects0 && objects1) {
			const count = Math.min(objects0.length, objects1.length);

			for (let i = 0; i < count; i++) {
				const object0 = objects0[i];
				const object1 = objects1[i];

				const result = this._applyOperation(object0.csgGeometry(), object1.csgGeometry());
				if (result) {
					objects.push(new CsgObject(result));
				}
			}
		}
		this.setCSGObjects(objects);
	}
	private _applyOperation(object0: CsgGeometry, object1: CsgGeometry) {
		const method = this._method();

		const bothAreGeom3 = csgIsGeom3(object0) && csgIsGeom3(object1);
		if (bothAreGeom3) {
			return method(object0, object1);
		}
		const bothAreGeom2 = csgIsGeom2(object0) && csgIsGeom2(object1);
		if (bothAreGeom2) {
			// the transforms are applied for geom2, as otherwise the matrix is not taken into account
			csgApplyTransform(object0);
			csgApplyTransform(object1);
			return method(object0, object1);
		}
	}
	private _method() {
		const operation = BOOLEAN_CSG_OPERATION_TYPES[this.pv.operation];
		switch (operation) {
			case BooleanCsgOperationType.INTERSECT:
				return intersect;
			case BooleanCsgOperationType.SUBTRACT:
				return subtract;
			case BooleanCsgOperationType.UNION:
				return union;
		}
	}
}
