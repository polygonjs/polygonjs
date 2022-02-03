import {ShaderAssemblerMaterial, CustomAssemblerMap} from './_BaseMaterial';

const ASSEMBLER_MAP: CustomAssemblerMap = new Map([]);

export abstract class BaseShaderAssemblerVolume extends ShaderAssemblerMaterial {
	override customAssemblerClassByCustomName(): CustomAssemblerMap {
		return ASSEMBLER_MAP;
	}
}
