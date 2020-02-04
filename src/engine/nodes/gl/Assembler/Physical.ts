import {ShaderAssemblerStandard} from './Standard';

export class ShaderAssemblerPhysical extends ShaderAssemblerStandard {
	is_physical() {
		return true;
	}
}
