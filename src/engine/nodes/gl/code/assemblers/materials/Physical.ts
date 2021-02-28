import {ShaderAssemblerStandard} from './Standard';

export class ShaderAssemblerPhysical extends ShaderAssemblerStandard {
	isPhysical() {
		return true;
	}
}
