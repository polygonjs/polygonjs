/**
 * rounds an input value to the nearest integer
 *
 *
 *
 */

import {BaseNodeGlMathFunctionArg1GlNode} from './_BaseMathFunction';
import {ThreeToGl} from '../../../core/ThreeToGl';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {GlConnectionPointComponentsCountMap} from '../utils/io/connections/Gl';

const ALL_COMPONENTS = ['x', 'y', 'z', 'w'];
// const OUTPUT_NAME = 'round'

export class RoundGlNode extends BaseNodeGlMathFunctionArg1GlNode {
	static override type() {
		return 'round';
	}

	// initializeNode() {
	// 	super.initializeNode();
	// 	this.set_named_outputs([new TypedConnectionFloat(v)]);
	// }

	// createParams() {
	// 	this.add_param(ParamType.FLOAT, 'value', 1);
	// }
	// https://hub.jmonkeyengine.org/t/round-with-glsl/8186/6
	override setLines(shaders_collection_controller: ShadersCollectionController) {
		// const function_declaration_lines = []

		// 		function_declaration_lines.push(`highp float round(float num){
		// 	return floor(num)-fract(num);
		// }`)
		const input_connection = this.io.inputs.namedInputConnectionPoints()[0];
		const value = ThreeToGl.vector2(this.variableForInput(input_connection.name()));

		const output_connection = this.io.outputs.namedOutputConnectionPoints()[0];
		const var_name = this.glVarName(output_connection.name());

		const body_lines: string[] = [];
		const lines_count = GlConnectionPointComponentsCountMap[output_connection.type()];
		if (lines_count == 1) {
			body_lines.push(`${output_connection.type()} ${var_name} = ${this._simple_line(value)}`);
		} else {
			const simple_lines: string[] = ALL_COMPONENTS.map((c) => {
				return this._simple_line(`${value}.${c}`);
			});
			body_lines.push(
				`${output_connection.type()} ${var_name} = ${output_connection.type()}(${simple_lines.join(',')})`
			);
		}
		shaders_collection_controller.addBodyLines(this, body_lines);
	}

	private _simple_line(value: string) {
		return `sign(${value})*floor(abs(${value})+0.5)`;
	}
}
