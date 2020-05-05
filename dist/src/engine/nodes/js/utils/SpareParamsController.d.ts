import { BaseJsNodeType } from '../_Base';
export declare class JsNodeSpareParamsController {
    private node;
    private _allow_inputs_created_from_params;
    private _inputless_param_names;
    private _raw_input_serialized_by_param_name;
    private _default_value_serialized_by_param_name;
    constructor(node: BaseJsNodeType);
    disallow_inputs_created_from_params(): void;
    initialize_node(): void;
    create_inputs_from_params(): void;
    set_inputless_param_names(names: string[]): string[];
    create_spare_parameters(): void;
}
