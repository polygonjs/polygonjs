import {AssemblersMap} from './All';
import {BaseAssemblersRegister, AssemblerName} from './_BaseRegister';
import {BaseNodeType} from '../../../nodes/_Base';

export class AssemblersRegister extends BaseAssemblersRegister {
	assembler<K extends keyof AssemblersMap>(node: BaseNodeType, name: K): AssemblersMap[K]['controller'] | undefined {
		const pair = this._controllerAssemblerByName.get(name as AssemblerName);
		if (pair) {
			const {controller, assembler} = pair;
			return new controller(node, assembler);
		}
		return pair;
	}

	override unregister<K extends keyof AssemblersMap>(name: K) {
		const pair = this._controllerAssemblerByName.get(name as AssemblerName);
		super.unregister(name as AssemblerName);
		return pair;
	}
}
