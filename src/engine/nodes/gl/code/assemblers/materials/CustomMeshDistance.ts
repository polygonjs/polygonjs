import {UniformsUtils} from 'three/src/renderers/shaders/UniformsUtils';
import {ShaderMaterial} from 'three/src/materials/ShaderMaterial';
import {ShaderLib} from 'three/src/renderers/shaders/ShaderLib';
import {RGBADepthPacking} from 'three/src/constants';
import {BasicDepthPacking} from 'three/src/constants';

import {ShaderAssemblerMaterial} from './_BaseMaterial';
import {ShaderName} from '../../../../utils/shaders/ShaderName';

const INSERT_BODY_AFTER_MAP: Map<ShaderName, string> = new Map([
	[ShaderName.VERTEX, '#include <begin_vertex>'],
	[ShaderName.FRAGMENT, 'vec4 diffuseColor = vec4( 1.0 );'],
]);

export class ShaderAssemblerCustomMeshDistance extends ShaderAssemblerMaterial {
	// _color_declaration() { return 'vec4 diffuseColor' }
	// _template_shader(){ return ShaderLib.standard }
	get _template_shader() {
		const template = ShaderLib.distanceRGBA;
		return {
			vertexShader: template.vertexShader, //TemplateVertex,
			fragmentShader: template.fragmentShader, //TemplateFragment,
			uniforms: template.uniforms,
		};
	}
	protected insert_body_after(shader_name: ShaderName) {
		return INSERT_BODY_AFTER_MAP.get(shader_name);
	}

	createMaterial() {
		const template_shader = this._template_shader;
		return new ShaderMaterial({
			// vertexColors: VertexColors,
			// side: FrontSide,
			// transparent: true,
			// fog: true,
			// lights: true,
			defines: {
				DEPTH_PACKING: [RGBADepthPacking, BasicDepthPacking][0],
			},

			uniforms: UniformsUtils.clone(template_shader.uniforms),
			vertexShader: template_shader.vertexShader,
			fragmentShader: template_shader.fragmentShader,
		});
	}
}
