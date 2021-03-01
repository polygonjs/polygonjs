import {TypedGlNode} from './_Base';
import {GlConnectionPointType} from '../utils/io/connections/Gl';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {ThreeToGl} from '../../../core/ThreeToGl';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {CoreMath} from '../../../core/math/_Module';

// force MAX_INPUTS_COUNT to 16 to encourage limiting number of textures per draw call
const MAX_INPUTS_COUNT = 16;
class SwitchParamsConfig extends NodeParamsConfig {}

const ParamsConfig = new SwitchParamsConfig();
export class SwitchGlNode extends TypedGlNode<SwitchParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'switch';
	}
	static INPUT_INDEX = 'index';

	initializeNode() {
		this.io.connection_points.set_input_name_function(this._gl_input_name.bind(this));
		// this.io.connection_points.set_output_name_function(this._gl_output_name.bind(this));

		this.io.connection_points.set_expected_input_types_function(this._expected_input_types.bind(this));
		this.io.connection_points.set_expected_output_types_function(this._expected_output_types.bind(this));
	}
	protected _gl_input_name(index: number) {
		if (index == 0) {
			return SwitchGlNode.INPUT_INDEX;
		} else {
			return `in${index - 1}`;
		}
	}

	protected _expected_input_types() {
		const second_input_type = this.io.connection_points.input_connection_type(1);
		const type = second_input_type || GlConnectionPointType.FLOAT;

		const current_connections = this.io.connections.inputConnections();
		const expected_count = current_connections
			? CoreMath.clamp(current_connections.length, 2, MAX_INPUTS_COUNT)
			: 2;
		const expected_input_types = [GlConnectionPointType.INT];
		for (let i = 0; i < expected_count; i++) {
			expected_input_types.push(type);
		}
		return expected_input_types;
	}
	protected _expected_output_types() {
		const input_types = this._expected_input_types();
		const type = input_types[1] || GlConnectionPointType.FLOAT;
		return [type];
	}

	setLines(shaders_collection_controller: ShadersCollectionController) {
		const var_type: GlConnectionPointType = this.io.outputs.named_output_connection_points[0].type();
		const out = this.glVarName(this.io.connection_points.output_name(0));
		const index_point_name = this.io.connection_points.input_name(0);
		const arg_index = ThreeToGl.int(this.variable_for_input(index_point_name));
		const switch_index_var_name = this.glVarName('index');
		const body_lines: string[] = [`${var_type} ${out};`, `int ${switch_index_var_name} = ${arg_index}`];

		const lines_count = this._expected_input_types().length - 1;
		for (let i = 0; i < lines_count; i++) {
			const if_else = i == 0 ? 'if' : 'else if';
			const condition = `${switch_index_var_name} == ${i}`;
			const connection_point_name = this.io.connection_points.input_name(i + 1);
			const assignment = `${out} = ${ThreeToGl.any(this.variable_for_input(connection_point_name))};`;
			const body_line = `${if_else}(${condition}){${assignment}}`;
			body_lines.push(body_line);
		}
		shaders_collection_controller.addBodyLines(this, body_lines);
	}
}
