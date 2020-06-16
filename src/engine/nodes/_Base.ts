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
import {IOController} from './utils/io/IOController';
import {NodeEvent} from '../poly/NodeEvent';
import {NodeContext} from '../poly/NodeContext';
import {ParamsAccessorType, ParamsAccessor} from './utils/params/ParamsAccessor';

export interface NodeDeletedEmitData {
	parent_id: string;
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
	data: Dictionary<string>;
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
// import {NodeTypeMap} from '../containers/utils/ContainerMap';

export class TypedNode<NC extends NodeContext, K extends NodeParamsConfig> extends CoreGraphNode {
	container_controller: TypedContainerController<NC> = new TypedContainerController<NC>(this);

	private _parent_controller: HierarchyParentController | undefined;

	private _ui_data: UIData | undefined;

	// private _dependencies_controller: DependenciesController | undefined;
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

	get ui_data(): UIData {
		return (this._ui_data = this._ui_data || new UIData(this));
	}
	// get dependencies_controller(): DependenciesController {
	// 	return (this._dependencies_controller = this._dependencies_controller || new DependenciesController(this));
	// }
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
	set_name(name: string) {
		this.name_controller.set_name(name);
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

	constructor(scene: PolyScene, name: string = 'BaseNode') {
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
		throw 'requires override';
	}
	node_context(): NodeContext {
		const c = this.constructor as typeof BaseNodeClass;
		return c.node_context();
	}

	// static required_three_imports(): string[] {
	// 	return [];
	// }
	// static required_imports() {
	// 	let three_imports = this.required_three_imports();
	// 	if (three_imports) {
	// 		return three_imports.map((e) => `three/examples/jsm/${e}`);
	// 	} else {
	// 		return [];
	// 	}
	// }
	// required_imports() {
	// 	const c = this.constructor as typeof BaseNodeClass;
	// 	return c.required_imports();
	// }
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
	full_path(relative_to_parent?: BaseNodeType): string {
		return this.parent_controller.full_path(relative_to_parent);
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
	async request_container() {
		if (!this.is_dirty) {
			return this.container_controller.container;
		} else {
			return await this.container_controller.request_container();
		}
	}
	set_container(content: ContainableMap[NC], message: string | null = null) {
		// TODO: typescript: why is this a type of never
		this.container_controller.container.set_content(content as never); //, this.self.cook_eval_key());
		if (content != null) {
			if (!(content as any).name) {
				(content as any).name = this.full_path();
			}
			if (!(content as any).node) {
				(content as any).node = this;
			}
		}
		this.cook_controller.end_cook(message);
	}

	// hierarchy
	create_node(type: string) {
		return this.children_controller?.create_node(type);
	}
	remove_node(node: BaseNodeType) {
		this.children_controller?.remove_node(node);
	}
	children() {
		return this.children_controller?.children() || [];
	}
	node(path: string) {
		return this.parent_controller?.find_node(path) || null;
	}
	node_sibbling(name: string): NodeTypeMap[NC] | null {
		if (this.parent) {
			const node = this.parent.children_controller?.child_by_name(name);
			if (node) {
				return node as NodeTypeMap[NC];
			}
		}
		return null;
	}
	nodes_by_type(type: string) {
		return this.children_controller?.nodes_by_type(type) || [];
	}

	// inputs
	set_input(
		input_index_or_name: number | string,
		node: NodeTypeMap[NC] | null,
		output_index_or_name: number | string = 0
	) {
		this.io.inputs.set_input(input_index_or_name, node, output_index_or_name);
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
	emit(event_name: NodeEvent.SELECTION_UPDATED): void;
	emit(event_name: NodeEvent, data: object | null = null): void {
		this.scene.dispatch_controller.dispatch(this, event_name, data);
	}

	// serializer
	to_json(include_param_components: boolean = false) {
		return this.serializer.to_json(include_param_components);
	}

	// modules
	public required_modules(): ModuleName[] | void {}
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
