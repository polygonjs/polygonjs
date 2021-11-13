import {DeleteSopNode} from '../../Delete';
import {ATTRIBUTE_TYPES, AttribType, AttribSize, ATTRIBUTE_SIZES} from '../../../../../core/geometry/Constant';
import {TypeAssert} from '../../../../poly/Assert';
import {Vector2} from 'three/src/math/Vector2';
import {Vector3} from 'three/src/math/Vector3';
import {Vector4} from 'three/src/math/Vector4';
import {CoreEntity} from '../../../../../core/geometry/Entity';
import {ensureString} from '../../../../../core/Type';

export enum ComparisonOperator {
	EQUAL = '==',
	LESS_THAN = '<',
	EQUAL_OR_LESS_THAN = '<=',
	EQUAL_OR_GREATER_THAN = '>=',
	GREATER_THAN = '>',
	DIFFERENT = '!=',
}
export const COMPARISON_OPERATORS: Array<ComparisonOperator> = [
	ComparisonOperator.EQUAL,
	ComparisonOperator.LESS_THAN,
	ComparisonOperator.EQUAL_OR_LESS_THAN,
	ComparisonOperator.EQUAL_OR_GREATER_THAN,
	ComparisonOperator.GREATER_THAN,
	ComparisonOperator.DIFFERENT,
];

type CompareMethodFloat = {[key in ComparisonOperator]: (n1: number, n2: number) => boolean};
const COMPARE_METHOD_FLOAT: CompareMethodFloat = {
	[ComparisonOperator.EQUAL]: (n1: number, n2: number) => {
		return n1 == n2;
	},
	[ComparisonOperator.LESS_THAN]: (n1: number, n2: number) => {
		return n1 < n2;
	},
	[ComparisonOperator.EQUAL_OR_LESS_THAN]: (n1: number, n2: number) => {
		return n1 <= n2;
	},
	[ComparisonOperator.EQUAL_OR_GREATER_THAN]: (n1: number, n2: number) => {
		return n1 >= n2;
	},
	[ComparisonOperator.GREATER_THAN]: (n1: number, n2: number) => {
		return n1 > n2;
	},
	[ComparisonOperator.DIFFERENT]: (n1: number, n2: number) => {
		return n1 != n2;
	},
};

export const ComparisonOperatorMenuEntries = COMPARISON_OPERATORS.map((name, value) => {
	return {name, value};
});

export class ByAttributeHelper {
	constructor(private node: DeleteSopNode) {}

	evalForEntities(entities: CoreEntity[]) {
		const attribType = ATTRIBUTE_TYPES[this.node.pv.attribType];
		switch (attribType) {
			case AttribType.NUMERIC: {
				this._eval_for_numeric(entities);
				return;
			}
			case AttribType.STRING: {
				this._eval_for_string(entities);
				return;
			}
		}
		TypeAssert.unreachable(attribType);
	}
	private _eval_for_string(entities: CoreEntity[]) {
		let value: string | undefined;
		for (let entity of entities) {
			value = entity.stringAttribValue(this.node.pv.attribName);
			if (value == ensureString(this.node.pv.attribString)) {
				this.node.entitySelectionHelper.select(entity);
			}
		}
	}
	private _eval_for_numeric(entities: CoreEntity[]) {
		const attribSize: AttribSize = ATTRIBUTE_SIZES[this.node.pv.attribSize - 1];
		switch (attribSize) {
			case AttribSize.FLOAT: {
				return this._eval_for_points_numeric_float(entities);
			}
			case AttribSize.VECTOR2: {
				return this._eval_for_points_numeric_vector2(entities);
			}
			case AttribSize.VECTOR3: {
				return this._eval_for_points_numeric_vector3(entities);
			}
			case AttribSize.VECTOR4: {
				return this._eval_for_points_numeric_vector4(entities);
			}
		}
		TypeAssert.unreachable(attribSize);
	}

	private _eval_for_points_numeric_float(entities: CoreEntity[]) {
		let attribName: string = this.node.pv.attribName;
		const compared_value = this.node.pv.attribValue1;
		let value: number;
		const comparison_operator: ComparisonOperator = COMPARISON_OPERATORS[this.node.pv.attribComparisonOperator];
		const compare_method = COMPARE_METHOD_FLOAT[comparison_operator];
		for (let entity of entities) {
			value = entity.attribValue(attribName) as number;
			if (compare_method(value, compared_value)) {
				this.node.entitySelectionHelper.select(entity);
			}
		}
	}
	private _eval_for_points_numeric_vector2(entities: CoreEntity[]) {
		let attribName = this.node.pv.attribName;
		const compared_value = this.node.pv.attribValue2;
		let target = new Vector2();
		for (let entity of entities) {
			const value = entity.attribValue(attribName, target) as Vector2;
			if (compared_value.equals(value)) {
				this.node.entitySelectionHelper.select(entity);
			}
		}
	}
	private _eval_for_points_numeric_vector3(entities: CoreEntity[]) {
		let attribName = this.node.pv.attribName;
		const compared_value = this.node.pv.attribValue3;
		let target = new Vector3();
		for (let entity of entities) {
			const value = entity.attribValue(attribName, target) as Vector3;
			if (compared_value.equals(value)) {
				this.node.entitySelectionHelper.select(entity);
			}
		}
	}
	private _eval_for_points_numeric_vector4(entities: CoreEntity[]) {
		let attribName = this.node.pv.attribName;
		const compared_value = this.node.pv.attribValue4;
		let target = new Vector4();
		for (let entity of entities) {
			const value = entity.attribValue(attribName, target) as Vector4;
			if (compared_value.equals(value)) {
				this.node.entitySelectionHelper.select(entity);
			}
		}
	}
}
