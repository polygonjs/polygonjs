import {UniformsUtils} from 'three/src/renderers/shaders/UniformsUtils';
import {ShaderMaterial} from 'three/src/materials/ShaderMaterial';
import {ShaderLib} from 'three/src/renderers/shaders/ShaderLib';

import {ShaderAssemblerMaterial, CustomAssemblerMap, CustomMaterialName} from './_BaseMaterial';

import {ShaderConfig} from '../../configs/ShaderConfig';
import {VariableConfig} from '../../configs/VariableConfig';

import {BaseGlShaderAssembler} from '../_Base';
import {ShaderAssemblerCustomPointsDepth} from './CustomPointsDepth';
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
if (false) {
	// currently not working
	CUSTOM_ASSEMBLER_MAP.set(CustomMaterialName.DEPTH, ShaderAssemblerCustomPointsDepth);
}

export class ShaderAssemblerPoints extends ShaderAssemblerMaterial {
	// _color_declaration() { return 'diffuseColor' }
	custom_assembler_class_by_custom_name(): CustomAssemblerMap {
		return CUSTOM_ASSEMBLER_MAP;
	}

	get _template_shader() {
		const template = ShaderLib.points;
		return {
			vertexShader: template.vertexShader, //TemplateVertex,
			fragmentShader: template.fragmentShader, //TemplateFragment,
			uniforms: template.uniforms,
		};
	}
	create_material() {
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
		output_child.io.inputs.set_named_input_connection_points(list);
	}
	create_globals_node_output_connections() {
		return BaseGlShaderAssembler.create_globals_node_output_connections().concat([
			new GlConnectionPoint('gl_PointCoord', GlConnectionPointType.VEC2),
		]);
	}

	// add_globals_params(globals_node){
	// 	BaseShaderAssembler.add_globals_params(globals_node)
	// 	globals_node.set_named_outputs([
	// 		new Connection.Vec3('position'),
	// 		new Connection.Vec3('color'),
	// 		new Connection.Vec3('normal'),
	// 		new Connection.Vec4('gl_FragCoord'),
	// 		new Connection.Vec2('gl_PointCoord'),
	// 		// new TypedConnectionVec2('uv'),
	// 		new Connection.Float('frame')
	// 	])
	// }
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
		// 	new VariableConfig('position', {
		// 		default_from_attribute: true,
		// 		// default: this.globals_handler().variable_config_default('position'),
		// 		// required_definitions: this.globals_handler().variable_config_required_definitions('position'),
		// 		prefix: 'vec3 transformed = '
		// 	}),
		// 	new VariableConfig('normal', {
		// 		prefix: 'objectNormal = '
		// 	}),
		// 	new VariableConfig('color', {
		// 		prefix: 'diffuseColor.xyz = '
		// 	}),
		// 	new VariableConfig('alpha', {
		// 		prefix: 'diffuseColor.w = '
		// 	}),
		// 	new VariableConfig('uv', {
		// 		default_from_attribute: true,
		// 		prefix: 'vUv = ',
		// 		if: 'defined( USE_MAP ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( USE_SPECULARMAP ) || defined( USE_ALPHAMAP ) || defined( USE_EMISSIVEMAP ) || defined( USE_ROUGHNESSMAP ) || defined( USE_METALNESSMAP )'
		// 	}),
		// 	new VariableConfig('gl_PointSize', {
		// 		default: '1.0',
		// 		prefix: 'gl_PointSize = ',
		// 		suffix: ' * size',
		// 	}),
		// ]
	}
	protected lines_to_remove(shader_name: ShaderName) {
		return LINES_TO_REMOVE_MAP.get(shader_name);
	}
}
