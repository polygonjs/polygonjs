import { BaseOperation } from '../_Base';
import { BaseOperationContainer } from './_Base';
import { NodeContext } from '../../../engine/poly/NodeContext';
import { ParamsInitData } from '../../../engine/nodes/utils/io/IOController';
import { Texture } from 'three/src/textures/Texture';
export declare class BaseCopOperation extends BaseOperation {
    static context(): NodeContext;
    cook(input_contents: Texture[], params: any): Texture | Promise<Texture> | void;
}
export declare type OperationInputsMap = WeakMap<CopOperationContainer, Map<number, number>>;
export declare class CopOperationContainer extends BaseOperationContainer {
    protected operation: BaseCopOperation;
    protected name: string;
    protected init_params: ParamsInitData;
    constructor(operation: BaseCopOperation, name: string, init_params: ParamsInitData);
    protected _inputs: CopOperationContainer[];
    private _current_input_index;
    add_input(input: CopOperationContainer): void;
    increment_input_index(): void;
    current_input_index(): number;
    compute(input_contents: Texture[], operation_inputs_map: OperationInputsMap): Promise<void | Texture>;
}
