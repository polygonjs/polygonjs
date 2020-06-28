import { TypedSopNode } from './_Base';
import { ShaderAssemblerParticles } from '../gl/code/assemblers/particles/Particles';
import { NodeContext } from '../../poly/NodeContext';
import { CoreGroup } from '../../../core/geometry/Group';
import { GlAssemblerController } from '../gl/code/Controller';
import { GlNodeChildrenMap } from '../../poly/registers/nodes/Gl';
import { BaseGlNodeType } from '../gl/_Base';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { ParamInitValueSerialized } from '../../params/types/ParamInitValueSerialized';
declare class JsPointSopParamsConfig extends NodeParamsConfig {
}
export declare class JsPointSopNode extends TypedSopNode<JsPointSopParamsConfig> {
    params_config: JsPointSopParamsConfig;
    static type(): string;
    protected _assembler_controller: GlAssemblerController<ShaderAssemblerParticles>;
    get assembler_controller(): GlAssemblerController<ShaderAssemblerParticles>;
    protected _children_controller_context: NodeContext;
    initialize_node(): void;
    create_node<K extends keyof GlNodeChildrenMap>(type: K, params_init_value_overrides?: Dictionary<ParamInitValueSerialized>): GlNodeChildrenMap[K];
    children(): BaseGlNodeType[];
    nodes_by_type<K extends keyof GlNodeChildrenMap>(type: K): GlNodeChildrenMap[K][];
    cook(input_contents: CoreGroup[]): Promise<void>;
    compile_if_required(): Promise<void>;
    run_assembler(): Promise<void>;
    private _find_root_nodes;
}
export {};
