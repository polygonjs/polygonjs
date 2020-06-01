import {AssemblerName} from '../../src/engine/poly/registers/assemblers/_BaseRegister';
import {Poly} from '../../src/engine/Poly';

export class AssemblersUtils {
	static async with_unregistered_assembler(name: AssemblerName, callback: () => Promise<unknown>) {
		const pair = Poly.instance().assemblers_register.unregister_assembler(name);

		await callback();

		Poly.instance().assemblers_register.register_assembler(name, pair!.controller, pair!.assembler);
	}
}
