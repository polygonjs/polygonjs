import {VertexColors} from 'three/src/constants'
import {UniformsUtils} from 'three/src/renderers/shaders/UniformsUtils'
import {ShaderMaterial} from 'three/src/materials/ShaderMaterial'
import {ShaderLib} from 'three/src/renderers/shaders/ShaderLib'
import {MeshStandardMaterial} from 'three/src/materials/MeshStandardMaterial'
import {MeshPhysicalMaterial} from 'three/src/materials/MeshPhysicalMaterial'
import {Material} from 'three/src/materials/Material'
import {FrontSide} from 'three/src/constants'
const THREE = {FrontSide, Material, MeshPhysicalMaterial, MeshStandardMaterial, ShaderLib, ShaderMaterial, UniformsUtils, VertexColors}

import {ParamType} from 'src/Engine/Param/_Module'
import {ShaderAssemblerMesh} from './_BaseMesh'
import {BaseShaderAssembler} from './_Base'
import {Connection} from 'src/Engine/Node/Gl/GlData'
import {ShaderConfig} from './Config/ShaderConfig'
import {VariableConfig} from './Config/VariableConfig'

import metalnessmap_fragment from '../Gl/ShaderLib/ShaderChunk/metalnessmap_fragment.glsl'
import roughnessmap_fragment from '../Gl/ShaderLib/ShaderChunk/roughnessmap_fragment.glsl'


export class ShaderAssemblerStandard extends ShaderAssemblerMesh {
	static is_physical(){ return false }

	// _color_declaration() { return 'vec4 diffuseColor' }
	// _template_shader(){ return THREE.ShaderLib.standard }
	_template_shader(){
		const template = this.constructor.is_physical() ? THREE.ShaderLib.physical : THREE.ShaderLib.standard
		return {
			vertexShader: template.vertexShader, //TemplateVertex,
			fragmentShader: template.fragmentShader, //TemplateFragment,
			uniforms: template.uniforms,
		}
	}

	_create_material(){
		const template_shader = this._template_shader()

		const options = {

			vertexColors: THREE.VertexColors,
			side: THREE.FrontSide,
			transparent: true,
			fog: true,
			lights: true,
			depthTest: true,
			alphaTest: 0.5,
			// defines: {
			// 	USE_UV: 1,
			// 	USE_COLOR: 1,
			// },

			uniforms: THREE.UniformsUtils.clone( template_shader.uniforms ),
			vertexShader: template_shader.vertexShader,
			fragmentShader: template_shader.fragmentShader
		}
		// if(this.constructor.is_physical()){
		// 	options['defines'] = {
		// 		PHYSICAL: 1
		// 	}
		// }

		const material = new THREE.ShaderMaterial(options)

		// replace some shader chunks
		material.onBeforeCompile = function ( shader ) {
			shader.fragmentShader = shader.fragmentShader.replace(
				'#include <metalnessmap_fragment>',
				metalnessmap_fragment
			)
			shader.fragmentShader = shader.fragmentShader.replace(
				'#include <roughnessmap_fragment>',
				roughnessmap_fragment
			)
		}

		return material
	}

	static convert_material_to_gltf_supported(material: THREE.ShaderMaterial): THREE.Material{
		const gltf_constructor = this.is_physical() ? THREE.MeshPhysicalMaterial : THREE.MeshStandardMaterial
		const options = {}
		this._match_uniform('color', options, material, 'diffuse')
		this._match_uniform('map', options, material)
		this._match_uniform('envMap', options, material)
		this._match_uniform('envMapIntensity', options, material)
		this._match_uniform('metalness', options, material)
		this._match_uniform('roughness', options, material)
		const gltf_material = new gltf_constructor(options)
		return gltf_material
	}


	add_output_params(output_child){
		BaseShaderAssembler.add_output_params(output_child)
		output_child.add_param( ParamType.FLOAT, 'metalness', 1 )
		output_child.add_param( ParamType.FLOAT, 'roughness', 1 )
	}
	// create_globals_node_output_connections(){
	// 	return BaseShaderAssembler.create_globals_node_output_connections().concat([
	// 		new Connection.Float('metalness'),
	// 		new Connection.Float('roughness'),
	// 	])
	// }
	create_shader_configs(){
		return [
			new ShaderConfig('vertex', ['position', 'normal', 'uv'], []),
			new ShaderConfig('fragment', ['color', 'alpha', 'metalness', 'roughness'], ['vertex']),
		]
	}
	create_variable_configs(){
		return BaseShaderAssembler.create_variable_configs().concat([
			new VariableConfig('metalness', {
				default: '1.0',
				prefix: 'float POLY_metalness = ',
			}),
			new VariableConfig('roughness', {
				default: '1.0',
				prefix: 'float POLY_roughness = ',
			}),
		])
	}
}
