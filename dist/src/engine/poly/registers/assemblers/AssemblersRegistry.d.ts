import { AssemblersMap } from './All';
import { BaseAssemblersRegister } from './_BaseRegister';
import { BaseNodeType } from '../../../nodes/_Base';
export declare class AssemblersRegister extends BaseAssemblersRegister {
    assembler<K extends keyof AssemblersMap>(node: BaseNodeType, name: K): AssemblersMap[K]['controller'] | undefined;
    unregister<K extends keyof AssemblersMap>(name: K): import("./_BaseRegister").ControllerAssemblerPair | undefined;
}
