import {UniformsUtils} from 'three/src/renderers/shaders/UniformsUtils'
import {ShaderMaterial} from 'three/src/materials/ShaderMaterial'
import {ShaderLib} from 'three/src/renderers/shaders/ShaderLib'
import {RGBADepthPacking} from 'three/src/constants'
import {BasicDepthPacking} from 'three/src/constants'
const THREE = {BasicDepthPacking, RGBADepthPacking, ShaderLib, ShaderMaterial, UniformsUtils}

import {ShaderAssemblerRender} from './_BaseRender'

import TemplateVertex from './Template/CustomLineDepthDOF.vert.glsl'
import TemplateFragment from './Template/CustomMeshDepthDOF.frag.glsl'

export class ShaderAssemblerCustomLineDepthDOF extends ShaderAssemblerRender {

	// _color_declaration() { return 'vec4 diffuseColor' }
	// _template_shader(){ return THREE.ShaderLib.standard }
	_template_shader(){
		return {
			vertexShader: TemplateVertex,
			fragmentShader: TemplateFragment,
			uniforms: {
				scale: {value: 1},
				mNear: {value: 0},
				mFar: {value: 10},
			},
		}
	}
	protected insert_define_after(shader_name){
		return {
			vertex: '// INSERT DEFINES',
		}[shader_name]
	}
	protected insert_body_after(shader_name){
		return {
			vertex: '// INSERT BODY',
			// fragment: 'vec4 diffuseColor = vec4( 1.0 );' // do not change? unless there is a texture lookup
		}[shader_name]
	}

	_create_material(){
		const template_shader = this._template_shader()
		return new THREE.ShaderMaterial({

			// defines: {
			// 	DEPTH_PACKING: [THREE.RGBADepthPacking, THREE.BasicDepthPacking][0]
			// },
			depthTest: true,
			linewidth: 100,

			uniforms: THREE.UniformsUtils.clone( template_shader.uniforms ),
			vertexShader: template_shader.vertexShader,
			fragmentShader: template_shader.fragmentShader
		})
	}

}
