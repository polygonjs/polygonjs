import { AssemblerName } from '../../src/engine/poly/registers/assemblers/_BaseRegister';
export declare class AssemblersUtils {
    static with_unregistered_assembler(name: AssemblerName, callback: () => Promise<unknown>): Promise<void>;
}
