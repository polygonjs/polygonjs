import {UniformsUtils} from 'three/src/renderers/shaders/UniformsUtils';
import {ShaderMaterial} from 'three/src/materials/ShaderMaterial';
// import {ShaderLib} from 'three/src/renderers/shaders/ShaderLib';
// import {RGBADepthPacking} from 'three/src/constants';
// import {BasicDepthPacking} from 'three/src/constants';

import {ShaderAssemblerRender} from './_BaseRender';

import TemplateVertex from './Template/CustomMeshDepthDOF.vert.glsl';
import TemplateFragment from './Template/CustomMeshDepthDOF.frag.glsl';
import {ShaderName} from '../../utils/shaders/ShaderName';

const INSERT_DEFINE_AFTER_MAP: Map<ShaderName, string> = new Map([[ShaderName.VERTEX, '// INSERT DEFINES']]);
const INSERT_BODY_AFTER_MAP: Map<ShaderName, string> = new Map([[ShaderName.VERTEX, '// INSERT BODY']]);
// fragment: 'vec4 diffuseColor = vec4( 1.0 );' // do not change? unless there is a texture lookup

export class ShaderAssemblerCustomMeshDepthDOF extends ShaderAssemblerRender {
	// _color_declaration() { return 'vec4 diffuseColor' }
	// _template_shader(){ return ShaderLib.standard }
	get _template_shader() {
		return {
			vertexShader: TemplateVertex,
			fragmentShader: TemplateFragment,
			uniforms: {
				mNear: {value: 0},
				mFar: {value: 10},
			},
		};
	}
	protected insert_define_after(shader_name: ShaderName) {
		return INSERT_DEFINE_AFTER_MAP.get(shader_name);
	}
	protected insert_body_after(shader_name: ShaderName) {
		return INSERT_BODY_AFTER_MAP.get(shader_name);
	}

	_create_material() {
		const template_shader = this._template_shader;
		return new ShaderMaterial({
			// defines: {
			// 	DEPTH_PACKING: [RGBADepthPacking, BasicDepthPacking][0]
			// },

			uniforms: UniformsUtils.clone(template_shader.uniforms),
			vertexShader: template_shader.vertexShader,
			fragmentShader: template_shader.fragmentShader,
		});
	}
}
