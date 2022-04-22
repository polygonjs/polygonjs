/**
 * compares 2 input values and generates a boolean value
 *
 * @remarks
 *
 * This node is frequently used with the [actor/TwoWaySwitch](/docs/nodes/actor/TwoWaySwitch)
 *
 */

import {ActorNodeTriggerContext, TypedActorNode} from './_Base';
import {ParamConfig, NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ActorConnectionPointType} from '../utils/io/connections/Actor';
import {CoreType} from '../../../core/Type';
import {Vector2} from 'three';
import {Vector3} from 'three';
import {Vector4} from 'three';
import {TypeAssert} from '../../poly/Assert';

export enum ActorCompareTestName {
	EQUAL = 'Equal',
	LESS_THAN = 'Less Than',
	GREATER_THAN = 'Greater Than',
	LESS_THAN_OR_EQUAL = 'Less Than Or Equal',
	GREATER_THAN_OR_EQUAL = 'Greater Than Or Equal',
	NOT_EQUAL = 'Not Equal',
}
enum ActorCompareTestOperation {
	EQUAL = '==',
	LESS_THAN = '<',
	GREATER_THAN = '>',
	LESS_THAN_OR_EQUAL = '<=',
	GREATER_THAN_OR_EQUAL = '>=',
	NOT_EQUAL = '!=',
}

const TEST_NAMES: ActorCompareTestName[] = [
	ActorCompareTestName.EQUAL,
	ActorCompareTestName.LESS_THAN,
	ActorCompareTestName.GREATER_THAN,
	ActorCompareTestName.LESS_THAN_OR_EQUAL,
	ActorCompareTestName.GREATER_THAN_OR_EQUAL,
	ActorCompareTestName.NOT_EQUAL,
];
const TEST_OPERATIONS_FLOAT: ActorCompareTestOperation[] = [
	ActorCompareTestOperation.EQUAL,
	ActorCompareTestOperation.LESS_THAN,
	ActorCompareTestOperation.GREATER_THAN,
	ActorCompareTestOperation.LESS_THAN_OR_EQUAL,
	ActorCompareTestOperation.GREATER_THAN_OR_EQUAL,
	ActorCompareTestOperation.NOT_EQUAL,
];

const OUTPUT_NAME = 'val';
const EXPECTED_INPUT_NAMES = ['value0', 'value1'];
class CompareActorParamsConfig extends NodeParamsConfig {
	test = ParamConfig.INTEGER(1, {
		menu: {
			entries: TEST_NAMES.map((name, i) => {
				const operator = TEST_OPERATIONS_FLOAT[i];
				const label = `${operator.padEnd(2, ' ')} (${name})`;
				return {name: label, value: i};
			}),
		},
	});
}
const ParamsConfig = new CompareActorParamsConfig();
export class CompareActorNode extends TypedActorNode<CompareActorParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'compare';
	}
	override initializeNode() {
		super.initializeNode();

		this.io.connection_points.spare_params.setInputlessParamNames(['test']);

		this.io.connection_points.initializeNode();
		this.io.connection_points.set_input_name_function(this._expectedInputName.bind(this));
		this.io.connection_points.set_output_name_function((index: number) => OUTPUT_NAME);
		this.io.connection_points.set_expected_input_types_function(this._expectedInputType.bind(this));
		this.io.connection_points.set_expected_output_types_function(() => [ActorConnectionPointType.BOOLEAN]);
	}
	setTestName(test: ActorCompareTestName) {
		this.p.test.set(TEST_NAMES.indexOf(test));
	}
	testName() {
		return TEST_NAMES[this.pv.test];
	}
	operator() {
		return TEST_OPERATIONS_FLOAT[this.pv.test];
	}

	protected _expectedInputName(index: number) {
		return EXPECTED_INPUT_NAMES[index];
	}
	protected _expectedInputType() {
		const type = this.io.connection_points.first_input_connection_type() || ActorConnectionPointType.FLOAT;
		return [type, type];
	}
	public override outputValue(context: ActorNodeTriggerContext) {
		const value0 = this._inputValue(this._expectedInputName(0), context);
		const value1 = this._inputValue(this._expectedInputName(1), context);

		if (value0 == null) {
			return false;
		}
		if (value1 == null) {
			return false;
		}
		const operator = this.operator();

		if (CoreType.isNumber(value0) && CoreType.isNumber(value1)) {
			return this._testOperatorNumber(value0, value1, operator);
		}
		if (CoreType.isString(value0) && CoreType.isString(value1)) {
			return this._testOperatorString(value0, value1, operator);
		}
		if (CoreType.isVector(value0) && CoreType.isVector(value1)) {
			if (value0 instanceof Vector2 && value1 instanceof Vector2) {
				return (
					this._testOperatorNumber(value0.x, value1.x, operator) &&
					this._testOperatorNumber(value0.y, value1.y, operator)
				);
			}
			if (value0 instanceof Vector3 && value1 instanceof Vector3) {
				return (
					this._testOperatorNumber(value0.x, value1.x, operator) &&
					this._testOperatorNumber(value0.y, value1.y, operator) &&
					this._testOperatorNumber(value0.z, value1.z, operator)
				);
			}
			if (value0 instanceof Vector4 && value1 instanceof Vector4) {
				return (
					this._testOperatorNumber(value0.x, value1.x, operator) &&
					this._testOperatorNumber(value0.y, value1.y, operator) &&
					this._testOperatorNumber(value0.z, value1.z, operator) &&
					this._testOperatorNumber(value0.w, value1.w, operator)
				);
			}
		}
		if (CoreType.isColor(value0) && CoreType.isColor(value1)) {
			return (
				this._testOperatorNumber(value0.r, value1.r, operator) &&
				this._testOperatorNumber(value0.g, value1.g, operator) &&
				this._testOperatorNumber(value0.b, value1.b, operator)
			);
		}

		return false;
	}
	private _testOperatorNumber(value0: number, value1: number, operator: ActorCompareTestOperation) {
		switch (operator) {
			case ActorCompareTestOperation.EQUAL: {
				return value0 == value1;
			}
			case ActorCompareTestOperation.LESS_THAN: {
				return value0 < value1;
			}
			case ActorCompareTestOperation.GREATER_THAN: {
				return value0 > value1;
			}
			case ActorCompareTestOperation.LESS_THAN_OR_EQUAL: {
				return value0 <= value1;
			}
			case ActorCompareTestOperation.GREATER_THAN_OR_EQUAL: {
				return value0 >= value1;
			}
			case ActorCompareTestOperation.NOT_EQUAL: {
				return value0 != value1;
			}
		}
		TypeAssert.unreachable(operator);
	}
	private _testOperatorString(value0: string, value1: string, operator: ActorCompareTestOperation) {
		switch (operator) {
			case ActorCompareTestOperation.EQUAL: {
				return value0 == value1;
			}
			case ActorCompareTestOperation.LESS_THAN: {
				return value0 < value1;
			}
			case ActorCompareTestOperation.GREATER_THAN: {
				return value0 > value1;
			}
			case ActorCompareTestOperation.LESS_THAN_OR_EQUAL: {
				return value0 <= value1;
			}
			case ActorCompareTestOperation.GREATER_THAN_OR_EQUAL: {
				return value0 >= value1;
			}
			case ActorCompareTestOperation.NOT_EQUAL: {
				return value0 != value1;
			}
		}
		TypeAssert.unreachable(operator);
	}
}
