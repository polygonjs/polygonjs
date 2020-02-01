import {VertexColors} from 'three/src/constants'
import {UniformsUtils} from 'three/src/renderers/shaders/UniformsUtils'
import {ShaderMaterial} from 'three/src/materials/ShaderMaterial'
import {ShaderLib} from 'three/src/renderers/shaders/ShaderLib'
import {RGBADepthPacking} from 'three/src/constants'
import {FrontSide} from 'three/src/constants'
import {BasicDepthPacking} from 'three/src/constants'
const THREE = {BasicDepthPacking, FrontSide, RGBADepthPacking, ShaderLib, ShaderMaterial, UniformsUtils, VertexColors}

import {ShaderAssemblerRender} from './_BaseRender'

import TemplateVertex from './Template/CustomPointsDepth.vert.glsl'

export class ShaderAssemblerCustomPointsDepth extends ShaderAssemblerRender {

	// _color_declaration() { return 'vec4 diffuseColor' }
	// _template_shader(){ return THREE.ShaderLib.standard }
	_template_shader(){
		const template = THREE.ShaderLib.depth

		const uniforms = THREE.UniformsUtils.clone(template.uniforms)
		uniforms['size'] = {value: 1}
		uniforms['scale'] = {value: 1}

		return {
			vertexShader: TemplateVertex,
			fragmentShader: template.fragmentShader, //TemplateFragment,
			uniforms: uniforms
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
		}[shader_name]
	}

	_create_material(){
		const template_shader = this._template_shader()
		return new THREE.ShaderMaterial({

			// vertexColors: THREE.VertexColors,
			// side: THREE.FrontSide,
			// transparent: true,
			// fog: true,
			// lights: true,
			defines: {
				USE_SIZEATTENUATION: 1,
				DEPTH_PACKING: [THREE.RGBADepthPacking, THREE.BasicDepthPacking][0]
			},

			uniforms: THREE.UniformsUtils.clone( template_shader.uniforms ),
			vertexShader: template_shader.vertexShader,
			fragmentShader: template_shader.fragmentShader
		})
	}

}
