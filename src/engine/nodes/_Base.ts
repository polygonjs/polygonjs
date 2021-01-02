import {PolyScene} from '../scene/PolyScene';
import {CoreGraphNode} from '../../core/graph/CoreGraphNode';
import {UIData} from './utils/UIData';
import {FlagsController, FlagsControllerD} from './utils/FlagsController';
import {StatesController} from './utils/StatesController';
import {HierarchyParentController} from './utils/hierarchy/ParentController';
import {HierarchyChildrenController} from './utils/hierarchy/ChildrenController';
import {LifeCycleController} from './utils/LifeCycleController';
import {TypedContainerController} from './utils/ContainerController';
import {NodeCookController} from './utils/CookController';
import {NameController} from './utils/NameController';
import {NodeSerializer, NodeSerializerData} from './utils/Serializer';
import {ParamsController} from './utils/params/ParamsController';
import {ParamConstructorMap} from '../params/types/ParamConstructorMap';
import {ParamInitValuesTypeMap} from '../params/types/ParamInitValuesTypeMap';
import {NodeParamsConfig} from './utils/params/ParamsConfig';
import {ParamsValueAccessor, ParamsValueAccessorType} from './utils/params/ParamsValueAccessor';
// import {ProcessingContext} from './utils/ProcessingContext';
import {IOController, ParamsInitData} from './utils/io/IOController';
import {NodeEvent} from '../poly/NodeEvent';
import {NodeContext} from '../poly/NodeContext';
import {ParamsAccessorType, ParamsAccessor} from './utils/params/ParamsAccessor';

export interface NodeDeletedEmitData {
	parent_id: CoreGraphNodeId;
}
export interface NodeCreatedEmitData {
	child_node_json: NodeSerializerData;
}
type EmitDataByNodeEventMapGeneric = {[key in NodeEvent]: any};
export interface EmitDataByNodeEventMap extends EmitDataByNodeEventMapGeneric {
	[NodeEvent.CREATED]: NodeCreatedEmitData;
	[NodeEvent.DELETED]: NodeDeletedEmitData;
	[NodeEvent.ERROR_UPDATED]: undefined;
}
export interface IntegrationData {
	name: string;
	data: PolyDictionary<string>;
}

// import {ContainerMap, ContainerType} from '../containers/utils/ContainerMap';
import {ContainableMap} from '../containers/utils/ContainableMap';
import {ParamOptions} from '../params/utils/OptionsController';
import {ParamType} from '../poly/ParamType';
import {DisplayNodeController} from './utils/DisplayNodeController';
import {NodeTypeMap} from '../containers/utils/ContainerMap';
import {ParamInitValueSerialized} from '../params/types/ParamInitValueSerialized';
import {ModuleName} from '../poly/registers/modules/_BaseRegister';
import {BasePersistedConfig} from './utils/PersistedConfig';
import {AssemblerName} from '../poly/registers/assemblers/_BaseRegister';
import {PolyNodeController} from './utils/poly/PolyNodeController';
import {CoreGraphNodeId} from '../../core/graph/CoreGraph';
import {PolyDictionary} from '../../types/GlobalTypes';

export class TypedNode<NC extends NodeContext, K extends NodeParamsConfig> extends CoreGraphNode {
	container_controller: TypedContainerController<NC> = new TypedContainerController<NC>(this);

	private _parent_controller: HierarchyParentController | undefined;

	private _ui_data: UIData | undefined;

	private _states: StatesController | undefined;
	private _lifecycle: LifeCycleController | undefined;
	private _serializer: NodeSerializer | undefined;
	private _cook_controller: NodeCookController<NC> | undefined;
	public readonly flags: FlagsController | undefined;
	public readonly display_node_controller: DisplayNodeController | undefined;
	public readonly persisted_config: BasePersistedConfig | undefined;

	private _params_controller: ParamsController | undefined;
	readonly params_config: K | undefined;
	readonly pv: ParamsValueAccessorType<K> = (<unknown>new ParamsValueAccessor<K>()) as ParamsValueAccessorType<K>;
	// readonly pv: ParamsValueAccessor<K> = new ParamsValueAccessor<K>(this);
	readonly p: ParamsAccessorType<K> = (<unknown>new ParamsAccessor<K>()) as ParamsAccessorType<K>;
	copy_param_values(node: TypedNode<NC, K>) {
		const non_spare = this.params.non_spare;
		for (let param of non_spare) {
			const other_param = node.params.get(param.name);
			if (other_param) {
				param.copy_value(other_param);
			}
		}
	}
	// readonly p: ParamsAccessor<K> = new ParamsAccessor<K>(this);

	// private _processing_context: ProcessingContext | undefined;
	private _name_controller: NameController | undefined;
	get parent_controller(): HierarchyParentController {
		return (this._parent_controller = this._parent_controller || new HierarchyParentController(this));
	}
	static displayed_input_names(): string[] {
		return [];
	}

	private _children_controller: HierarchyChildrenController | undefined;
	protected _children_controller_context: NodeContext | undefined;
	get children_controller_context() {
		return this._children_controller_context;
	}
	private _create_children_controller(): HierarchyChildrenController | undefined {
		if (this._children_controller_context) {
			return new HierarchyChildrenController(this, this._children_controller_context);
		}
	}
	get children_controller(): HierarchyChildrenController | undefined {
		return (this._children_controller = this._children_controller || this._create_children_controller());
	}
	children_allowed(): boolean {
		return this._children_controller_context != null;
	}

	get uiData(): UIData {
		return (this._ui_data = this._ui_data || new UIData(this));
	}

	get states(): StatesController {
		return (this._states = this._states || new StatesController(this));
	}
	get lifecycle(): LifeCycleController {
		return (this._lifecycle = this._lifecycle || new LifeCycleController(this));
	}
	get serializer(): NodeSerializer {
		return (this._serializer = this._serializer || new NodeSerializer(this));
	}

	get cook_controller(): NodeCookController<NC> {
		return (this._cook_controller = this._cook_controller || new NodeCookController(this));
	}
	protected _io: IOController<NC> | undefined;
	get io(): IOController<NC> {
		return (this._io = this._io || new IOController(this));
	}
	get name_controller(): NameController {
		return (this._name_controller = this._name_controller || new NameController(this));
	}
	setName(name: string) {
		this.name_controller.setName(name);
	}
	_set_core_name(name: string) {
		this._name = name;
	}
	get params(): ParamsController {
		return (this._params_controller = this._params_controller || new ParamsController(this));
	}
	// get processing_context(): ProcessingContext {
	// 	return (this._processing_context = this._processing_context || new ProcessingContext(this));
	// }

	constructor(scene: PolyScene, name: string = 'BaseNode', public params_init_value_overrides?: ParamsInitData) {
		super(scene, name);
	}

	private _initialized: boolean = false;
	public initialize_base_and_node() {
		if (!this._initialized) {
			this._initialized = true;

			this.display_node_controller?.initialize_node();

			this.initialize_base_node(); // for base classes of Sop, Obj...
			this.initialize_node(); // for Derivated node clases, like BoxSop, TransformSop...
			if (this.poly_node_controller) {
				this.poly_node_controller.initialize_node();
			}
		} else {
			console.warn('node already initialized');
		}
	}
	protected initialize_base_node() {}
	protected initialize_node() {}

	static type(): string {
		throw 'type to be overriden';
	}
	get type() {
		const c = this.constructor as typeof BaseNodeClass;
		return c.type();
	}
	static node_context(): NodeContext {
		console.error('node has no node_context', this);
		throw 'node_context requires override';
	}
	node_context(): NodeContext {
		const c = this.constructor as typeof BaseNodeClass;
		return c.node_context();
	}

	static require_webgl2(): boolean {
		return false;
	}
	require_webgl2(): boolean {
		const c = this.constructor as typeof BaseNodeClass;
		return c.require_webgl2();
	}

	set_parent(parent: BaseNodeType | null) {
		this.parent_controller.set_parent(parent);
	}
	get parent() {
		return this.parent_controller.parent;
	}
	get root() {
		return this._scene.root;
	}
	fullPath(relative_to_parent?: BaseNodeType): string {
		return this.parent_controller.fullPath(relative_to_parent);
	}

	// params
	create_params() {}
	add_param<T extends ParamType>(
		type: T,
		name: string,
		default_value: ParamInitValuesTypeMap[T],
		options?: ParamOptions
	): ParamConstructorMap[T] | undefined {
		return this._params_controller?.add_param(type, name, default_value, options);
	}
	param_default_value(name: string): ParamInitValueSerialized {
		return null;
	}

	// cook
	cook(input_contents: any[]): any {
		return null;
	}

	// container
	async requestContainer() {
		if (!this.is_dirty) {
			return this.container_controller.container;
		} else {
			return await this.container_controller.requestContainer();
		}
	}
	set_container(content: ContainableMap[NC], message: string | null = null) {
		// TODO: typescript: why is this a type of never
		this.container_controller.container.set_content(content as never); //, this.self.cook_eval_key());
		if (content != null) {
			if (!(content as any).name) {
				(content as any).name = this.fullPath();
			}
			if (!(content as any).node) {
				(content as any).node = this;
			}
		}
		this.cook_controller.end_cook(message);
	}

	// hierarchy
	createNode(node_class: any, params_init_value_overrides?: ParamsInitData) {
		return this.children_controller?.createNode(node_class, params_init_value_overrides);
	}
	create_operation_container(
		type: string,
		operation_container_name: string,
		params_init_value_overrides?: ParamsInitData
	) {
		return this.children_controller?.create_operation_container(
			type,
			operation_container_name,
			params_init_value_overrides
		);
	}
	removeNode(node: BaseNodeType) {
		this.children_controller?.removeNode(node);
	}
	children() {
		return this.children_controller?.children() || [];
	}
	node(path: string) {
		return this.parent_controller?.find_node(path) || null;
	}
	nodeSibbling(name: string): NodeTypeMap[NC] | null {
		if (this.parent) {
			const node = this.parent.children_controller?.child_by_name(name);
			if (node) {
				return node as NodeTypeMap[NC];
			}
		}
		return null;
	}
	nodesByType(type: string) {
		return this.children_controller?.nodesByType(type) || [];
	}

	// inputs
	setInput(
		input_index_or_name: number | string,
		node: NodeTypeMap[NC] | null,
		output_index_or_name: number | string = 0
	) {
		this.io.inputs.setInput(input_index_or_name, node, output_index_or_name);
	}

	// emit
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
	emit(event_name: NodeEvent.FLAG_OPTIMIZE_UPDATED): void;
	emit(event_name: NodeEvent.SELECTION_UPDATED): void;
	emit(event_name: NodeEvent, data: object | null = null): void {
		this.scene.dispatch_controller.dispatch(this, event_name, data);
	}

	// serializer
	toJSON(include_param_components: boolean = false) {
		return this.serializer.toJSON(include_param_components);
	}

	// modules
	public async required_modules(): Promise<ModuleName[] | void> {}
	public used_assembler(): AssemblerName | void {}
	public integration_data(): IntegrationData | void {}

	// poly nodes
	public readonly poly_node_controller: PolyNodeController | undefined;
}

export type BaseNodeType = TypedNode<any, any>;
export class BaseNodeClass extends TypedNode<any, any> {}

export class BaseNodeClassWithDisplayFlag extends TypedNode<any, any> {
	public readonly flags: FlagsControllerD = new FlagsControllerD(this);
}
