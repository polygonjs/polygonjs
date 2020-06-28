import { TypedNode } from '../../_Base';
import { BaseJsFunctionAssembler } from './assemblers/_Base';
import { OutputJsNode } from '../Output';
import { GlobalsJsNode } from '../Globals';
import { JsNodeChildrenMap } from '../../../poly/registers/nodes/Js';
import { BaseJsNodeType } from '../_Base';
import { ParamInitValueSerialized } from '../../../params/types/ParamInitValueSerialized';
export declare class AssemblerControllerNode extends TypedNode<any, any> {
    create_node<K extends keyof JsNodeChildrenMap>(type: K, params_init_value_overrides?: Dictionary<ParamInitValueSerialized>): JsNodeChildrenMap[K];
    children(): BaseJsNodeType[];
    nodes_by_type<K extends keyof JsNodeChildrenMap>(type: K): JsNodeChildrenMap[K][];
    assembler_controller: JsAssemblerController<BaseJsFunctionAssembler>;
}
declare type BaseJsFunctionAssemblerConstructor<A extends BaseJsFunctionAssembler> = new (...args: any[]) => A;
export declare class JsAssemblerController<A extends BaseJsFunctionAssembler> {
    private node;
    protected _assembler: A;
    private _spare_params_controller;
    private _compile_required;
    constructor(node: AssemblerControllerNode, assembler_class: BaseJsFunctionAssemblerConstructor<A>);
    get assembler(): A;
    add_output_inputs(output_child: OutputJsNode): void;
    add_globals_outputs(globals_node: GlobalsJsNode): void;
    allow_attribute_exports(): boolean;
    on_create(): void;
    set_compilation_required(new_state?: boolean): void;
    set_compilation_required_and_dirty(trigger_node?: BaseJsNodeType): void;
    compile_required(): boolean;
    post_compile(): void;
    create_spare_parameters(): void;
}
export declare type JsAssemblerControllerType = JsAssemblerController<BaseJsFunctionAssembler>;
export {};
