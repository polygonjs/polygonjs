import {ShaderAssemblerStandard} from './Standard';
import originalTransmissionFragment from 'three/src/renderers/shaders/ShaderChunk/transmission_fragment.glsl';
import {AssemblerGlControllerNode} from '../../Controller';
import {MeshPhysicalMaterial} from 'three';
function addPolyTransmission(fragment: string) {
	const transmission = 'material.transmission = transmission;';
	const thickness = 'material.thickness = thickness;';
	const lines = fragment.split('\n');
	let cmptr = 0;
	for (let line of lines) {
		if (line.includes(transmission)) {
			line = line.replace(transmission, 'material.transmission = transmission * POLY_transmission;');
			lines[cmptr] = line;
		}
		if (line.includes(thickness)) {
			line = line.replace(thickness, 'material.thickness = thickness * POLY_thickness;');
			lines[cmptr] = line;
		}
		cmptr++;
	}
	return lines.join('\n');
}

export class ShaderAssemblerPhysical extends ShaderAssemblerStandard {
	constructor(protected override _gl_parent_node: AssemblerGlControllerNode) {
		super(_gl_parent_node);

		this._addFilterFragmentShaderCallback(
			'MeshPhysicalBuilderMatNode',
			ShaderAssemblerPhysical.filterFragmentShader
		);
	}
	override isPhysical() {
		return true;
	}
	static override filterFragmentShader(fragmentShader: string) {
		fragmentShader = fragmentShader.replace(
			'#include <transmission_fragment>',
			addPolyTransmission(originalTransmissionFragment)
		);
		return fragmentShader;
	}
	override createMaterial() {
		// const template_shader = this.templateShader();

		// const options = {
		// 	lights: true,
		// 	extensions: {
		// 		derivatives: true,
		// 	},

		// 	uniforms: UniformsUtils.clone(template_shader.uniforms),
		// 	vertexShader: template_shader.vertexShader,
		// 	fragmentShader: template_shader.fragmentShader,
		// };

		// const material = new ShaderMaterial(options);
		const material = new MeshPhysicalMaterial() as any;

		// if (this.isPhysical()) {
		// 	material.defines.PHYSICAL = true;
		// }

		this._addCustomMaterials(material);

		return material;
	}
}
