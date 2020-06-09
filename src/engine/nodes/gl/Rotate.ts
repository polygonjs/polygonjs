import {TypedGlNode} from './_Base';
import Quaternion from './gl/quaternion.glsl';
import {FunctionGLDefinition} from './utils/GLDefinition';
import {GlConnectionPointType} from '../utils/io/connections/Gl';

export enum GlRotateMode {
	AXIS = 0,
	QUAT = 1,
}
const Modes: Array<GlRotateMode> = [GlRotateMode.AXIS, GlRotateMode.QUAT];

type StringByMode = {[key in GlRotateMode]: string};
const LabelByMode: StringByMode = {
	[GlRotateMode.AXIS]: 'from axis + angle',
	[GlRotateMode.QUAT]: 'from quaternion',
};
type StringArrayByMode = {[key in GlRotateMode]: string[]};
const InputNamesByMode: StringArrayByMode = {
	[GlRotateMode.AXIS]: ['vector', 'axis', 'angle'],
	[GlRotateMode.QUAT]: ['vector', 'quat'],
};
const MethodNameByMode: StringByMode = {
	[GlRotateMode.AXIS]: 'rotate_with_axis_angle',
	[GlRotateMode.QUAT]: 'rotate_with_quat',
};
type ConnectionTypeArrayByMode = {[key in GlRotateMode]: GlConnectionPointType[]};
const InputTypesByMode: ConnectionTypeArrayByMode = {
	[GlRotateMode.AXIS]: [GlConnectionPointType.VEC3, GlConnectionPointType.VEC3, GlConnectionPointType.FLOAT],
	[GlRotateMode.QUAT]: [GlConnectionPointType.VEC3, GlConnectionPointType.VEC4],
};

const DefaultValues: Dictionary<Number3> = {
	vector: [0, 0, 1],
	axis: [0, 1, 0],
};

import {ParamConfig, NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {ThreeToGl} from '../../../core/ThreeToGl';

class RotateParamsConfig extends NodeParamsConfig {
	signature = ParamConfig.INTEGER(GlRotateMode.AXIS, {
		menu: {
			entries: Modes.map((mode, i) => {
				const label = LabelByMode[mode];
				return {name: label, value: i};
			}),
		},
	});
}

const ParamsConfig = new RotateParamsConfig();
export class RotateGlNode extends TypedGlNode<RotateParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'rotate';
	}

	initialize_node() {
		super.initialize_node();
		this.io.connection_points.set_expected_input_types_function(this._expected_input_types.bind(this));
		this.io.connection_points.set_expected_output_types_function(this._expected_output_types.bind(this));
		this.io.connection_points.set_input_name_function(this._gl_input_name.bind(this));
	}
	set_signature(mode: GlRotateMode) {
		const index = Modes.indexOf(mode);
		this.p.signature.set(index);
	}

	protected _gl_input_name(index: number) {
		const mode = Modes[this.pv.signature];
		return InputNamesByMode[mode][index];
	}
	param_default_value(name: string) {
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

		const sum = this.gl_var_name(this.io.connection_points.output_name(0));
		const body_line = `${var_type} ${sum} = ${this.gl_method_name()}(${joined_args})`;
		shaders_collection_controller.add_body_lines(this, [body_line]);
		shaders_collection_controller.add_definitions(this, this.gl_function_definitions());
	}
}
