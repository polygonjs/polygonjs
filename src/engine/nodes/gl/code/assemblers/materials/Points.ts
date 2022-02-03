// import {UniformsUtils} from 'three/src/renderers/shaders/UniformsUtils';
// import {ShaderMaterial} from 'three/src/materials/ShaderMaterial';
import {ShaderLib} from 'three/src/renderers/shaders/ShaderLib';
import {ShaderAssemblerMaterial, CustomAssemblerMap, CustomMaterialName, GlobalsOutput} from './_BaseMaterial';
import {ShaderConfig} from '../../configs/ShaderConfig';
import {VariableConfig} from '../../configs/VariableConfig';
import {BaseGlShaderAssembler} from '../_Base';
import {ShaderAssemblerCustomPointsDepth} from './custom/points/CustomPointsDepth';
import {ShaderAssemblerCustomPointsDistance} from './custom/points/CustomPointsDistance';
import {ShaderAssemblerCustomPointsDepthDOF} from './custom/points/CustomPointsDepthDOF';
import {OutputGlNode} from '../../../Output';
import {GlConnectionPointType, GlConnectionPoint} from '../../../../utils/io/connections/Gl';
import {ShaderName} from '../../../../utils/shaders/ShaderName';
import {VaryingWriteGlNode} from '../../../VaryingWrite';
import {PointsMaterial} from 'three/src/materials/PointsMaterial';

const LINES_TO_REMOVE_MAP: Map<ShaderName, string[]> = new Map([
	[ShaderName.VERTEX, ['#include <begin_vertex>', 'gl_PointSize = size;']],
	[ShaderName.FRAGMENT, []],
]);

const CUSTOM_ASSEMBLER_MAP: CustomAssemblerMap = new Map();
CUSTOM_ASSEMBLER_MAP.set(CustomMaterialName.DISTANCE, ShaderAssemblerCustomPointsDistance);
CUSTOM_ASSEMBLER_MAP.set(CustomMaterialName.DEPTH, ShaderAssemblerCustomPointsDepth);
CUSTOM_ASSEMBLER_MAP.set(CustomMaterialName.DEPTH_DOF, ShaderAssemblerCustomPointsDepthDOF);

export class ShaderAssemblerPoints extends ShaderAssemblerMaterial {
	override customAssemblerClassByCustomName(): CustomAssemblerMap {
		return CUSTOM_ASSEMBLER_MAP;
	}

	override templateShader() {
		const template = ShaderLib.points;
		return {
			vertexShader: template.vertexShader,
			fragmentShader: template.fragmentShader,
			uniforms: template.uniforms,
		};
	}
	override createMaterial() {
		const material = new PointsMaterial();
		// const template_shader = this.templateShader();

		// // const uniforms = UniformsUtils.clone( template_shader.uniforms )
		// // uniforms.size.value = 10

		// const material = new ShaderMaterial({
		// 	transparent: true,
		// 	fog: true,

		// 	// size: 10,
		// 	// //blending: AdditiveBlending
		// 	// depthTest: true,
		// 	// depthwrite: true,
		// 	// alphaTest: 0.5,
		// 	defines: {
		// 		// ALPHATEST: 0.5,
		// 		USE_SIZEATTENUATION: 1,
		// 	},

		// 	uniforms: UniformsUtils.clone(template_shader.uniforms),
		// 	vertexShader: template_shader.vertexShader,
		// 	fragmentShader: template_shader.fragmentShader,
		// });
		this._addCustomMaterials(material);
		return material;
	}
	// protected insertBodyAfter(shader_name){
	// 	return {
	// 		vertex: 'gl_PointSize = size;',
	// 		fragment: 'vec4 diffuseColor = vec4( diffuse, opacity );'
	// 	}[shader_name]
	// }
	// those shadow shaders should ideally be overriden
	// to properly take into account point size

	override add_output_inputs(output_child: OutputGlNode) {
		const list = BaseGlShaderAssembler.output_input_connection_points();
		list.push(new GlConnectionPoint('gl_PointSize', GlConnectionPointType.FLOAT));
		output_child.io.inputs.setNamedInputConnectionPoints(list);
	}
	override create_globals_node_output_connections() {
		return BaseGlShaderAssembler.create_globals_node_output_connections().concat([
			new GlConnectionPoint(GlobalsOutput.GL_POINTCOORD, GlConnectionPointType.VEC2),
		]);
	}

	override create_shader_configs() {
		return [
			new ShaderConfig(
				ShaderName.VERTEX,
				['position', 'normal', 'uv', 'gl_PointSize', VaryingWriteGlNode.INPUT_NAME],
				[]
			),
			new ShaderConfig(ShaderName.FRAGMENT, ['color', 'alpha'], [ShaderName.VERTEX]),
		];
	}
	override create_variable_configs() {
		return BaseGlShaderAssembler.create_variable_configs().concat([
			new VariableConfig('gl_PointSize', {
				default: '1.0',
				prefix: 'gl_PointSize = ',
				suffix: ' * size * 10.0', // currently using 10 as 1 seems really small
			}),
		]);
	}
	protected override linesToRemove(shader_name: ShaderName) {
		return LINES_TO_REMOVE_MAP.get(shader_name);
	}
}
