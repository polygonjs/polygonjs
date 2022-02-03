import {ShaderAssemblerMaterial, CustomAssemblerMap, CustomMaterialName} from './_BaseMaterial';

import {ShaderAssemblerCustomMeshDistance} from './custom/mesh/CustomMeshDistance';
import {ShaderAssemblerCustomMeshDepth} from './custom/mesh/CustomMeshDepth';
import {ShaderAssemblerCustomMeshDepthDOF} from './custom/mesh/CustomMeshDepthDOF';

const ASSEMBLER_MAP: CustomAssemblerMap = new Map([
	// [CustomMaterialName.DISTANCE, ShaderAssemblerCustomMeshDistance],
	// [CustomMaterialName.DEPTH, ShaderAssemblerCustomMeshDepth],
	// [CustomMaterialName.DEPTH_DOF, ShaderAssemblerCustomMeshDepthDOF],
]);
ASSEMBLER_MAP.set(CustomMaterialName.DEPTH, ShaderAssemblerCustomMeshDepth); // for spot lights and directional
ASSEMBLER_MAP.set(CustomMaterialName.DISTANCE, ShaderAssemblerCustomMeshDistance); // for point lights
ASSEMBLER_MAP.set(CustomMaterialName.DEPTH_DOF, ShaderAssemblerCustomMeshDepthDOF); // for CoreScene.withOverridenMaterial
export abstract class ShaderAssemblerMesh extends ShaderAssemblerMaterial {
	// TODO: I've noticed a case where instances would not display when those shadow shaders were exported
	// But the objects display fine if those are not assigned
	// so it could be a bug at render time (not sure if my code, threejs or hardware)
	override customAssemblerClassByCustomName(): CustomAssemblerMap | undefined {
		return ASSEMBLER_MAP;
	}
}
