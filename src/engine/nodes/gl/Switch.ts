/**
 * switches between different input values based on an integer input
 *
 * @remarks
 *
 * For simple use cases where you'd like to switch between 2 values only, use the [gl/TwoWaySwitch](/docs/nodes/gl/TwoWaySwitch) instead.
 *
 *
 *
 */

import {TypedGlNode} from './_Base';
import {GlConnectionPointType} from '../utils/io/connections/Gl';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {ThreeToGl} from '../../../core/ThreeToGl';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {CoreMath} from '../../../core/math/_Module';

// force MAX_INPUTS_COUNT to 16 to encourage limiting number of textures for a single vertex shader
// see: https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices#understand_system_limits
const MAX_INPUTS_COUNT = 16;
class SwitchParamsConfig extends NodeParamsConfig {}

const ParamsConfig = new SwitchParamsConfig();
export class SwitchGlNode extends TypedGlNode<SwitchParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'switch';
	}
	static INPUT_INDEX = 'index';

	override initializeNode() {
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
		const secondInputType = this.io.connection_points.input_connection_type(1);
		const type = secondInputType || GlConnectionPointType.FLOAT;

		const currentConnections = this.io.connections.inputConnections() || [];
		let lastValidConnectionIndex = 1;
		let i = 0;
		for (let connection of currentConnections) {
			if (connection) {
				lastValidConnectionIndex = i;
			}
			i++;
		}

		const expected_count = CoreMath.clamp(lastValidConnectionIndex + 1, 2, MAX_INPUTS_COUNT);
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

	override setLines(shaders_collection_controller: ShadersCollectionController) {
		const var_type: GlConnectionPointType = this.io.outputs.namedOutputConnectionPoints()[0].type();
		const out = this.glVarName(this.io.connection_points.output_name(0));
		const index_point_name = this.io.connection_points.input_name(0);

		const arg_index = ThreeToGl.integer(this.variableForInput(index_point_name));
		const switch_index_var_name = this.glVarName('index');
		const body_lines: string[] = [`${var_type} ${out};`, `int ${switch_index_var_name} = ${arg_index}`];

		const lines_count = this._expected_input_types().length - 1;
		for (let i = 0; i < lines_count; i++) {
			const if_else = i == 0 ? 'if' : 'else if';
			const condition = `${switch_index_var_name} == ${i}`;
			const connection_point_name = this.io.connection_points.input_name(i + 1);
			const assignment = `${out} = ${ThreeToGl.any(this.variableForInput(connection_point_name))};`;
			const body_line = `${if_else}(${condition}){${assignment}}`;
			body_lines.push(body_line);
		}
		shaders_collection_controller.addBodyLines(this, body_lines);
	}
}
