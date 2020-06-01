import { JsAssemblerControllerType, AssemblerControllerNode } from './Controller';
export declare class JsAssemblerNodeSpareParamsController {
    private _controller;
    private _node;
    private _deleted_params_data;
    private _created_spare_param_names;
    private _raw_input_serialized_by_param_name;
    private _init_value_serialized_by_param_name;
    constructor(_controller: JsAssemblerControllerType, _node: AssemblerControllerNode);
    get assembler(): import("./assemblers/_Base").BaseJsFunctionAssembler;
    create_spare_parameters(): void;
    private _validate_names;
}
