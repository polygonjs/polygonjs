import {UniformsUtils} from 'three/src/renderers/shaders/UniformsUtils';
import {ShaderMaterial} from 'three/src/materials/ShaderMaterial';
import {ShaderLib} from 'three/src/renderers/shaders/ShaderLib';
import {RGBADepthPacking} from 'three/src/constants';
import {BasicDepthPacking} from 'three/src/constants';

import {ShaderAssemblerRender} from './_BaseRender';

import TemplateVertex from './Template/CustomPointsDistance.vert.glsl';

export class ShaderAssemblerCustomPointsDistance extends ShaderAssemblerRender {
	// _color_declaration() { return 'vec4 diffuseColor' }
	// _template_shader(){ return ShaderLib.standard }
	get _template_shader() {
		const template = ShaderLib.distanceRGBA;

		const uniforms = UniformsUtils.clone(template.uniforms);
		uniforms['size'] = {value: 1};
		uniforms['scale'] = {value: 1};

		return {
			vertexShader: TemplateVertex,
			fragmentShader: template.fragmentShader, //TemplateFragment,
			uniforms: uniforms,
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
		}[shader_name];
	}

	_create_material() {
		const template_shader = this._template_shader();
		return new ShaderMaterial({
			// vertexColors: VertexColors,
			// side: FrontSide,
			// transparent: true,
			// fog: true,
			// lights: true,
			defines: {
				USE_SIZEATTENUATION: 1,
				DEPTH_PACKING: [RGBADepthPacking, BasicDepthPacking][0],
			},

			uniforms: UniformsUtils.clone(template_shader.uniforms),
			vertexShader: template_shader.vertexShader,
			fragmentShader: template_shader.fragmentShader,
		});
	}
}
