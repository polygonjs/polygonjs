/**
 * compares 2 input values and generates a boolean value
 *
 * @remarks
 *
 * This node is frequently used with the [js/TwoWaySwitch](/docs/nodes/js/TwoWaySwitch)
 *
 */

import {TypedJsNode} from './_Base';
import {ParamConfig, NodeParamsConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPointType, JsConnectionPointTypeFromArrayTypeMap} from '../utils/io/connections/Js';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {createVariable} from './code/assemblers/_BaseJsPersistedConfigUtils';
import {componentsForType} from '../../functions/_VectorUtils';

const ALLOWED_TYPES = [
	JsConnectionPointType.BOOLEAN,
	JsConnectionPointType.INT,
	JsConnectionPointType.COLOR,
	JsConnectionPointType.FLOAT,
	JsConnectionPointType.STRING,
	JsConnectionPointType.VECTOR2,
	JsConnectionPointType.VECTOR3,
	JsConnectionPointType.VECTOR4,
];

export enum JsCompareTestName {
	EQUAL = 'Equal',
	LESS_THAN = 'Less Than',
	GREATER_THAN = 'Greater Than',
	LESS_THAN_OR_EQUAL = 'Less Than Or Equal',
	GREATER_THAN_OR_EQUAL = 'Greater Than Or Equal',
	NOT_EQUAL = 'Not Equal',
}
enum JsCompareTestOperation {
	EQUAL = '==',
	LESS_THAN = '<',
	GREATER_THAN = '>',
	LESS_THAN_OR_EQUAL = '<=',
	GREATER_THAN_OR_EQUAL = '>=',
	NOT_EQUAL = '!=',
}

const TEST_NAMES: JsCompareTestName[] = [
	JsCompareTestName.EQUAL,
	JsCompareTestName.LESS_THAN,
	JsCompareTestName.GREATER_THAN,
	JsCompareTestName.LESS_THAN_OR_EQUAL,
	JsCompareTestName.GREATER_THAN_OR_EQUAL,
	JsCompareTestName.NOT_EQUAL,
];
const TEST_OPERATIONS_FLOAT: JsCompareTestOperation[] = [
	JsCompareTestOperation.EQUAL,
	JsCompareTestOperation.LESS_THAN,
	JsCompareTestOperation.GREATER_THAN,
	JsCompareTestOperation.LESS_THAN_OR_EQUAL,
	JsCompareTestOperation.GREATER_THAN_OR_EQUAL,
	JsCompareTestOperation.NOT_EQUAL,
];
function singleElementComparison(value0: string, value1: string, operation: JsCompareTestOperation) {
	return `${value0} ${operation} ${value1}`;
}

const OUTPUT_NAME = 'val';
enum CompareInputName {
	VALUE0 = 'value0',
	VALUE1 = 'value1',
}
// const EXPECTED_INPUT_NAMES = ['value0', 'value1'];
class CompareJsParamsConfig extends NodeParamsConfig {
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
const ParamsConfig = new CompareJsParamsConfig();
export class CompareJsNode extends TypedJsNode<CompareJsParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'compare';
	}
	override initializeNode() {
		super.initializeNode();

		this.io.connection_points.spare_params.setInputlessParamNames(['test']);

		this.io.connection_points.initializeNode();
		this.io.connection_points.set_input_name_function(this._expectedInputName.bind(this));
		this.io.connection_points.set_output_name_function(this._expectedOutputName.bind(this));
		this.io.connection_points.set_expected_input_types_function(this._expectedInputTypes.bind(this));
		this.io.connection_points.set_expected_output_types_function(this._expectedOutputTypes.bind(this));
	}
	setTestName(test: JsCompareTestName) {
		this.p.test.set(TEST_NAMES.indexOf(test));
	}
	testName() {
		return TEST_NAMES[this.pv.test];
	}
	operator() {
		return TEST_OPERATIONS_FLOAT[this.pv.test];
	}

	protected _expectedInputName(index: number) {
		return [CompareInputName.VALUE0, CompareInputName.VALUE1][index];
	}
	protected _expectedInputTypes() {
		let first_input_type = this.io.connection_points.first_input_connection_type();
		const connectionPoints = this.io.inputs.namedInputConnectionPoints();
		if (first_input_type && connectionPoints) {
			if (!ALLOWED_TYPES.includes(first_input_type)) {
				// if the first input type is not allowed, either leave the connection point as is,
				// or use the default if there is none
				const first_connection = connectionPoints[0];
				if (first_connection) {
					first_input_type = first_connection.type();
				}
			}
		}
		const type = first_input_type || JsConnectionPointType.FLOAT;
		const boundType = JsConnectionPointTypeFromArrayTypeMap[type];
		return [type, boundType];
	}
	private _expectedOutputTypes() {
		return [JsConnectionPointType.BOOLEAN];
	}
	private _expectedOutputName(index: number) {
		return OUTPUT_NAME;
	}

	override setLines(shadersCollectionController: JsLinesCollectionController) {
		const varName = this.jsVarName(this._expectedOutputName(0));

		const inputType = this._expectedInputTypes()[0];
		const variable = createVariable(inputType);
		if (variable) {
			shadersCollectionController.addVariable(this, variable);
		}

		const operation = this.operator();
		const value0 = this.variableForInput(shadersCollectionController, CompareInputName.VALUE0);
		const value1 = this.variableForInput(shadersCollectionController, CompareInputName.VALUE1);

		const components = componentsForType(inputType);
		const mainFunction =
			components != null && components.length > 0
				? components
						.map((c) => singleElementComparison(`${value0}.${c}`, `${value1}.${c}`, operation))
						.join(' && ')
				: singleElementComparison(value0, value1, operation);

		shadersCollectionController.addBodyOrComputed(this, [{dataType: inputType, varName, value: mainFunction}]);
	}
}
