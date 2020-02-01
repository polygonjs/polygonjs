import {VertexColors} from 'three/src/constants'
import {UniformsUtils} from 'three/src/renderers/shaders/UniformsUtils'
import {ShaderMaterial} from 'three/src/materials/ShaderMaterial'
import {ShaderLib} from 'three/src/renderers/shaders/ShaderLib'
import {FrontSide} from 'three/src/constants'
import {AdditiveBlending} from 'three/src/constants'
const THREE = {AdditiveBlending, FrontSide, ShaderLib, ShaderMaterial, UniformsUtils, VertexColors}
import {ParamType} from 'src/Engine/Param/_Module'

import {ShaderAssemblerRender} from './_BaseRender'


import {ShaderConfig} from './Config/ShaderConfig'
import {VariableConfig} from './Config/VariableConfig'
import {Connection} from 'src/Engine/Node/Gl/GlData'
import {GlobalsGeometryHandler} from './Globals/Geometry'

// import {ShaderAssemblerCustomMeshDepth} from './CustomMeshDepth'
// import {ShaderAssemblerCustomMeshDistance} from './CustomMeshDistance'
import {ShaderAssemblerCustomLineDepthDOF} from './CustomLineDepthDOF'


export class ShaderAssemblerLine extends ShaderAssemblerRender {

	// _color_declaration() { return 'diffuseColor' }
	_template_shader(){
		const template = THREE.ShaderLib.dashed
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

		return new THREE.ShaderMaterial({

			// vertexColors: THREE.VertexColors,
			// side: THREE.FrontSide,
			// transparent: true,
			// fog: true,
			// lights: false,

			// size: 10,
			// //vertexColors: THREE.VertexColors
			// //blending: THREE.AdditiveBlending
			depthTest: true,
			alphaTest: 0.5,
			linewidth: 100,
			// isLineBasicMaterial: true,

			uniforms: THREE.UniformsUtils.clone( template_shader.uniforms ),
			vertexShader: template_shader.vertexShader,
			fragmentShader: template_shader.fragmentShader
		})
		// material.uniforms.size.value = 10
		// console.log("material.uniforms.size.value", material.uniforms.size.value)
		// console.log(material)
		// return material
	}

	custom_assembler_class_by_custom_name(){
		return {
			// customDepthMaterial: ShaderAssemblerCustomMeshDepth,
			// customDistanceMaterial: ShaderAssemblerCustomMeshDistance,
			customDepthDOFMaterial: ShaderAssemblerCustomLineDepthDOF,
		}
	}
	create_shader_configs(){
		return [
			new ShaderConfig('vertex', ['position', 'uv'], []),
			new ShaderConfig('fragment', ['color', 'alpha'], ['vertex']),
		]
	}
	static add_output_params(output_child){
		output_child.add_param( ParamType.VECTOR, 'position', [0,0,0], {hidden: true} )
		// output_child.add_param( ParamType.VECTOR, 'normal', [0,0,0], {hidden: true} )
		output_child.add_param( ParamType.COLOR, 'color', [1,1,1], {hidden: true} )
		output_child.add_param( ParamType.FLOAT, 'alpha', 1, {hidden: true} )
		output_child.add_param( ParamType.VECTOR2, 'uv', [0,0], {hidden: true} )
	}
	add_output_params(output_child){
		ShaderAssemblerLine.add_output_params(output_child)
	}
	static create_globals_node_output_connections(){
		return [
			new Connection.Vec3('position'),
			// new Connection.Vec3('normal'),
			new Connection.Vec3('color'),
			new Connection.Vec2('uv'),
			new Connection.Vec4('gl_FragCoord'),
			new Connection.Vec2('resolution'),
			// new Connection.Vec2('gl_PointCoord'),
			// new TypedConnectionVec2('uv'),
			new Connection.Float('frame')
		]
	}
	create_globals_node_output_connections(){
		return ShaderAssemblerLine.create_globals_node_output_connections()
	}
	create_variable_configs(){
		return [
			new VariableConfig('position', {
				default: 'vec3( position )',
				prefix: 'vec3 transformed = ',
				suffix: ';vec4 mvPosition = modelViewMatrix * vec4( transformed, 1.0 )'
			}),
			// new VariableConfig('normal', {
			// 	prefix: 'objectNormal = '
			// }),
			new VariableConfig('color', {
				prefix: 'diffuseColor.xyz = '
			}),
			new VariableConfig('alpha', {
				prefix: 'diffuseColor.w = '
			}),
			new VariableConfig('uv', {
				// default_from_attribute: true,
				prefix: 'vUv = ',
				if: GlobalsGeometryHandler.IF_RULE.uv
			})
		]
	}
	protected lines_to_remove(shader_name){
		return {
			vertex: ['#include <begin_vertex>', 'vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );'],
			fragment: []
		}[shader_name]
	}

}
