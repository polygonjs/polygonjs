import {ModulesMap} from './All';
import {BaseModulesRegister} from './_BaseRegister';

export class DynamicModulesRegister extends BaseModulesRegister {
	async module<K extends keyof ModulesMap>(name: K): Promise<ModulesMap[K] | undefined> {
		return await super.module(name as any);
	}
}
