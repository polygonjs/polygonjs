// import {BaseNodeGlMathFunction} from './_BaseMathFunction';
// import {Connection} from './GlData';
// import {Definition} from './Definition/_Module';
// import {ParamType} from 'src/Engine/Param/_Module';
// import Quaternion from './Gl/quaternion.glsl';

// const MODE_VALUES = {
// 	AXIS: 0,
// 	QUAT: 1,
// };
// const MODE_NAMES = {
// 	AXIS: 'from axis + angle',
// 	QUAT: 'from quaternion',
// };
// const MODE_INPUT_NAMES = {
// 	AXIS: ['vector', 'axis', 'angle'],
// 	QUAT: ['vector', 'quat'],
// };
// const MODE_METHOD_NAMES = {
// 	AXIS: 'rotate_with_axis_angle',
// 	QUAT: 'rotate_with_quat',
// };
// const MODE_CONNECTIONS = {
// 	AXIS: [Connection.Vec3, Connection.Vec3, Connection.Float],
// 	QUAT: [Connection.Vec3, Connection.Vec4],
// };

// export class Rotate extends BaseNodeGlMathFunction {
// 	static type() {
// 		return 'rotate';
// 	}

// 	_signature_name: string = 'AXIS';

// 	constructor() {
// 		super();
// 		this.add_post_dirty_hook(this._update_if_signature_changed.bind(this));
// 	}

// 	gl_input_name(index: number) {
// 		return MODE_INPUT_NAMES[this._signature_name][index];
// 	}
// 	gl_input_default_value(name: string) {
// 		return {
// 			vector: [0, 0, 1],
// 			axis: [0, 1, 0],
// 		}[name];
// 	}
// 	gl_method_name(): string {
// 		return MODE_METHOD_NAMES[this._signature_name];
// 	}

// 	create_params() {
// 		this.add_param(ParamType.INTEGER, 'signature', MODE_VALUES.AXIS, {
// 			menu: {
// 				type: 'radio',
// 				entries: Object.keys(MODE_VALUES).map((mode) => {
// 					return {name: MODE_NAMES[mode], value: MODE_VALUES[mode]};
// 				}),
// 			},
// 		});
// 		this.prepare_signature();
// 		this.update_connection_types();
// 	}
// 	_update_if_signature_changed(dirty_trigger) {
// 		if (dirty_trigger == this.param('signature')) {
// 			this.prepare_signature();
// 			this.update_connection_types();
// 			this.remove_dirty_state();
// 			this.make_output_nodes_dirty();
// 		}
// 	}

// 	protected prepare_signature() {
// 		const signature_value = this.param('signature').value();
// 		Object.keys(MODE_VALUES).forEach((signature_name) => {
// 			if (MODE_VALUES[signature_name] == signature_value) {
// 				this._signature_name = signature_name;
// 			}
// 		});
// 	}

// 	protected expected_named_input_constructors() {
// 		return MODE_CONNECTIONS[this._signature_name];
// 	}
// 	protected expected_named_output_constructors() {
// 		return [Connection.Vec3];
// 	}
// 	gl_function_definitions() {
// 		return [new Definition.Function(this, Quaternion)];
// 	}
// }
