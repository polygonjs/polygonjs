import { ModulesMap } from './All';
import { BaseModulesRegister } from './_BaseRegister';
export declare class DynamicModulesRegister extends BaseModulesRegister {
    module<K extends keyof ModulesMap>(name: K): Promise<ModulesMap[K] | undefined>;
}
