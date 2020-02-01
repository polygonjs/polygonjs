
import {ShaderAssemblerRender} from './_BaseRender'

import {ShaderAssemblerCustomMeshDistance} from './CustomMeshDistance'
import {ShaderAssemblerCustomMeshDepth} from './CustomMeshDepth'
import {ShaderAssemblerCustomMeshDepthDOF} from './CustomMeshDepthDOF'


export abstract class ShaderAssemblerMesh extends ShaderAssemblerRender {

	// TODO: I've noticed a case where instances would not display when those shadow shaders were exported
	// But the objects display fine if those are not assigned
	// so it could be a bug at render time (not sure if my code, threejs or hardware)
	custom_assembler_class_by_custom_name(){
		return {
			customDistanceMaterial: ShaderAssemblerCustomMeshDistance,
			customDepthMaterial: ShaderAssemblerCustomMeshDepth,
			customDepthDOFMaterial: ShaderAssemblerCustomMeshDepthDOF,
		}
	}

}
