import { TypedNode } from '../../_Base';
import { BaseGlShaderAssembler } from './assemblers/_Base';
import { GlobalsBaseController } from './globals/_Base';
import { OutputGlNode } from '../Output';
import { GlobalsGlNode } from '../Globals';
import { GlNodeChildrenMap } from '../../../poly/registers/nodes/Gl';
import { BaseGlNodeType } from '../_Base';
export declare class BaseGlParentNode extends TypedNode<any, any> {
    create_node<K extends keyof GlNodeChildrenMap>(type: K): GlNodeChildrenMap[K];
    children(): BaseGlNodeType[];
    nodes_by_type<K extends keyof GlNodeChildrenMap>(type: K): GlNodeChildrenMap[K][];
}
export declare class AssemblerControllerNode extends BaseGlParentNode {
    assembler_controller: GlAssemblerController<BaseGlShaderAssembler> | undefined;
}
declare type BaseGlShaderAssemblerConstructor<A extends BaseGlShaderAssembler> = new (...args: any[]) => A;
export declare class GlAssemblerController<A extends BaseGlShaderAssembler> {
    private node;
    protected _assembler: A;
    private _spare_params_controller;
    private _globals_handler;
    private _compile_required;
    constructor(node: AssemblerControllerNode, assembler_class: BaseGlShaderAssemblerConstructor<A>);
    set_assembler_globals_handler(globals_handler: GlobalsBaseController): void;
    get assembler(): A;
    get globals_handler(): GlobalsBaseController | undefined;
    add_output_inputs(output_child: OutputGlNode): void;
    add_globals_outputs(globals_node: GlobalsGlNode): void;
    allow_attribute_exports(): boolean;
    on_create(): void;
    set_compilation_required(new_state?: boolean): void;
    set_compilation_required_and_dirty(trigger_node?: BaseGlNodeType): void;
    compile_required(): boolean;
    post_compile(): void;
    create_spare_parameters(): void;
}
export declare type GlAssemblerControllerType = GlAssemblerController<BaseGlShaderAssembler>;
export {};
