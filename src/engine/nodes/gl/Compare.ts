import lodash_times from 'lodash/times';
import lodash_padEnd from 'lodash/padEnd';
import {TypedGlNode} from './_Base';
import {ThreeToGl} from '../../../../src/core/ThreeToGl';
import {ParamConfig, NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {ConnectionPointComponentsCountMap, ConnectionPointType} from '../utils/connections/ConnectionPointType';
import {GlConnectionsController} from './utils/ConnectionsController';

const TEST_NAMES = ['Equal', 'Less Than', 'Greater Than', 'Less Than Or Equal', 'Greater Than Or Equal', 'Not Equal'];
const TEST_OPERATIONS_FLOAT = ['==', '<', '>', '<=', '>=', '!='];
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

class CompareGlParamsConfig extends NodeParamsConfig {
	test = ParamConfig.INTEGER(0, {
		menu: {
			entries: TEST_NAMES.map((name, i) => {
				const operator = TEST_OPERATIONS_FLOAT[i];
				name = `${lodash_padEnd(operator, 2, ' ')} (${name})`;
				return {name: name, value: i};
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
	protected gl_connections_controller: GlConnectionsController = new GlConnectionsController(this);
	initialize_node() {
		super.initialize_node();

		this.gl_connections_controller.set_input_name_function(this._gl_input_name.bind(this));
		this.gl_connections_controller.set_output_name_function((index: number) => 'val');
		this.gl_connections_controller.set_expected_input_types_function(this._expected_input_type.bind(this));
		this.gl_connections_controller.set_expected_output_types_function(() => [ConnectionPointType.BOOL]);
	}
	protected _gl_input_name(index: number) {
		return ['value0', 'value1'][index];
	}
	protected _expected_input_type() {
		const constructor = this.gl_connections_controller.first_input_connection_type() || ConnectionPointType.FLOAT;
		return [constructor, constructor];
	}

	set_lines(shaders_collection_controller: ShadersCollectionController) {
		const body_lines: string[] = [];

		const value = this.gl_var_name('value');
		const operator = TEST_OPERATIONS_FLOAT[this.pv.test];
		const value0 = ThreeToGl.any(this.variable_for_input(this._gl_input_name(0)));
		const value1 = ThreeToGl.any(this.variable_for_input(this._gl_input_name(1)));

		const first_connection = this.io.inputs.named_input_connection_points[0];
		let components_count = 1;
		if (first_connection) {
			components_count = ConnectionPointComponentsCountMap[first_connection.type] || 1;
		}

		if (components_count > 1) {
			// if comparing with distance, but not sure about that
			// body_lines.push(`bool ${value} = (distance(${value0}) ${operator} distance(${value1})`)
			// instead, comparing components one by one
			let tmp_values: string[] = [];
			lodash_times(components_count, (i) => {
				const tmp_value = this.gl_var_name(`tmp_value_${i}`);
				const component = COMPONENTS[i];
				tmp_values.push(tmp_value);
				body_lines.push(`bool ${tmp_value} = (${value0}.${component} ${operator} ${value1}.${component})`);
			});
			body_lines.push(`bool ${value} = (${tmp_values.join(AND_SEPARATOR)})`);
		} else {
			body_lines.push(`bool ${value} = (${value0} ${operator} ${value1})`);
		}

		shaders_collection_controller.add_body_lines(this, body_lines);
	}
}
