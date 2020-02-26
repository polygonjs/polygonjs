import lodash_range from 'lodash/range';
import lodash_compact from 'lodash/compact';
import {BaseGlNumericGlNode} from './_BaseNumeric';
import {ThreeToGl} from '../../../core/ThreeToGl';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {ConnectionPointType} from '../utils/connections/ConnectionPointType';
import {GLDefinitionType, TypedGLDefinition} from './utils/GLDefinition';

export abstract class BaseGlMathFunctionGlNode extends BaseGlNumericGlNode {
	protected gl_method_name() {
		return '';
	}
	protected gl_function_definitions(): TypedGLDefinition<GLDefinitionType>[] {
		return [];
	}
	gl_input_name(index: number) {
		return `val${index}`;
	}
	protected gl_output_name() {
		return 'value';
	}
	protected expected_input_types(): ConnectionPointType[] {
		const type = this.input_connection_type();
		if (this.io.connections.first_input_connection()) {
			let count = Math.max(lodash_compact(this.io.connections.input_connections()).length + 1, 2);
			return lodash_range(count).map((i) => type);
		} else {
			return lodash_range(2).map((i) => type);
		}
	}

	protected expected_output_types() {
		const type = this.output_connection_type();
		return [type];
	}

	set_lines(shaders_collection_controller: ShadersCollectionController) {
		const body_lines = [];

		const var_type: ConnectionPointType = this.io.outputs.named_output_connection_points[0].type;
		const args = this.io.inputs.named_input_connection_points.map((connection, i) => {
			const name = connection.name;
			return ThreeToGl.any(this.variable_for_input(name));
		});
		const joined_args = args.join(', ');

		const sum = this.gl_var_name(this.gl_output_name());
		body_lines.push(`${var_type} ${sum} = ${this.gl_method_name()}(${joined_args})`);
		shaders_collection_controller.add_body_lines(this, body_lines);
		shaders_collection_controller.add_definitions(this, this.gl_function_definitions());
	}
}
