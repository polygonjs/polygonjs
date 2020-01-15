import {PolyScene} from '../scene/PolyScene';
import {CoreGraphNode} from 'src/core/graph/CoreGraphNode';
// import {NamedGraphNode} from 'src/core/graph/NamedGraphNode';

// import {BaseParam} from 'src/engine/params/_Base';
// import {GeometryContainer} from 'src/engine/containers/Geometry';
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
import {NodeSerializer} from './utils/Serializer';
import {ParamsController, ParamInitValuesTypeMap, ParamConstructorMap} from './utils/params/ParamsController';
import {NodeParamsConfig} from './utils/params/ParamsConfig';
import {ParamsValueAccessor, ParamsValueAccessorType} from 'src/engine/nodes/utils/params/ParamsValueAccessor';
import {ParamOptions} from 'src/engine/params/utils/OptionsController';
import {ProcessingContext} from './utils/ProcessingContext';
import {IOController} from './utils/IOController';

import CoreSelection from 'src/core/NodeSelection';
// import {BaseContainer} from '../containers/_Base';

// import {BaseParam} from 'src/engine/params/_Base';
// import {BooleanParam} from 'src/engine/params/Boolean';
// import {ButtonParam} from 'src/engine/params/Button';
// import {ColorParam} from 'src/engine/params/Color';
// import {FloatParam} from 'src/engine/params/Float';
// import {IntegerParam} from 'src/engine/params/Integer';
// import {OperatorPathParam} from 'src/engine/params/OperatorPath';
// import {RampParam} from 'src/engine/params/Ramp';
// import {SeparatorParam} from 'src/engine/params/Separator';
// import {StringParam} from 'src/engine/params/String';
// import {Vector2Param} from 'src/engine/params/Vector2';
// import {Vector3Param} from 'src/engine/params/Vector3';
// import {Vector4Param} from 'src/engine/params/Vector4';
import {ParamType} from '../poly/ParamType';
import {NodeEvent} from '../poly/NodeEvent';
import {NodeContext} from '../poly/NodeContext';

// import {TypedContainer} from 'src/engine/containers/_Base';
import {ParamsAccessorType, ParamsAccessor} from './utils/params/ParamsAccessor';

export interface BaseNodeVisitor {
	visit_node: (node: BaseNodeType) => void;
}

interface NodeDeletedEmitData {
	parent: BaseNodeType;
}
interface NodeCreatedEmitData {
	child_node: BaseNodeType;
}
interface NodeUIUpdatedData {
	x: number;
	y: number;
	comment: string;
}

import {ContainerMap} from 'src/engine/containers/utils/ContainerMap';
import {ContainableMap} from 'src/engine/containers/utils/ContainableMap';
type KT = keyof ContainerMap;
// type Container = ContainerMap[KT];

export class TypedNode<T extends KT, K extends NodeParamsConfig> extends CoreGraphNode {
	container_controller: TypedContainerController<ContainerMap[T]>;

	private _parent_controller: HierarchyParentController | null;
	private _children_controller: HierarchyChildrenController;
	private _selection: CoreSelection;
	private _ui_data: UIData;
	private _flags: FlagsController;
	private _dependencies_controller: DependenciesController;
	private _states: StatesController;
	private _lifecycle: LifeCycleController;
	private _serializer: NodeSerializer;
	private _cook_controller: CookController;

	private _params_controller: ParamsController;
	readonly params_config: K;
	readonly pv: ParamsValueAccessorType<K> = (<unknown>new ParamsValueAccessor<K>(this)) as ParamsValueAccessorType<K>;
	readonly p: ParamsAccessorType<K> = (<unknown>new ParamsAccessor<K>(this)) as ParamsAccessorType<K>;

	private _processing_context: ProcessingContext;
	private _name_controller: NameController;
	private _io: IOController;
	get parent_controller(): HierarchyParentController {
		return (this._parent_controller = this._parent_controller || new HierarchyParentController(this));
	}
	get children_controller(): HierarchyChildrenController {
		return (this._children_controller = this._children_controller || new HierarchyChildrenController(this));
	}
	get selection(): CoreSelection {
		return (this._selection = this._selection || new CoreSelection(this));
	}
	get ui_data(): UIData {
		return (this._ui_data = this._ui_data || new UIData(this));
	}
	get flags(): FlagsController {
		return (this._flags = this._flags || new FlagsController(this));
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
	get io(): IOController {
		return (this._io = this._io || new IOController(this));
	}
	get name_controller(): NameController {
		return (this._name_controller = this._name_controller || new NameController(this));
	}
	get params(): ParamsController {
		return (this._params_controller = this._params_controller || new ParamsController(this));
	}
	get processing_context(): ProcessingContext {
		return (this._processing_context = this._processing_context || new ProcessingContext(this));
	}

	constructor(scene: PolyScene, name: string = 'BaseNode') {
		super(scene, name);

		this.initialize_base_node(); // for base classes of Sop, Obj...
		this.initialize_node(); // for Derivated node clases, like BoxSop, TransformSop...
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
	type() {
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

	accepts_visitor(visitor: BaseNodeVisitor): any {
		return visitor.visit_node(this);
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
	): ParamConstructorMap[T] | null {
		return this._params_controller.add_param(type, name, default_value, options);
	}
	within_param_folder(folder_name: string, callback: () => void) {
		this._params_controller.within_param_folder(folder_name, callback);
	}

	// cook
	cook(input_contents: any[]): any {
		return null;
	}

	// container
	request_container() {
		return this.container_controller.request_container();
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
		return this.children_controller.create_node(type);
	}
	children() {
		return this.children_controller.children();
	}
	node(path: string) {
		return this.children_controller.find_node(path);
	}
	nodes_by_type(type: string) {
		return this.children_controller.nodes_by_type(type);
	}

	// inputs
	set_input(index: number, node: BaseNodeType) {
		this.io.inputs.set_input(index, node);
	}

	// emit

	emit(event_name: NodeEvent.CREATED, data: NodeCreatedEmitData): void;
	emit(event_name: NodeEvent.DELETED, data: NodeDeletedEmitData): void;
	emit(event_name: NodeEvent.NAME_UPDATED): void;
	emit(event_name: NodeEvent.OVERRIDE_CLONABLE_STATE_UPDATE): void;
	emit(event_name: NodeEvent.NAMED_INPUTS_UPDATED): void;
	emit(event_name: NodeEvent.NAMED_OUTPUTS_UPDATED): void;
	emit(event_name: NodeEvent.INPUTS_UPDATED): void;
	emit(event_name: NodeEvent.PARAMS_UPDATED): void;
	emit(event_name: NodeEvent.UI_DATA_UPDATED, data: NodeUIUpdatedData): void;
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

	// root(): BaseNode {
	// 	return this;
	// }
	// parent(): BaseNode {
	// 	return this;
	// }
	// node(name: string): BaseNode {
	// 	return this;
	// }
	// param(name: string): BaseParam {
	// 	return null;
	// }
	// full_path(): string {
	// 	return 'test full path';
	// }
	// params_node(): any {
	// 	return null;
	// }
	// type(): string {
	// 	return '';
	// }
	// is_cooking(): boolean {
	// 	return false;
	// }
	// async request_container(): Promise<GeometryContainer> {
	// 	return new Promise((resolve, reject) => {
	// 		resolve(new GeometryContainer());
	// 	});
	// }
	// input_graph_node(index: number): NodeScene {
	// 	return null;
	// }
	// input(index: number): BaseNode {
	// 	return null;
	// }
	// ui_data() {
	// 	return new UIData(this);
	// }
	// children(): BaseNode[] {
	// 	return [];
	// }
	// children_allowed(): boolean {
	// 	return true;
	// }
	// node_context_signature(): string {
	// 	return '';
	// }
	// node_context(): string {
	// 	return '';
	// }
	// remove_node(node: BaseNode) {}
	// nodes_by_type(type: string): BaseNode[] {
	// 	return [];
	// }
	// to_json(test: boolean): object {
	// 	if (test) {
	// 		return {};
	// 	} else {
	// 		return {a: 1};
	// 	}
	// }
	// all_params(): BaseParam[] {
	// 	return [];
	// }
}

export type BaseNodeType = TypedNode<any, any>;
export class BaseNodeClass extends TypedNode<any, any> {}
