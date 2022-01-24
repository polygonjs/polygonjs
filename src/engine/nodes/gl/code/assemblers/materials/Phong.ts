import {UniformsUtils} from 'three/src/renderers/shaders/UniformsUtils';
import {ShaderMaterial} from 'three/src/materials/ShaderMaterial';
import {ShaderLib} from 'three/src/renderers/shaders/ShaderLib';
import {ShaderAssemblerMesh} from './_BaseMesh';

export class ShaderAssemblerPhong extends ShaderAssemblerMesh {
	override templateShader() {
		const template = ShaderLib.phong;
		return {
			vertexShader: template.vertexShader,
			fragmentShader: template.fragmentShader,
			uniforms: template.uniforms,
		};
	}
	override createMaterial() {
		const template_shader = this.templateShader();
		const material = new ShaderMaterial({
			lights: true,

			uniforms: UniformsUtils.clone(template_shader.uniforms),
			vertexShader: template_shader.vertexShader,
			fragmentShader: template_shader.fragmentShader,
		});
		this._addCustomMaterials(material);
		return material;
	}
}
