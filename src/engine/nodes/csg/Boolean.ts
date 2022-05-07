/**
 * Boolean Intersect Operation
 *
 *
 */
import {TypedCsgNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CsgCoreGroup} from '../../../core/geometry/csg/CsgCoreGroup';
import jscad from '@jscad/modeling';
import {CsgObject} from '../../../core/geometry/csg/CsgCoreObject';
import {csgApplyTransform} from '../../../core/geometry/csg/math/CsgMat4';
const {intersect, union, subtract} = jscad.booleans;

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

class BooleanCsgParamsConfig extends NodeParamsConfig {
	/** @param operation */
	operation = ParamConfig.INTEGER(BOOLEAN_CSG_OPERATION_TYPES.indexOf(BooleanCsgOperationType.INTERSECT), {
		menu: {entries: BOOLEAN_CSG_OPERATION_TYPES.map((name, value) => ({name, value}))},
	});
}
const ParamsConfig = new BooleanCsgParamsConfig();

export class BooleanCsgNode extends TypedCsgNode<BooleanCsgParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'boolean';
	}
	protected override initializeNode() {
		this.io.inputs.setCount(2);
	}

	override cook(inputCoreGroups: CsgCoreGroup[]) {
		const objects0 = inputCoreGroups[0].objects();
		const objects1 = inputCoreGroups[1].objects();

		const count = Math.min(objects0.length, objects1.length);

		const objects: CsgObject[] = [];
		for (let i = 0; i < count; i++) {
			const object0 = objects0[i];
			const object1 = objects1[i];

			const result = this._applyOperation(object0, object1);
			if (result) {
				objects.push(result);
			}
		}
		this.setCsgCoreObjects(objects);
	}
	private _applyOperation(object0: CsgObject, object1: CsgObject) {
		const method = this._method();
		// - the transforms are applied for:
		// - for geom2, as otherwise the matrix is not taken into account
		// - for geom3, as otherwise the color seems to not be propagated in boolean operations (pending PR)
		csgApplyTransform(object0);
		csgApplyTransform(object1);

		const bothAreGeom3 = jscad.geometries.geom3.isA(object0) && jscad.geometries.geom3.isA(object1);
		if (bothAreGeom3) {
			return method(object0, object1);
		}
		const bothAreGeom2 = jscad.geometries.geom2.isA(object0) && jscad.geometries.geom2.isA(object1);
		if (bothAreGeom2) {
			const result = method(object0, object1);
			return result;
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
