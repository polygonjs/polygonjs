import {ShaderLib, MeshToonMaterial} from 'three';
import {ShaderAssemblerMesh} from './_BaseMesh';

export class ShaderAssemblerToon extends ShaderAssemblerMesh {
	override templateShader() {
		const template = ShaderLib.toon;
		return {
			vertexShader: template.vertexShader,
			fragmentShader: template.fragmentShader,
			uniforms: template.uniforms,
		};
	}
	override createMaterial() {
		const material = new MeshToonMaterial();
		this._addCustomMaterials(material);
		return material;
	}
}
