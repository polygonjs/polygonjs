import { TypedSopNode } from './_Base';
import { NodeContext } from '../../poly/NodeContext';
import { CoreGroup } from '../../../core/geometry/Group';
import { JsNodeChildrenMap } from '../../poly/registers/nodes/Js';
import { BaseJsNodeType } from '../js/_Base';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { ParamsInitData } from '../utils/io/IOController';
declare class JsPointSopParamsConfig extends NodeParamsConfig {
}
export declare class JsPointSopNode extends TypedSopNode<JsPointSopParamsConfig> {
    params_config: JsPointSopParamsConfig;
    static type(): string;
    protected _children_controller_context: NodeContext;
    initialize_node(): void;
    create_node<K extends keyof JsNodeChildrenMap>(type: K, params_init_value_overrides?: ParamsInitData): JsNodeChildrenMap[K];
    createNode<K extends valueof<JsNodeChildrenMap>>(node_class: Constructor<K>, params_init_value_overrides?: ParamsInitData): K;
    children(): BaseJsNodeType[];
    nodes_by_type<K extends keyof JsNodeChildrenMap>(type: K): JsNodeChildrenMap[K][];
    cook(input_contents: CoreGroup[]): Promise<void>;
    compile_if_required(): Promise<void>;
    run_assembler(): Promise<void>;
}
export {};
