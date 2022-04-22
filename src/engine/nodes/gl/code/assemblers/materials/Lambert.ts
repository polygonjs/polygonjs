import {ShaderLib} from 'three';
import {ShaderAssemblerMesh} from './_BaseMesh';
import {MeshLambertMaterial} from 'three';

export class ShaderAssemblerLambert extends ShaderAssemblerMesh {
	override templateShader() {
		const template = ShaderLib.lambert;
		return {
			vertexShader: template.vertexShader,
			fragmentShader: template.fragmentShader,
			uniforms: template.uniforms,
		};
	}
	override createMaterial() {
		const material = new MeshLambertMaterial();
		this._addCustomMaterials(material);
		return material;
	}
}
