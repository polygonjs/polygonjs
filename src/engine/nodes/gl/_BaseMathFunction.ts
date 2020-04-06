import lodash_range from 'lodash/range';
import lodash_compact from 'lodash/compact';
import {BaseAdaptiveGlNode} from './_BaseAdaptive';
import {ThreeToGl} from '../../../core/ThreeToGl';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {ConnectionPointType} from '../utils/connections/ConnectionPointType';
import {GLDefinitionType, TypedGLDefinition} from './utils/GLDefinition';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';

export class BaseGlMathFunctionParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new BaseGlMathFunctionParamsConfig();
export abstract class BaseGlMathFunctionGlNode extends BaseAdaptiveGlNode<BaseGlMathFunctionParamsConfig> {
	params_config = ParamsConfig;
	protected gl_method_name() {
		return ''; // leave blank to allow nodes such as mult, add, substract to work
	}
	protected gl_function_definitions(): TypedGLDefinition<GLDefinitionType>[] {
		return [];
	}

	initialize_node() {
		super.initialize_node();
		this.gl_connections_controller.set_expected_input_types_function(this._expected_input_types.bind(this));
		this.gl_connections_controller.set_expected_output_types_function(this._expected_output_types.bind(this));
		this.gl_connections_controller.set_input_name_function(this._gl_input_name.bind(this));
	}
	protected _expected_input_types(): ConnectionPointType[] {
		const type: ConnectionPointType =
			this.gl_connections_controller.first_input_connection_type() || ConnectionPointType.FLOAT;
		if (this.io.connections.first_input_connection()) {
			let count = Math.max(lodash_compact(this.io.connections.input_connections()).length + 1, 2);
			return lodash_range(count).map((i) => type);
		} else {
			return lodash_range(2).map((i) => type);
		}
	}
	protected _expected_output_types() {
		const type = this._expected_input_types()[0];
		return [type];
	}
	protected _gl_input_name(index: number) {
		return 'in';
	}

	set_lines(shaders_collection_controller: ShadersCollectionController) {
		const var_type: ConnectionPointType = this.io.outputs.named_output_connection_points[0].type;
		const args = this.io.inputs.named_input_connection_points.map((connection, i) => {
			const name = connection.name;
			return ThreeToGl.any(this.variable_for_input(name));
		});
		const joined_args = args.join(', ');

		const sum = this.gl_var_name(this.gl_connections_controller.output_name(0));
		const body_line = `${var_type} ${sum} = ${this.gl_method_name()}(${joined_args})`;
		shaders_collection_controller.add_body_lines(this, [body_line]);
		shaders_collection_controller.add_definitions(this, this.gl_function_definitions());
	}
}

//
//
// 1 argument
//
//
export abstract class BaseNodeGlMathFunctionArg1GlNode extends BaseGlMathFunctionGlNode {
	protected _gl_input_name(index: number) {
		return 'in';
	}
	protected _expected_input_types() {
		const type = this.gl_connections_controller.first_input_connection_type() || ConnectionPointType.FLOAT;
		return [type];
	}
}

//
//
// 2 arguments
//
//
export abstract class BaseNodeGlMathFunctionArg2GlNode extends BaseGlMathFunctionGlNode {
	protected _expected_input_types() {
		const type = this.gl_connections_controller.first_input_connection_type() || ConnectionPointType.FLOAT;
		return [type, type];
	}
}

//
//
// 3 arguments
//
//
export abstract class BaseNodeGlMathFunctionArg3GlNode extends BaseGlMathFunctionGlNode {
	protected _expected_input_types() {
		const type = this.gl_connections_controller.first_input_connection_type() || ConnectionPointType.FLOAT;
		return [type, type, type];
	}
}
//
//
// 4 arguments
//
//
export abstract class BaseNodeGlMathFunctionArg4GlNode extends BaseGlMathFunctionGlNode {
	protected _expected_input_types() {
		const type = this.gl_connections_controller.first_input_connection_type() || ConnectionPointType.FLOAT;
		return [type, type, type, type];
	}
}
//
//
// 5 arguments
//
//
export abstract class BaseNodeGlMathFunctionArg5GlNode extends BaseGlMathFunctionGlNode {
	protected _expected_input_types() {
		const type = this.gl_connections_controller.first_input_connection_type() || ConnectionPointType.FLOAT;
		return [type, type, type, type, type];
	}
}
