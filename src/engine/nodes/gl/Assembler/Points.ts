import {VertexColors} from 'three/src/constants'
import {UniformsUtils} from 'three/src/renderers/shaders/UniformsUtils'
import {ShaderMaterial} from 'three/src/materials/ShaderMaterial'
import {ShaderLib} from 'three/src/renderers/shaders/ShaderLib'
import {FrontSide} from 'three/src/constants'
import {AdditiveBlending} from 'three/src/constants'
const THREE = {AdditiveBlending, FrontSide, ShaderLib, ShaderMaterial, UniformsUtils, VertexColors}

import {ShaderAssemblerRender} from './_BaseRender'
import {ParamType} from 'src/Engine/Param/_Module'
import {Connection} from 'src/Engine/Node/Gl/GlData'


import {ShaderConfig} from './Config/ShaderConfig'
import {VariableConfig} from './Config/VariableConfig'

import {BaseShaderAssembler} from './_Base'
import {ShaderAssemblerCustomPointsDepth} from './CustomPointsDepth'
import {ShaderAssemblerCustomPointsDistance} from './CustomPointsDistance'
import {ShaderAssemblerCustomPointsDepthDOF} from './CustomPointsDepthDOF'


export class ShaderAssemblerPoints extends ShaderAssemblerRender {

	// _color_declaration() { return 'diffuseColor' }
	_template_shader(){
		const template = THREE.ShaderLib.points
		return {
			vertexShader: template.vertexShader, //TemplateVertex,
			fragmentShader: template.fragmentShader, //TemplateFragment,
			uniforms: template.uniforms,
		}
	}
	_create_material(){
		const template_shader = this._template_shader()

		// const uniforms = THREE.UniformsUtils.clone( template_shader.uniforms )
		// uniforms.size.value = 10
		// console.log(uniforms)

		const material = new THREE.ShaderMaterial({

			// vertexColors: THREE.VertexColors,
			// side: THREE.FrontSide,
			transparent: true,
			fog: true,
			// lights: false,

			// size: 10,
			// //blending: THREE.AdditiveBlending
			depthTest: true,
			// depthwrite: true,
			alphaTest: 0.5,
			defines: {
				// ALPHATEST: 0.5,
				USE_SIZEATTENUATION: 1
			},

			uniforms: THREE.UniformsUtils.clone( template_shader.uniforms ),
			vertexShader: template_shader.vertexShader,
			fragmentShader: template_shader.fragmentShader
		})

		
		return material
		// material.uniforms.size.value = 10
		// console.log("material.uniforms.size.value", material.uniforms.size.value)
		// console.log(material)
		// return material
	}
	// protected insert_body_after(shader_name){
	// 	return {
	// 		vertex: 'gl_PointSize = size;',
	// 		fragment: 'vec4 diffuseColor = vec4( diffuse, opacity );'
	// 	}[shader_name]
	// }
	// those shadow shaders should ideally be overriden
	// to properly take into account point size
	custom_assembler_class_by_custom_name(){
		return {
			customDepthMaterial: ShaderAssemblerCustomPointsDepth,
			customDistanceMaterial: ShaderAssemblerCustomPointsDistance,
			customDepthDOFMaterial: ShaderAssemblerCustomPointsDepthDOF,
		}
	}
	add_output_params(output_child){
		BaseShaderAssembler.add_output_params(output_child)
		output_child.add_param( ParamType.FLOAT, 'gl_PointSize', 1 )
	}
	create_globals_node_output_connections(){
		return BaseShaderAssembler.create_globals_node_output_connections().concat([
			new Connection.Vec2('gl_PointCoord')
		])
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
	create_shader_configs(){
		return [
			new ShaderConfig('vertex', ['position', 'normal', 'uv', 'gl_PointSize'], []),
			new ShaderConfig('fragment', ['color', 'alpha'], ['vertex']),
		]
	}
	create_variable_configs(){
		return BaseShaderAssembler.create_variable_configs().concat([
			new VariableConfig('gl_PointSize', {
				default: '1.0',
				prefix: 'gl_PointSize = ',
				suffix: ' * size * 10.0', // currently using 10 as 1 seems really small
			}),

		])
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
	protected lines_to_remove(shader_name){
		return {
			vertex: ['#include <begin_vertex>', 'gl_PointSize = size;'],
			fragment: []
		}[shader_name]
	}

}
