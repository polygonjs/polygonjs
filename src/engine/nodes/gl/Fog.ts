import {TypedGlNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {GlConnectionPointType, GlConnectionPoint} from '../utils/io/connections/Gl';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {VaryingGLDefinition, FunctionGLDefinition} from './utils/GLDefinition';
import {ShaderName} from '../utils/shaders/ShaderName';
import FogGlsl from './gl/fog.glsl';
import {ThreeToGl} from '../../../core/ThreeToGl';

const OUTPUT_NAME = 'color';
class FogGlParamsConfig extends NodeParamsConfig {
	mvPosition = ParamConfig.VECTOR4([0, 0, 0, 0]);
	baseColor = ParamConfig.COLOR([0, 0, 0]);
	fogColor = ParamConfig.COLOR([1, 1, 1]);
	near = ParamConfig.FLOAT(0);
	far = ParamConfig.FLOAT(0);
}
const ParamsConfig = new FogGlParamsConfig();
export class FogGlNode extends TypedGlNode<FogGlParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'fog';
	}

	initialize_node() {
		super.initialize_node();

		this.io.outputs.set_named_output_connection_points([
			new GlConnectionPoint(OUTPUT_NAME, GlConnectionPointType.VEC3),
		]);
	}

	set_lines(shaders_collection_controller: ShadersCollectionController) {
		if (shaders_collection_controller.current_shader_name == ShaderName.FRAGMENT) {
			const varying_name = this.gl_var_name(this.name());
			const definition = new VaryingGLDefinition(this, GlConnectionPointType.VEC4, varying_name);
			const vertex_body_line = `${varying_name} = modelViewMatrix * vec4(position, 1.0)`;

			// vertex
			shaders_collection_controller.add_definitions(this, [definition], ShaderName.VERTEX);
			shaders_collection_controller.add_body_lines(this, [vertex_body_line], ShaderName.VERTEX);

			// fragment
			const function_definition = new FunctionGLDefinition(this, FogGlsl);
			const mvPosition = ThreeToGl.vector4(this.variable_for_input('mvPosition'));
			const baseColor = ThreeToGl.vector3(this.variable_for_input('baseColor'));
			const fogColor = ThreeToGl.vector3(this.variable_for_input('fogColor'));
			const near = ThreeToGl.vector3(this.variable_for_input('near'));
			const far = ThreeToGl.vector3(this.variable_for_input('far'));
			const out_value = this.gl_var_name(OUTPUT_NAME);
			const args = [mvPosition, baseColor, fogColor, near, far].join(', ');
			const body_line = `vec3 ${out_value} = compute_fog(${args})`;
			shaders_collection_controller.add_definitions(this, [definition, function_definition]);
			shaders_collection_controller.add_body_lines(this, [body_line]);
		}
	}
}
