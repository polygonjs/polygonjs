import { PolyScene } from '../scene/PolyScene';
import { CoreGraphNode } from '../../core/graph/CoreGraphNode';
import { UIData } from './utils/UIData';
import { FlagsController } from './utils/FlagsController';
import { StatesController } from './utils/StatesController';
import { HierarchyParentController } from './utils/hierarchy/ParentController';
import { HierarchyChildrenController } from './utils/hierarchy/ChildrenController';
import { LifeCycleController } from './utils/LifeCycleController';
import { TypedContainerController } from './utils/ContainerController';
import { CookController } from './utils/CookController';
import { DependenciesController } from './utils/DependenciesController';
import { NameController } from './utils/NameController';
import { NodeSerializer, NodeSerializerData } from './utils/Serializer';
import { ParamsController } from './utils/params/ParamsController';
import { ParamConstructorMap } from '../params/types/ParamConstructorMap';
import { ParamInitValuesTypeMap } from '../params/types/ParamInitValuesTypeMap';
import { NodeParamsConfig } from './utils/params/ParamsConfig';
import { ParamsValueAccessorType } from './utils/params/ParamsValueAccessor';
import { ProcessingContext } from './utils/ProcessingContext';
import { IOController } from './utils/connections/IOController';
import { NodeEvent } from '../poly/NodeEvent';
import { NodeContext } from '../poly/NodeContext';
import { ParamsAccessorType } from './utils/params/ParamsAccessor';
export interface NodeVisitor {
    visit_node: (node: BaseNodeType) => any;
    visit_node_obj: (node: BaseNodeType) => any;
}
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
import { ContainerMap } from '../containers/utils/ContainerMap';
import { ContainableMap } from '../containers/utils/ContainableMap';
import { ParamOptions } from '../params/utils/OptionsController';
import { ParamType } from '../poly/ParamType';
import { DisplayNodeController } from './utils/DisplayNodeController';
declare type KT = keyof ContainerMap;
export declare class TypedNode<T extends KT, NT extends BaseNodeType, K extends NodeParamsConfig> extends CoreGraphNode {
    container_controller: TypedContainerController<ContainerMap[T]>;
    private _parent_controller;
    private _ui_data;
    private _dependencies_controller;
    private _states;
    private _lifecycle;
    private _serializer;
    private _cook_controller;
    readonly flags: FlagsController | undefined;
    protected _display_node_controller: DisplayNodeController | undefined;
    get display_node_controller(): DisplayNodeController | undefined;
    private _params_controller;
    readonly params_config: K | undefined;
    readonly pv: ParamsValueAccessorType<K>;
    readonly p: ParamsAccessorType<K>;
    private _processing_context;
    private _name_controller;
    private _io;
    get parent_controller(): HierarchyParentController;
    static displayed_input_names(): string[];
    private _children_controller;
    protected _children_controller_context: NodeContext | undefined;
    get children_controller_context(): NodeContext | undefined;
    private _create_children_controller;
    get children_controller(): HierarchyChildrenController | undefined;
    children_allowed(): boolean;
    get ui_data(): UIData;
    get dependencies_controller(): DependenciesController;
    get states(): StatesController;
    get lifecycle(): LifeCycleController;
    get serializer(): NodeSerializer;
    get cook_controller(): CookController;
    get io(): IOController<NT>;
    get name_controller(): NameController;
    set_name(name: string): void;
    _set_core_name(name: string): void;
    get params(): ParamsController;
    get processing_context(): ProcessingContext;
    constructor(scene: PolyScene, name?: string);
    private _initialized;
    initialize_base_and_node(): void;
    protected initialize_base_node(): void;
    protected initialize_node(): void;
    static type(): string;
    get type(): string;
    static node_context(): NodeContext;
    node_context(): NodeContext;
    static required_three_imports(): string[];
    static required_imports(): string[];
    required_imports(): string[];
    static require_webgl2(): boolean;
    require_webgl2(): boolean;
    set_parent(parent: BaseNodeType | null): void;
    get parent(): BaseNodeType | null;
    get root(): import("./manager/ObjectsManager").ObjectsManagerNode;
    full_path(): string;
    create_params(): void;
    add_param<T extends ParamType>(type: T, name: string, default_value: ParamInitValuesTypeMap[T], options?: ParamOptions): ParamConstructorMap[T] | undefined;
    cook(input_contents: any[]): any;
    request_container(): Promise<ContainerMap[T]>;
    set_container(content: ContainableMap[T], message?: string | null): void;
    create_node(type: string): BaseNodeType | undefined;
    remove_node(node: BaseNodeType): void;
    children(): BaseNodeType[];
    node(path: string): BaseNodeType | null;
    node_sibbling(name: string): TypedNode<T, NT, any> | null;
    nodes_by_type(type: string): BaseNodeType[];
    set_input(input_index_or_name: number | string, node: NT | null, output_index_or_name?: number | string): void;
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
}
export declare type BaseNodeType = TypedNode<any, BaseNodeType, any>;
export declare class BaseNodeClass extends TypedNode<any, BaseNodeType, any> {
}
export {};
