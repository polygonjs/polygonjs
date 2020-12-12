import { BaseOperationContainer } from './_Base';
import { BaseSopOperation } from '../sop/_Base';
import { ParamsInitData } from '../../../engine/nodes/utils/io/IOController';
import { CoreGroup } from '../../geometry/Group';
export declare type OperationInputsMap = WeakMap<SopOperationContainer, Map<number, number>>;
export declare class SopOperationContainer extends BaseOperationContainer {
    protected operation: BaseSopOperation;
    protected name: string;
    protected init_params: ParamsInitData;
    constructor(operation: BaseSopOperation, name: string, init_params: ParamsInitData);
    protected _inputs: SopOperationContainer[];
    private _current_input_index;
    add_input(input: SopOperationContainer): void;
    increment_input_index(): void;
    current_input_index(): number;
    private _compute_result;
    private _dirty;
    set_dirty(): void;
    compute(input_contents: CoreGroup[], operation_inputs_map: OperationInputsMap): Promise<CoreGroup | undefined>;
}
