import {ParamlessTypedGlNode} from './_Base';
import {ThreeToGl} from '../../../core/ThreeToGl';
import {GlConnectionsController} from './utils/ConnectionsController';

const OUTPUT_NAME = 'value';
enum InputName {
	CONDITION = 'condition',
	IF_TRUE = 'if_true',
	IF_FALSE = 'if_false',
}
const InputNames: Array<InputName> = [InputName.CONDITION, InputName.IF_TRUE, InputName.IF_FALSE];

import {ConnectionPointType} from '../utils/connections/ConnectionPointType';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
export class TwoWaySwitchGlNode extends ParamlessTypedGlNode {
	static type() {
		return 'two_way_switch';
	}

	public readonly gl_connections_controller: GlConnectionsController = new GlConnectionsController(this);
	initialize_node() {
		super.initialize_node();
		this.gl_connections_controller.initialize_node();

		this.gl_connections_controller.set_expected_input_types_function(this._expected_input_types.bind(this));
		this.gl_connections_controller.set_expected_output_types_function(this._expected_output_types.bind(this));
		this.gl_connections_controller.set_input_name_function(this._gl_input_name.bind(this));
		this.gl_connections_controller.set_output_name_function(this._gl_output_name.bind(this));
	}

	protected _gl_input_name(index: number) {
		return InputNames[index];
	}
	protected _gl_output_name() {
		return OUTPUT_NAME;
	}
	protected _expected_input_types(): ConnectionPointType[] {
		const second_or_third_connection =
			this.io.connections.input_connection(1) || this.io.connections.input_connection(2);
		const type: ConnectionPointType = second_or_third_connection
			? this.gl_connections_controller.connection_type_from_connection(second_or_third_connection)
			: ConnectionPointType.FLOAT;
		return [ConnectionPointType.BOOL, type, type];
	}
	protected _expected_output_types() {
		const type = this._expected_input_types()[1];
		return [type];
	}

	set_lines(shaders_collection_controller: ShadersCollectionController) {
		const body_lines: string[] = [];

		const value = this.gl_var_name(OUTPUT_NAME);
		const condition = ThreeToGl.bool(this.variable_for_input(InputName.CONDITION));
		const if_true = ThreeToGl.any(this.variable_for_input(InputName.IF_TRUE));
		const if_false = ThreeToGl.any(this.variable_for_input(InputName.IF_FALSE));

		const gl_type = this._expected_output_types()[1];
		body_lines.push(`${gl_type} ${value}`);
		body_lines.push(`if(${condition}){`);
		body_lines.push(`${value} = ${if_true}`);
		body_lines.push(`} else {`);
		body_lines.push(`${value} = ${if_false}`);
		body_lines.push(`}`);
		shaders_collection_controller.add_body_lines(this, body_lines);
	}
}
