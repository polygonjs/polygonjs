import { InputCloneMode } from '../../../../engine/poly/InputCloneMode';
import { BaseOperationContainer } from '../_Base';
export declare class InputsController {
    private operation_container;
    constructor(operation_container: BaseOperationContainer);
    inputs_count(): number;
    private _cloned_states_controller;
    init_inputs_cloned_state(states: InputCloneMode | InputCloneMode[]): void;
    clone_required(index: number): boolean;
    override_cloned_state(state: boolean): void;
}
