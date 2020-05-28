import {DynamicModulesMap} from './All';
import {BaseDynamicModulesRegister} from './_BaseRegister';

export class DynamicModulesRegister extends BaseDynamicModulesRegister {
	async module<K extends keyof DynamicModulesMap>(name: K): Promise<DynamicModulesMap[K] | undefined> {
		return await super.module(name as any);
	}
}
