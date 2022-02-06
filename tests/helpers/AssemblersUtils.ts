import {AssemblerName, ControllerAssemblerPair} from '../../src/engine/poly/registers/assemblers/_BaseRegister';
import {Poly} from '../../src/engine/Poly';
import {CoreType} from '../../src/core/Type';

interface AssemblerNameWithPair {
	pair: ControllerAssemblerPair;
	name: AssemblerName;
}
export class AssemblersUtils {
	static async withoutAssemblers(callback: () => Promise<unknown>) {
		const names: AssemblerName[] = [];
		Poly.assemblersRegister.traverse((pair, assemblerName) => {
			names.push(assemblerName);
		});
		await this.withUnregisteredAssembler(names, callback);
	}

	static async withUnregisteredAssembler(name: AssemblerName | AssemblerName[], callback: () => Promise<unknown>) {
		const pairsWithName: AssemblerNameWithPair[] = [];
		if (CoreType.isArray(name)) {
			for (let n of name) {
				const pair = Poly.assemblersRegister.unregister(n);
				if (pair) {
					pairsWithName.push({pair, name: n});
				}
			}
		} else {
			const pair = Poly.assemblersRegister.unregister(name);
			if (pair) {
				pairsWithName.push({pair, name});
			}
		}

		try {
			await callback();
		} catch (err) {
			console.log(`%c !!! ${QUnit.config.current.testName} crash`, 'background: #f00; color: #fff');
			console.log(err);
		}

		for (let pairWithName of pairsWithName) {
			Poly.assemblersRegister.register(
				pairWithName.name,
				pairWithName.pair!.controller,
				pairWithName.pair!.assembler
			);
		}
	}
}
