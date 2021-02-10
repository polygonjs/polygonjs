import {UniformsUtils} from 'three/src/renderers/shaders/UniformsUtils';
import {ShaderMaterial} from 'three/src/materials/ShaderMaterial';
import {ShaderLib} from 'three/src/renderers/shaders/ShaderLib';
import {ShaderAssemblerMaterial, CustomAssemblerMap, CustomMaterialName, GlobalsOutput} from './_BaseMaterial';
import {ShaderConfig} from '../../configs/ShaderConfig';
import {VariableConfig} from '../../configs/VariableConfig';
import {BaseGlShaderAssembler} from '../_Base';
// import {ShaderAssemblerCustomPointsDepth} from './CustomPointsDepth';
import {ShaderAssemblerCustomPointsDistance} from './CustomPointsDistance';
import {ShaderAssemblerCustomPointsDepthDOF} from './CustomPointsDepthDOF';
import {OutputGlNode} from '../../../Output';
import {GlConnectionPointType, GlConnectionPoint} from '../../../../utils/io/connections/Gl';
import {ShaderName} from '../../../../utils/shaders/ShaderName';

const LINES_TO_REMOVE_MAP: Map<ShaderName, string[]> = new Map([
	[ShaderName.VERTEX, ['#include <begin_vertex>', 'gl_PointSize = size;']],
	[ShaderName.FRAGMENT, []],
]);

const CUSTOM_ASSEMBLER_MAP: CustomAssemblerMap = new Map();
CUSTOM_ASSEMBLER_MAP.set(CustomMaterialName.DISTANCE, ShaderAssemblerCustomPointsDistance);
CUSTOM_ASSEMBLER_MAP.set(CustomMaterialName.DEPTH_DOF, ShaderAssemblerCustomPointsDepthDOF);
// if (false) {
// 	// currently not working
// 	CUSTOM_ASSEMBLER_MAP.set(CustomMaterialName.DEPTH, ShaderAssemblerCustomPointsDepth);
// }

export class ShaderAssemblerPoints extends ShaderAssemblerMaterial {
	custom_assembler_class_by_custom_name(): CustomAssemblerMap {
		return CUSTOM_ASSEMBLER_MAP;
	}

	get _template_shader() {
		const template = ShaderLib.points;
		return {
			vertexShader: template.vertexShader,
			fragmentShader: template.fragmentShader,
			uniforms: template.uniforms,
		};
	}
	createMaterial() {
		const template_shader = this._template_shader;

		// const uniforms = UniformsUtils.clone( template_shader.uniforms )
		// uniforms.size.value = 10

		const material = new ShaderMaterial({
			transparent: true,
			fog: true,

			// size: 10,
			// //blending: AdditiveBlending
			// depthTest: true,
			// depthwrite: true,
			// alphaTest: 0.5,
			defines: {
				// ALPHATEST: 0.5,
				USE_SIZEATTENUATION: 1,
			},

			uniforms: UniformsUtils.clone(template_shader.uniforms),
			vertexShader: template_shader.vertexShader,
			fragmentShader: template_shader.fragmentShader,
		});
		this._add_custom_materials(material);
		return material;
	}
	// protected insert_body_after(shader_name){
	// 	return {
	// 		vertex: 'gl_PointSize = size;',
	// 		fragment: 'vec4 diffuseColor = vec4( diffuse, opacity );'
	// 	}[shader_name]
	// }
	// those shadow shaders should ideally be overriden
	// to properly take into account point size

	add_output_inputs(output_child: OutputGlNode) {
		const list = BaseGlShaderAssembler.output_input_connection_points();
		list.push(new GlConnectionPoint('gl_PointSize', GlConnectionPointType.FLOAT));
		output_child.io.inputs.setNamedInputConnectionPoints(list);
	}
	create_globals_node_output_connections() {
		return BaseGlShaderAssembler.create_globals_node_output_connections().concat([
			new GlConnectionPoint(GlobalsOutput.GL_POINTCOORD, GlConnectionPointType.VEC2),
		]);
	}

	create_shader_configs() {
		return [
			new ShaderConfig(ShaderName.VERTEX, ['position', 'normal', 'uv', 'gl_PointSize'], []),
			new ShaderConfig(ShaderName.FRAGMENT, ['color', 'alpha'], [ShaderName.VERTEX]),
		];
	}
	create_variable_configs() {
		return BaseGlShaderAssembler.create_variable_configs().concat([
			new VariableConfig('gl_PointSize', {
				default: '1.0',
				prefix: 'gl_PointSize = ',
				suffix: ' * size * 10.0', // currently using 10 as 1 seems really small
			}),
		]);
	}
	protected lines_to_remove(shader_name: ShaderName) {
		return LINES_TO_REMOVE_MAP.get(shader_name);
	}
}
