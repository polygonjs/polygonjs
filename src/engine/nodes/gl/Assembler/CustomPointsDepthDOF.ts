import {UniformsUtils} from 'three/src/renderers/shaders/UniformsUtils';
import {ShaderMaterial} from 'three/src/materials/ShaderMaterial';
// import {ShaderLib} from 'three/src/renderers/shaders/ShaderLib'
// import {RGBADepthPacking} from 'three/src/constants'
// import {BasicDepthPacking} from 'three/src/constants'

import {ShaderAssemblerRender} from './_BaseRender';

import TemplateVertex from './Template/CustomPointsDepthDOF.vert.glsl';
import TemplateFragment from './Template/CustomMeshDepthDOF.frag.glsl';

export class ShaderAssemblerCustomPointsDepthDOF extends ShaderAssemblerRender {
	// _color_declaration() { return 'vec4 diffuseColor' }
	// _template_shader(){ return ShaderLib.standard }
	_template_shader() {
		return {
			vertexShader: TemplateVertex,
			fragmentShader: TemplateFragment,
			uniforms: {
				size: {value: 1},
				scale: {value: 1},
				mNear: {value: 0},
				mFar: {value: 10},
			},
		};
	}
	protected insert_define_after(shader_name) {
		return {
			vertex: '// INSERT DEFINES',
		}[shader_name];
	}
	protected insert_body_after(shader_name) {
		return {
			vertex: '// INSERT BODY',
			// fragment: 'vec4 diffuseColor = vec4( 1.0 );' // do not change? unless there is a texture lookup
		}[shader_name];
	}

	_create_material() {
		const template_shader = this._template_shader();
		return new ShaderMaterial({
			// defines: {
			// 	DEPTH_PACKING: [RGBADepthPacking, BasicDepthPacking][0]
			// },
			depthTest: true,
			defines: {
				USE_SIZEATTENUATION: 1,
			},

			uniforms: UniformsUtils.clone(template_shader.uniforms),
			vertexShader: template_shader.vertexShader,
			fragmentShader: template_shader.fragmentShader,
		});
	}
}
