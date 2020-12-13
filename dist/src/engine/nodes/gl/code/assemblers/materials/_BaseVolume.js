import {ShaderAssemblerMaterial} from "./_BaseMaterial";
const ASSEMBLER_MAP = new Map([]);
export class BaseShaderAssemblerVolume extends ShaderAssemblerMaterial {
  custom_assembler_class_by_custom_name() {
    return ASSEMBLER_MAP;
  }
}
