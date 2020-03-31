import { BaseGlNodeType } from '../_Base';
export declare class GlNodeSpareParamsController {
    private node;
    private _allow_inputs_created_from_params;
    private _inputless_param_names;
    constructor(node: BaseGlNodeType);
    disallow_inputs_created_from_params(): void;
    initialize_node(): void;
    create_inputs_from_params(): void;
    set_inputless_param_names(names: string[]): string[];
    create_spare_parameters(): void;
}
