import {PolyScene} from '../scene/PolyScene';
import {CoreGraphNode} from '../../core/graph/CoreGraphNode';
// import {NamedGraphNode} from '../../core/graph/NamedGraphNode';

// import {BaseParam} from '../params/_Base';
// import {GeometryContainer} from '../containers/Geometry';
// import {UIData} from './UIData';

// import {Bypass} from './concerns/Bypass';
// import {ConnectionsOwner} from './concerns/ConnectionsOwner';
// import {ContainerOwner} from './concerns/ContainerOwner';
// import {Cook} from './concerns/Cook';
// import {CustomNode} from './concerns/CustomNode';
// import {Dependencies} from './concerns/old/Dependencies';
// import {DisplayFlag} from './concerns/DisplayFlag';
// import {Errored} from './concerns/Errored';
// import {HierarchyChildrenOwner} from './concerns/HierarchyChildrenOwner';
// import {HierarchyParentOwner} from './concerns/old/HierarchyParentOwner';
// import {InputsClonable} from './concerns/InputsClonable';
// import {InputsOwner} from './concerns/InputsOwner';
// import {Json} from './concerns/Json';
// import {LifeCycle} from './concerns/old/LifeCycle';
// import {Named} from './concerns/Named';
// import {OutputsOwner} from './concerns/OutputsOwner';
// import {ParamsOwner} from './concerns/ParamsOwner';
// import {Selectable} from './concerns/old/Selectable';
// import {TimeDependent} from './concerns/TimeDependent';
// import {UIDataOwner} from './concerns/UIDataOwner';
// import {Visit} from './concerns/Visit';

import {UIData} from './utils/UIData';
import {FlagsController} from './utils/FlagsController';
import {StatesController} from './utils/StatesController';
import {HierarchyParentController} from './utils/hierarchy/ParentController';
import {HierarchyChildrenController} from './utils/hierarchy/ChildrenController';
import {LifeCycleController} from './utils/LifeCycleController';
import {TypedContainerController} from './utils/ContainerController';
import {CookController} from './utils/CookController';
import {DependenciesController} from './utils/DependenciesController';
import {NameController} from './utils/NameController';
import {NodeSerializer, NodeSerializerData} from './utils/Serializer';
import {ParamsController} from './utils/params/ParamsController';
import {ParamConstructorMap} from '../params/types/ParamConstructorMap';
import {ParamInitValuesTypeMap} from '../params/types/ParamInitValuesTypeMap';

import {NodeParamsConfig} from './utils/params/ParamsConfig';
import {ParamsValueAccessor, ParamsValueAccessorType} from './utils/params/ParamsValueAccessor';
import {ProcessingContext} from './utils/ProcessingContext';
import {IOController} from './utils/connections/IOController';

// import {BaseContainer} from '../containers/_Base';

// import {BaseParam} from '../params/_Base';
// import {BooleanParam} from '../params/Boolean';
// import {ButtonParam} from '../params/Button';
// import {ColorParam} from '../params/Color';
// import {FloatParam} from '../params/Float';
// import {IntegerParam} from '../params/Integer';
// import {OperatorPathParam} from '../params/OperatorPath';
// import {RampParam} from '../params/Ramp';
// import {SeparatorParam} from '../params/Separator';
// import {StringParam} from '../params/String';
// import {Vector2Param} from '../params/Vector2';
// import {Vector3Param} from '../params/Vector3';
// import {Vector4Param} from '../params/Vector4';
import {NodeEvent} from '../poly/NodeEvent';
import {NodeContext} from '../poly/NodeContext';

// import {TypedContainer} from '../containers/_Base';
import {ParamsAccessorType, ParamsAccessor} from './utils/params/ParamsAccessor';

export interface NodeVisitor {
	visit_node: (node: BaseNodeType) => any;
	visit_node_obj: (node: BaseNodeType) => any;
}

interface NodeDeletedEmitData {
	parent_id: string;
}
interface NodeCreatedEmitData {
	child_node_json: NodeSerializerData;
}
type EmitDataByNodeEventMapGeneric = {[key in NodeEvent]: any};
export interface EmitDataByNodeEventMap extends EmitDataByNodeEventMapGeneric {
	[NodeEvent.CREATED]: NodeCreatedEmitData;
	[NodeEvent.DELETED]: NodeDeletedEmitData;
	[NodeEvent.ERROR_UPDATED]: undefined;
}
// emit(event_name: NodeEvent.CREATED, data: EmitDataByNodeEventMap[NodeEvent.CREATED]): void;
// 	emit(event_name: NodeEvent.DELETED, data: NodeDeletedEmitData): void;
// 	emit(event_name: NodeEvent.NAME_UPDATED): void;
// 	emit(event_name: NodeEvent.OVERRIDE_CLONABLE_STATE_UPDATE): void;
// 	emit(event_name: NodeEvent.NAMED_INPUTS_UPDATED): void;
// 	emit(event_name: NodeEvent.NAMED_OUTPUTS_UPDATED): void;
// 	emit(event_name: NodeEvent.INPUTS_UPDATED): void;
// 	emit(event_name: NodeEvent.PARAMS_UPDATED): void;
// 	emit(event_name: NodeEvent.UI_DATA_POSITION_UPDATED): void;
// 	emit(event_name: NodeEvent.UI_DATA_COMMENT_UPDATED): void;
// 	emit(event_name: NodeEvent.ERROR_UPDATED): void;
// 	emit(event_name: NodeEvent.FLAG_BYPASS_UPDATED): void;
// 	emit(event_name: NodeEvent.FLAG_DISPLAY_UPDATED): void;
// 	emit(event_name: NodeEvent.SELECTION_UPDATED): void;

import {ContainerMap} from '../containers/utils/ContainerMap';
import {ContainableMap} from '../containers/utils/ContainableMap';
import {BaseContainer} from '../containers/_Base';
import {ParamOptions} from '../params/utils/OptionsController';
import {ParamType} from '../poly/ParamType';
import {DisplayNodeController} from './utils/DisplayNodeController';

// type Container = ContainerMap[KT];
type KT = keyof ContainerMap;
export class TypedNode<T extends KT, NT extends BaseNodeType, K extends NodeParamsConfig> extends CoreGraphNode {
	container_controller: TypedContainerController<ContainerMap[T]> = new TypedContainerController<ContainerMap[T]>(
		this,
		BaseContainer
	);

	private _parent_controller: HierarchyParentController | undefined;

	private _ui_data: UIData | undefined;

	private _dependencies_controller: DependenciesController | undefined;
	private _states: StatesController | undefined;
	private _lifecycle: LifeCycleController | undefined;
	private _serializer: NodeSerializer | undefined;
	private _cook_controller: CookController | undefined;
	public readonly flags: FlagsController | undefined;
	protected _display_node_controller: DisplayNodeController | undefined;
	get display_node_controller() {
		return this._display_node_controller;
	}

	private _params_controller: ParamsController | undefined;
	readonly params_config: K | undefined;
	readonly pv: ParamsValueAccessorType<K> = (<unknown>new ParamsValueAccessor<K>()) as ParamsValueAccessorType<K>;
	// readonly pv: ParamsValueAccessor<K> = new ParamsValueAccessor<K>(this);
	readonly p: ParamsAccessorType<K> = (<unknown>new ParamsAccessor<K>()) as ParamsAccessorType<K>;
	// readonly p: ParamsAccessor<K> = new ParamsAccessor<K>(this);

	private _processing_context: ProcessingContext | undefined;
	private _name_controller: NameController | undefined;
	private _io: IOController<NT> | undefined;
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
	get dependencies_controller(): DependenciesController {
		return (this._dependencies_controller = this._dependencies_controller || new DependenciesController(this));
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
	// get container_controller(): TypedContainerController<T> {
	// 	return (this._container_controller = this._container_controller || new TypedContainerController<T>(this));
	// }
	get cook_controller(): CookController {
		return (this._cook_controller = this._cook_controller || new CookController(this));
	}
	get io(): IOController<NT> {
		return (this._io = this._io || new IOController<NT>((<unknown>this) as NT));
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
	get processing_context(): ProcessingContext {
		return (this._processing_context = this._processing_context || new ProcessingContext(this));
	}

	constructor(scene: PolyScene, name: string = 'BaseNode') {
		super(scene, name);
	}

	private _initialized: boolean = false;
	public initialize_base_and_node() {
		if (!this._initialized) {
			this.initialize_base_node(); // for base classes of Sop, Obj...
			this.initialize_node(); // for Derivated node clases, like BoxSop, TransformSop...
			this._initialized = true;
		} else {
			console.warn('node already initialized');
		}
	}
	protected initialize_base_node() {}
	protected initialize_node() {}
	// constructor() {
	// 	super('base_node');

	// 	// this._init_node_scene()
	// 	// this._init_context_owner()
	// 	// this._init_dirtyable()
	// 	// this._init_graph_node()

	// 	// this._init_bypass_flag();
	// 	// this._init_display_flag();
	// 	//this._init_context()
	// 	// this._init_cook();
	// 	// this._init_error();
	// 	// this._init_inputs();
	// 	// this._init_outputs();
	// 	// this._init_hierarchy_parent_owner();
	// 	//this._init_time_dependent()
	// 	// this._init_ui_data();
	// }
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

	static required_three_imports(): string[] {
		return [];
	}
	static required_imports() {
		let three_imports = this.required_three_imports();
		if (three_imports) {
			// if (!lodash_isArray(three_imports)) {
			// 	three_imports = [<unknown>three_imports as string];
			// }
			return three_imports.map((e) => `three/examples/jsm/${e}`);
		} else {
			return [];
		}
	}
	required_imports() {
		const c = this.constructor as typeof BaseNodeClass;
		return c.required_imports();
	}
	static require_webgl2(): boolean {
		return false;
	}
	require_webgl2(): boolean {
		const c = this.constructor as typeof BaseNodeClass;
		return c.require_webgl2();
	}

	// set_scene(scene: PolyScene) {
	// 	super.set_scene(scene);
	// 	// this.io.inputs._init_graph_node_inputs();
	// }

	// accepts_visitor<T extends NodeVisitor>(visitor: T): ReturnType<T['visit_node']> {
	// 	return visitor.visit_node(this);
	// }
	set_parent(parent: BaseNodeType | null) {
		this.parent_controller.set_parent(parent);
	}
	get parent() {
		return this.parent_controller.parent;
	}
	get root() {
		return this._scene.root;
	}
	full_path(): string {
		return this.parent_controller.full_path();
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
	// within_param_folder(folder_name: string, callback: () => void) {
	// 	this._params_controller?.within_param_folder(folder_name, callback);
	// }

	// cook
	cook(input_contents: any[]): any {
		return null;
	}

	// container
	async request_container() {
		return await this.container_controller.request_container();
	}
	set_container(content: ContainableMap[T], message: string | null = null) {
		// if message?
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
		//if @_container.has_content()?
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
		return this.children_controller?.find_node(path) || null;
	}
	nodes_by_type(type: string) {
		return this.children_controller?.nodes_by_type(type) || [];
	}

	// inputs
	set_input(input_index_or_name: number | string, node: NT | null, output_index_or_name: number | string = 0) {
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
		// super.emit(event_name, data);
		this.scene.events_controller.dispatch(this, event_name, data);
	}

	// serializer
	to_json(include_param_components: boolean = false) {
		return this.serializer.to_json(include_param_components);
	}
}

export type BaseNodeType = TypedNode<any, BaseNodeType, any>;
export class BaseNodeClass extends TypedNode<any, BaseNodeType, any> {}
