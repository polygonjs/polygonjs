import { PolyScene } from '../scene/PolyScene';
import { CoreGraphNode } from '../../core/graph/CoreGraphNode';
import { UIData } from './utils/UIData';
import { FlagsController, FlagsControllerD } from './utils/FlagsController';
import { StatesController } from './utils/StatesController';
import { HierarchyParentController } from './utils/hierarchy/ParentController';
import { HierarchyChildrenController } from './utils/hierarchy/ChildrenController';
import { LifeCycleController } from './utils/LifeCycleController';
import { TypedContainerController } from './utils/ContainerController';
import { NodeCookController } from './utils/CookController';
import { NameController } from './utils/NameController';
import { NodeSerializer, NodeSerializerData } from './utils/Serializer';
import { ParamsController } from './utils/params/ParamsController';
import { ParamConstructorMap } from '../params/types/ParamConstructorMap';
import { ParamInitValuesTypeMap } from '../params/types/ParamInitValuesTypeMap';
import { NodeParamsConfig } from './utils/params/ParamsConfig';
import { ParamsValueAccessorType } from './utils/params/ParamsValueAccessor';
import { IOController } from './utils/io/IOController';
import { NodeEvent } from '../poly/NodeEvent';
import { NodeContext } from '../poly/NodeContext';
import { ParamsAccessorType } from './utils/params/ParamsAccessor';
export interface NodeDeletedEmitData {
    parent_id: string;
}
export interface NodeCreatedEmitData {
    child_node_json: NodeSerializerData;
}
declare type EmitDataByNodeEventMapGeneric = {
    [key in NodeEvent]: any;
};
export interface EmitDataByNodeEventMap extends EmitDataByNodeEventMapGeneric {
    [NodeEvent.CREATED]: NodeCreatedEmitData;
    [NodeEvent.DELETED]: NodeDeletedEmitData;
    [NodeEvent.ERROR_UPDATED]: undefined;
}
export interface IntegrationData {
    name: string;
    data: Dictionary<string>;
}
import { ContainableMap } from '../containers/utils/ContainableMap';
import { ParamOptions } from '../params/utils/OptionsController';
import { ParamType } from '../poly/ParamType';
import { DisplayNodeController } from './utils/DisplayNodeController';
import { NodeTypeMap } from '../containers/utils/ContainerMap';
import { ParamInitValueSerialized } from '../params/types/ParamInitValueSerialized';
import { ModuleName } from '../poly/registers/modules/_BaseRegister';
import { BasePersistedConfig } from './utils/PersistedConfig';
import { AssemblerName } from '../poly/registers/assemblers/_BaseRegister';
import { PolyNodeController } from './utils/poly/PolyNodeController';
export declare class TypedNode<NC extends NodeContext, K extends NodeParamsConfig> extends CoreGraphNode {
    params_init_value_overrides?: Dictionary<ParamInitValueSerialized> | undefined;
    container_controller: TypedContainerController<NC>;
    private _parent_controller;
    private _ui_data;
    private _states;
    private _lifecycle;
    private _serializer;
    private _cook_controller;
    readonly flags: FlagsController | undefined;
    readonly display_node_controller: DisplayNodeController | undefined;
    readonly persisted_config: BasePersistedConfig | undefined;
    private _params_controller;
    readonly params_config: K | undefined;
    readonly pv: ParamsValueAccessorType<K>;
    readonly p: ParamsAccessorType<K>;
    private _name_controller;
    get parent_controller(): HierarchyParentController;
    static displayed_input_names(): string[];
    private _children_controller;
    protected _children_controller_context: NodeContext | undefined;
    get children_controller_context(): NodeContext | undefined;
    private _create_children_controller;
    get children_controller(): HierarchyChildrenController | undefined;
    children_allowed(): boolean;
    get ui_data(): UIData;
    get states(): StatesController;
    get lifecycle(): LifeCycleController;
    get serializer(): NodeSerializer;
    get cook_controller(): NodeCookController<NC>;
    protected _io: IOController<NC> | undefined;
    get io(): IOController<NC>;
    get name_controller(): NameController;
    set_name(name: string): void;
    _set_core_name(name: string): void;
    get params(): ParamsController;
    constructor(scene: PolyScene, name?: string, params_init_value_overrides?: Dictionary<ParamInitValueSerialized> | undefined);
    private _initialized;
    initialize_base_and_node(): void;
    protected initialize_base_node(): void;
    protected initialize_node(): void;
    static type(): string;
    get type(): string;
    static node_context(): NodeContext;
    node_context(): NodeContext;
    static require_webgl2(): boolean;
    require_webgl2(): boolean;
    set_parent(parent: BaseNodeType | null): void;
    get parent(): BaseNodeType | null;
    get root(): import("./manager/ObjectsManager").ObjectsManagerNode;
    full_path(relative_to_parent?: BaseNodeType): string;
    create_params(): void;
    add_param<T extends ParamType>(type: T, name: string, default_value: ParamInitValuesTypeMap[T], options?: ParamOptions): ParamConstructorMap[T] | undefined;
    param_default_value(name: string): ParamInitValueSerialized;
    cook(input_contents: any[]): any;
    request_container(): Promise<import("../containers/utils/ContainerMap").ContainerMap[NC]>;
    set_container(content: ContainableMap[NC], message?: string | null): void;
    create_node(type: string, params_init_value_overrides?: Dictionary<ParamInitValueSerialized>): BaseNodeType | undefined;
    remove_node(node: BaseNodeType): void;
    children(): BaseNodeType[];
    node(path: string): BaseNodeType | null;
    node_sibbling(name: string): NodeTypeMap[NC] | null;
    nodes_by_type(type: string): BaseNodeType[];
    set_input(input_index_or_name: number | string, node: NodeTypeMap[NC] | null, output_index_or_name?: number | string): void;
    emit(event_name: NodeEvent.CREATED, data: EmitDataByNodeEventMap[NodeEvent.CREATED]): void;
    emit(event_name: NodeEvent.DELETED, data: EmitDataByNodeEventMap[NodeEvent.DELETED]): void;
    emit(event_name: NodeEvent.NAME_UPDATED): void;
    emit(event_name: NodeEvent.OVERRIDE_CLONABLE_STATE_UPDATE): void;
    emit(event_name: NodeEvent.NAMED_INPUTS_UPDATED): void;
    emit(event_name: NodeEvent.NAMED_OUTPUTS_UPDATED): void;
    emit(event_name: NodeEvent.INPUTS_UPDATED): void;
    emit(event_name: NodeEvent.PARAMS_UPDATED): void;
    emit(event_name: NodeEvent.UI_DATA_POSITION_UPDATED): void;
    emit(event_name: NodeEvent.UI_DATA_COMMENT_UPDATED): void;
    emit(event_name: NodeEvent.ERROR_UPDATED): void;
    emit(event_name: NodeEvent.FLAG_BYPASS_UPDATED): void;
    emit(event_name: NodeEvent.FLAG_DISPLAY_UPDATED): void;
    emit(event_name: NodeEvent.SELECTION_UPDATED): void;
    to_json(include_param_components?: boolean): NodeSerializerData;
    required_modules(): ModuleName[] | void;
    used_assembler(): AssemblerName | void;
    integration_data(): IntegrationData | void;
    readonly poly_node_controller: PolyNodeController | undefined;
}
export declare type BaseNodeType = TypedNode<any, any>;
export declare class BaseNodeClass extends TypedNode<any, any> {
}
export declare class BaseNodeClassWithDisplayFlag extends TypedNode<any, any> {
    readonly flags: FlagsControllerD;
}
export {};
