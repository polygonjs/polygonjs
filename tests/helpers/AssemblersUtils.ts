import {AssemblerName} from '../../src/engine/poly/registers/assemblers/_BaseRegister';
import {Poly} from '../../src/engine/Poly';

export class AssemblersUtils {
	static async withUnregisteredAssembler(name: AssemblerName, callback: () => Promise<unknown>) {
		const pair = Poly.assemblersRegister.unregister(name);

		await callback();

		Poly.assemblersRegister.register(name, pair!.controller, pair!.assembler);
	}
}
