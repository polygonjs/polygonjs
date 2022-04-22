import {ShaderLib} from 'three';
import {ShaderAssemblerMesh} from './_BaseMesh';
import {MeshBasicMaterial} from 'three';

export class ShaderAssemblerBasic extends ShaderAssemblerMesh {
	override templateShader() {
		const template = ShaderLib.basic;
		return {
			vertexShader: template.vertexShader,
			fragmentShader: template.fragmentShader,
			uniforms: template.uniforms,
		};
	}
	override createMaterial() {
		const material = new MeshBasicMaterial();
		this._addCustomMaterials(material);
		return material;
	}
}
