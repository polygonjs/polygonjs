import { NodeContext } from '../../../../poly/NodeContext';
import { InputCloneMode } from '../../../../poly/InputCloneMode';
import { InputsController } from '../InputsController';
export declare class ClonedStatesController<NC extends NodeContext> {
    private inputs_controller;
    private _cloned_states;
    private _cloned_state;
    private _clone_required_states;
    private _overridden;
    private node;
    constructor(inputs_controller: InputsController<NC>);
    init_inputs_cloned_state(states: InputCloneMode | InputCloneMode[]): void;
    override_cloned_state_allowed(): boolean;
    clone_required_state(index: number): boolean;
    clone_required_states(): boolean | boolean[];
    private _get_clone_required_state;
    private clone_required_from_state;
    override_cloned_state(state: boolean): void;
    overriden(): boolean;
    private _update_clone_required_state;
}
