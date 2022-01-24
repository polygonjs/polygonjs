import {ShaderAssemblerMaterial, CustomAssemblerMap} from './_BaseMaterial';

const ASSEMBLER_MAP: CustomAssemblerMap = new Map([]);

export abstract class BaseShaderAssemblerVolume extends ShaderAssemblerMaterial {
	override custom_assembler_class_by_custom_name(): CustomAssemblerMap {
		return ASSEMBLER_MAP;
	}
}
