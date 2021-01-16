import {TypedGlNode} from './_Base';
import {ThreeToGl} from '../../../../src/core/ThreeToGl';
import {ParamConfig, NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {GlConnectionPointType, GlConnectionPointComponentsCountMap} from '../utils/io/connections/Gl';
// import {GlConnectionsController} from './utils/GLConnectionsController';

export enum GlCompareTestName {
	EQUAL = 'Equal',
	LESS_THAN = 'Less Than',
	GREATER_THAN = 'Greater Than',
	LESS_THAN_OR_EQUAL = 'Less Than Or Equal',
	GREATER_THAN_OR_EQUAL = 'Greater Than Or Equal',
	NOT_EQUAL = 'Not Equal',
}
enum TestOperation {
	EQUAL = '==',
	LESS_THAN = '<',
	GREATER_THAN = '>',
	LESS_THAN_OR_EQUAL = '<=',
	GREATER_THAN_OR_EQUAL = '>=',
	NOT_EQUAL = '!=',
}

const TEST_NAMES: GlCompareTestName[] = [
	GlCompareTestName.EQUAL,
	GlCompareTestName.LESS_THAN,
	GlCompareTestName.GREATER_THAN,
	GlCompareTestName.LESS_THAN_OR_EQUAL,
	GlCompareTestName.GREATER_THAN_OR_EQUAL,
	GlCompareTestName.NOT_EQUAL,
];
const TEST_OPERATIONS_FLOAT: TestOperation[] = [
	TestOperation.EQUAL,
	TestOperation.LESS_THAN,
	TestOperation.GREATER_THAN,
	TestOperation.LESS_THAN_OR_EQUAL,
	TestOperation.GREATER_THAN_OR_EQUAL,
	TestOperation.NOT_EQUAL,
];
const AND_SEPARATOR = ' && ';
// const VECTOR_COMPARISON_METHODS = {
// 	"==": 'equal',
// 	"<":  'lessThan',
// 	">":  'greaterThan',
// 	"<=": 'lessThanEqual',
// 	">=": 'greaterThanEqual',
// 	"!=": 'notEqual'
// }
// const TEST_OPERATIONS_VECTOR = [
// 	"equal",
// 	"lessThan",
// 	"greaterThan",
// 	"lessThanEqual",
// 	"greaterThanEqual",
// 	"notEqual",
// ]

const COMPONENTS = ['x', 'y', 'z', 'w'];
const OUTPUT_NAME = 'val';
class CompareGlParamsConfig extends NodeParamsConfig {
	test = ParamConfig.INTEGER(0, {
		menu: {
			entries: TEST_NAMES.map((name, i) => {
				const operator = TEST_OPERATIONS_FLOAT[i];
				const label = `${operator.padEnd(2, ' ')} (${name})`;
				return {name: label, value: i};
			}),
		},
	});
}
const ParamsConfig = new CompareGlParamsConfig();
export class CompareGlNode extends TypedGlNode<CompareGlParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'compare';
	}
	// public readonly gl_connections_controller: GlConnectionsController = new GlConnectionsController(this);
	initializeNode() {
		super.initializeNode();

		this.io.connection_points.spare_params.set_inputless_param_names(['test']);

		this.io.connection_points.initializeNode();
		this.io.connection_points.set_input_name_function(this._gl_input_name.bind(this));
		this.io.connection_points.set_output_name_function((index: number) => OUTPUT_NAME);
		this.io.connection_points.set_expected_input_types_function(this._expected_input_type.bind(this));
		this.io.connection_points.set_expected_output_types_function(() => [GlConnectionPointType.BOOL]);
	}
	set_test_name(test: GlCompareTestName) {
		this.p.test.set(TEST_NAMES.indexOf(test));
	}

	protected _gl_input_name(index: number) {
		return ['value0', 'value1'][index];
	}
	protected _expected_input_type() {
		const type = this.io.connection_points.first_input_connection_type() || GlConnectionPointType.FLOAT;
		return [type, type];
	}

	set_lines(shaders_collection_controller: ShadersCollectionController) {
		const body_lines: string[] = [];

		const value = this.gl_var_name(OUTPUT_NAME);
		const operator = TEST_OPERATIONS_FLOAT[this.pv.test];
		const value0 = ThreeToGl.any(this.variable_for_input(this._gl_input_name(0)));
		const value1 = ThreeToGl.any(this.variable_for_input(this._gl_input_name(1)));

		const first_connection = this.io.inputs.named_input_connection_points[0];
		let components_count = 1;
		if (first_connection) {
			components_count = GlConnectionPointComponentsCountMap[first_connection.type()] || 1;
		}

		if (components_count > 1) {
			// if comparing with distance, but not sure about that
			// body_lines.push(`bool ${value} = (distance(${value0}) ${operator} distance(${value1})`)
			// instead, comparing components one by one
			let tmp_values: string[] = [];
			for (let i = 0; i < components_count; i++) {
				const tmp_value = this.gl_var_name(`tmp_value_${i}`);
				const component = COMPONENTS[i];
				tmp_values.push(tmp_value);
				body_lines.push(`bool ${tmp_value} = (${value0}.${component} ${operator} ${value1}.${component})`);
			}
			body_lines.push(`bool ${value} = (${tmp_values.join(AND_SEPARATOR)})`);
		} else {
			body_lines.push(`bool ${value} = (${value0} ${operator} ${value1})`);
		}

		shaders_collection_controller.add_body_lines(this, body_lines);
	}
}
