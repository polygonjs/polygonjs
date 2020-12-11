import { InputsController } from '../InputsController';
import { InputCloneMode } from '../../../../../engine/poly/InputCloneMode';
export declare class ClonedStatesController {
    protected inputs_controller: InputsController;
    private _cloned_states;
    private _cloned_state;
    private _clone_required_states;
    private _overridden;
    constructor(inputs_controller: InputsController);
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
