import {VertexColors} from 'three/src/constants';
import {UniformsUtils} from 'three/src/renderers/shaders/UniformsUtils';
import {ShaderMaterial} from 'three/src/materials/ShaderMaterial';
import {ShaderLib} from 'three/src/renderers/shaders/ShaderLib';
import {FrontSide} from 'three/src/constants';

import {ShaderAssemblerMesh} from './_BaseMesh';

// import TemplateVertex from './Template/Basic.vert.glsl'
// import TemplateFragment from './Template/Basic.frag.glsl'

export class ShaderAssemblerBasic extends ShaderAssemblerMesh {
	// _color_declaration() { return 'gl_FragColor' }
	get _template_shader() {
		const template = ShaderLib.basic;
		return {
			vertexShader: template.vertexShader, //TemplateVertex,
			fragmentShader: template.fragmentShader, //TemplateFragment,
			uniforms: template.uniforms,
		};
	}
	_create_material() {
		const template_shader = this._template_shader;

		return new ShaderMaterial({
			vertexColors: VertexColors,
			side: FrontSide,
			transparent: true,
			fog: true,
			lights: false,
			depthTest: true,
			alphaTest: 0.5,

			uniforms: UniformsUtils.clone(template_shader.uniforms),
			vertexShader: template_shader.vertexShader,
			fragmentShader: template_shader.fragmentShader,
		});
	}
}
