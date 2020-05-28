import {AssemblerName, ControllerAssemblerPair} from './_BaseRegister';
import {GlAssemblerController} from '../../../nodes/gl/code/Controller';
import {ShaderAssemblerBasic} from '../../../nodes/gl/code/assemblers/materials/Basic';

export interface AssemblersMap extends Dictionary<ControllerAssemblerPair> {
	[AssemblerName.GL_MESH_BASIC]: {
		controller: GlAssemblerController<ShaderAssemblerBasic>;
		assembler: typeof ShaderAssemblerBasic;
	};
}

import {Poly} from '../../../Poly';
export class AllAssemblersRegister {
	static run(poly: Poly) {
		poly.assemblers_register.register_assembler(
			AssemblerName.GL_MESH_BASIC,
			GlAssemblerController,
			ShaderAssemblerBasic
		);
	}
}
