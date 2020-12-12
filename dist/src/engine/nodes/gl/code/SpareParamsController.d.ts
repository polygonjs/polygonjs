import { GlAssemblerControllerType, AssemblerControllerNode } from './Controller';
export declare class AssemblerNodeSpareParamsController {
    private _controller;
    private _node;
    private _deleted_params_data;
    private _created_spare_param_names;
    private _raw_input_serialized_by_param_name;
    private _init_value_serialized_by_param_name;
    constructor(_controller: GlAssemblerControllerType, _node: AssemblerControllerNode);
    get assembler(): import("./assemblers/_Base").BaseGlShaderAssembler;
    create_spare_parameters(): void;
    private _validate_names;
}
