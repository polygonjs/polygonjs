import {ShaderAssemblerStandard} from './Standard';
import originalTransmissionFragment from 'three/src/renderers/shaders/ShaderChunk/transmission_fragment.glsl';
import {AssemblerControllerNode} from '../../Controller';
function addPolyTransmission(fragment: string) {
	const lines = fragment.split('\n');
	let cmptr = 0;
	for (let line of lines) {
		if (line.includes('float transmissionFactor = transmission;')) {
			line = 'float transmissionFactor = transmission * POLY_transmission;';
			lines[cmptr] = line;
		}
		if (line.includes('float thicknessFactor = thickness;')) {
			line = 'float thicknessFactor = thickness * POLY_thickness;';
			lines[cmptr] = line;
		}
		cmptr++;
	}
	return lines.join('\n');
}

export class ShaderAssemblerPhysical extends ShaderAssemblerStandard {
	constructor(protected override _gl_parent_node: AssemblerControllerNode) {
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
}
