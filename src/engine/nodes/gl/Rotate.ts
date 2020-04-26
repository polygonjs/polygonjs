import {BaseAdaptiveGlNode} from './_BaseAdaptive';
import Quaternion from './gl/quaternion.glsl';
import {FunctionGLDefinition} from './utils/GLDefinition';
import {GlConnectionPointType} from '../utils/io/connections/Gl';

enum Mode {
	AXIS = 0,
	QUAT = 1,
}
const Modes: Array<Mode> = [Mode.AXIS, Mode.QUAT];

type StringByMode = {[key in Mode]: string};
const LabelByMode: StringByMode = {
	[Mode.AXIS]: 'from axis + angle',
	[Mode.QUAT]: 'from quaternion',
};
type StringArrayByMode = {[key in Mode]: string[]};
const InputNamesByMode: StringArrayByMode = {
	[Mode.AXIS]: ['vector', 'axis', 'angle'],
	[Mode.QUAT]: ['vector', 'quat'],
};
const MethodNameByMode: StringByMode = {
	[Mode.AXIS]: 'rotate_with_axis_angle',
	[Mode.QUAT]: 'rotate_with_quat',
};
type ConnectionTypeArrayByMode = {[key in Mode]: GlConnectionPointType[]};
const InputTypesByMode: ConnectionTypeArrayByMode = {
	[Mode.AXIS]: [GlConnectionPointType.VEC3, GlConnectionPointType.VEC3, GlConnectionPointType.FLOAT],
	[Mode.QUAT]: [GlConnectionPointType.VEC3, GlConnectionPointType.VEC4],
};

const DefaultValues: Dictionary<Number3> = {
	vector: [0, 0, 1],
	axis: [0, 1, 0],
};

import {ParamConfig, NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {ThreeToGl} from '../../../core/ThreeToGl';

class RotateParamsConfig extends NodeParamsConfig {
	signature = ParamConfig.INTEGER(Mode.AXIS, {
		menu: {
			entries: Modes.map((mode, i) => {
				const label = LabelByMode[mode];
				return {name: label, value: i};
			}),
		},
	});
}

const ParamsConfig = new RotateParamsConfig();
export class RotateGlNode extends BaseAdaptiveGlNode<RotateParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'rotate';
	}

	// _signature_name: string = 'AXIS';

	initialize_node() {
		super.initialize_node();
		this.gl_connections_controller.set_expected_input_types_function(this._expected_input_types.bind(this));
		this.gl_connections_controller.set_expected_output_types_function(this._expected_output_types.bind(this));
		this.gl_connections_controller.set_input_name_function(this._gl_input_name.bind(this));
	}

	protected _gl_input_name(index: number) {
		const mode = Modes[this.pv.signature];
		return InputNamesByMode[mode][index];
	}
	gl_input_default_value(name: string) {
		return DefaultValues[name];
	}
	gl_method_name(): string {
		const mode = Modes[this.pv.signature];
		return MethodNameByMode[mode];
	}

	protected _expected_input_types() {
		const mode = Modes[this.pv.signature];
		return InputTypesByMode[mode];
	}
	protected _expected_output_types() {
		return [GlConnectionPointType.VEC3];
	}
	gl_function_definitions() {
		// const type = this._expected_output_types()[0];
		// do not use type from the output, as there seem to always be a def somewhere
		// TODO: I probably don't need a data type in FunctionGLDefinition
		// const type = GlConnectionPointType.VEC4;
		return [new FunctionGLDefinition(this, Quaternion)];
	}

	set_lines(shaders_collection_controller: ShadersCollectionController) {
		const var_type: GlConnectionPointType = this.io.outputs.named_output_connection_points[0].type;
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
