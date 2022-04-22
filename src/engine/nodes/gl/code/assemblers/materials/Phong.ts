import {ShaderLib} from 'three';
import {ShaderAssemblerMesh} from './_BaseMesh';
import {MeshPhongMaterial} from 'three';

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
		const material = new MeshPhongMaterial();
		this._addCustomMaterials(material);
		return material;
	}
}
