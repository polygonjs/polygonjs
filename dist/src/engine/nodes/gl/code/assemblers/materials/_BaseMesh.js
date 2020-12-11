import {ShaderAssemblerMaterial, CustomMaterialName} from "./_BaseMaterial";
import {ShaderAssemblerCustomMeshDistance} from "./CustomMeshDistance";
import {ShaderAssemblerCustomMeshDepth} from "./CustomMeshDepth";
import {ShaderAssemblerCustomMeshDepthDOF} from "./CustomMeshDepthDOF";
const ASSEMBLER_MAP = new Map([]);
ASSEMBLER_MAP.set(CustomMaterialName.DISTANCE, ShaderAssemblerCustomMeshDistance);
ASSEMBLER_MAP.set(CustomMaterialName.DEPTH, ShaderAssemblerCustomMeshDepth);
ASSEMBLER_MAP.set(CustomMaterialName.DEPTH_DOF, ShaderAssemblerCustomMeshDepthDOF);
export class ShaderAssemblerMesh extends ShaderAssemblerMaterial {
  custom_assembler_class_by_custom_name() {
    return ASSEMBLER_MAP;
  }
}
