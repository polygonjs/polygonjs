// import {BaseNodeGlNumeric} from './_BaseNumeric';
// import {ParamType} from 'src/Engine/Param/_Module';
// import {Connection} from './GlData';
// import {ThreeToGl} from 'src/Core/ThreeToGl';

// export class TwoWaySwitch extends BaseNodeGlNumeric {
// 	static type() {
// 		return 'two_way_switch';
// 	}

// 	gl_input_name(index: number) {
// 		return ['condition', 'if_true', 'if_false'][index];
// 	}
// 	gl_output_name() {
// 		return 'value';
// 	}

// 	set_lines() {
// 		const body_lines = [];

// 		const value = this.gl_var_name('value');
// 		const condition = ThreeToGl.bool(this.variable_for_input('condition'));
// 		const if_true = ThreeToGl.any(this.variable_for_input('if_true'));
// 		const if_false = ThreeToGl.any(this.variable_for_input('if_false'));

// 		const gl_type = this.named_outputs()[0].type();
// 		body_lines.push(`${gl_type} ${value}`);
// 		body_lines.push(`if(${condition}){`);
// 		body_lines.push(`${value} = ${if_true}`);
// 		body_lines.push(`} else {`);
// 		body_lines.push(`${value} = ${if_false}`);
// 		body_lines.push(`}`);
// 		this.set_body_lines(body_lines);
// 	}

// 	protected expected_named_input_constructors() {
// 		const connection = this.input_connection(1) || this.input_connection(2);
// 		const constructor = this.connection_constructor_from_connection(connection) || Connection.Float;
// 		return [Connection.Bool, constructor, constructor];
// 	}

// 	protected expected_named_output_constructors() {
// 		const connection = this.input_connection(1) || this.input_connection(2);
// 		const constructor = this.connection_constructor_from_connection(connection) || Connection.Float;
// 		return [constructor];
// 	}
// }
