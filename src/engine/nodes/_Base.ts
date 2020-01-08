import {PolyScene} from '../scene/PolyScene';
import {NodeScene} from 'src/core/graph/NodeScene';
import {NamedGraphNode} from 'src/core/graph/NamedGraphNode';

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
import {ContainerController} from './utils/ContainerController';
import {CookController} from './utils/CookController';
import {NodeSerializer} from './utils/Serializer';
import {ParamsController} from './utils/ParamsController';
import {ParamOptions} from 'src/engine/params/utils/OptionsController';
import {NameController} from './utils/NameController';
import {IOController} from './utils/IOController';

import CoreSelection from 'src/core/NodeSelection';
import {BaseContainer} from '../containers/_Base';

import {BaseParam} from 'src/engine/params/_Base';
import {BooleanParam} from 'src/engine/params/Boolean';
import {ButtonParam} from 'src/engine/params/Button';
import {ColorParam} from 'src/engine/params/Color';
import {FloatParam} from 'src/engine/params/Float';
import {IntegerParam} from 'src/engine/params/Integer';
import {OperatorPathParam} from 'src/engine/params/OperatorPath';
import {RampParam} from 'src/engine/params/Ramp';
import {SeparatorParam} from 'src/engine/params/Separator';
import {StringParam} from 'src/engine/params/String';
import {Vector2Param} from 'src/engine/params/Vector2';
import {Vector3Param} from 'src/engine/params/Vector3';
import {Vector4Param} from 'src/engine/params/Vector4';

export interface BaseNodeVisitor {
	node: (node: BaseNode) => void;
}

interface NodeDeletedEmitData {
	parent: BaseNode;
}
interface NodeCreatedEmitData {
	child_node: BaseNode;
}

export class BaseNode extends NamedGraphNode(NodeScene) {
	private _parent_controller: HierarchyParentController;
	private _children_controller: HierarchyChildrenController;
	private _selection: CoreSelection;
	private _ui_data: UIData;
	private _flags: FlagsController;
	private _states: StatesController;
	private _lifecycle: LifeCycleController;
	private _serializer: NodeSerializer;
	private _container_controller: ContainerController;
	private _cook_controller: CookController;
	private _params_controller: ParamsController;
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
	get states(): StatesController {
		return (this._states = this._states || new StatesController(this));
	}
	get lifecycle(): LifeCycleController {
		return (this._lifecycle = this._lifecycle || new LifeCycleController(this));
	}
	get serializer(): NodeSerializer {
		return (this._serializer = this._serializer || new NodeSerializer(this));
	}
	get container_controller(): ContainerController {
		return (this._container_controller = this._container_controller || new ContainerController(this));
	}
	get cook_controller(): CookController {
		return (this._cook_controller = this._cook_controller || new CookController(this));
	}
	get params(): ParamsController {
		return (this._params_controller = this._params_controller || new ParamsController(this));
	}
	get name_controller(): NameController {
		return (this._name_controller = this._name_controller || new NameController(this));
	}
	get io(): IOController {
		return (this._io = this._io || new IOController(this));
	}

	constructor() {
		super();

		// this._init_node_scene()
		// this._init_context_owner()
		// this._init_dirtyable()
		// this._init_graph_node()

		// this._init_bypass_flag();
		// this._init_display_flag();
		//this._init_context()
		// this._init_cook();
		// this._init_error();
		// this._init_inputs();
		// this._init_outputs();
		// this._init_hierarchy_parent_owner();
		//this._init_time_dependent()
		// this._init_ui_data();
	}
	static type(): string {
		throw 'type to be overriden';
	}
	type() {
		const c = this.constructor as typeof BaseNode;
		return c.type();
	}
	static node_context(): NodeContext {
		throw 'requires override';
	}
	node_context(): NodeContext {
		const c = this.constructor as typeof BaseNode;
		return c.node_context();
	}

	static required_three_imports(): string[] {
		return null;
	}
	static required_imports() {
		let three_imports = this.required_three_imports();
		if (three_imports) {
			// if (!lodash_isArray(three_imports)) {
			// 	three_imports = [<unknown>three_imports as string];
			// }
			return three_imports.map((e) => `three/examples/jsm/${e}`);
		} else {
			return null;
		}
	}
	required_imports() {
		const c = this.constructor as typeof BaseNode;
		return c.required_imports();
	}
	static require_webgl2(): boolean {
		return false;
	}
	require_webgl2(): boolean {
		const c = this.constructor as typeof BaseNode;
		return c.require_webgl2();
	}

	set_scene(scene: PolyScene) {
		super.set_scene(scene);
		// this.io.inputs._init_graph_node_inputs();
	}

	visit(visitor: BaseNodeVisitor) {
		return visitor.node(this);
	}
	set_parent(parent: BaseNode) {
		this.parent_controller.set_parent(parent);
	}
	get parent() {
		return this.parent_controller.parent;
	}
	root() {
		return this._scene.root();
	}
	full_path(): string {
		return this.parent_controller.full_path();
	}

	// params
	create_params() {}
	add_param(
		type: ParamType.BOOLEAN,
		name: string,
		default_value: BooleanAsNumber | string,
		options?: ParamOptions
	): BooleanParam;
	add_param(type: ParamType.BUTTON, name: string, default_value: null, options?: ParamOptions): ButtonParam;
	add_param(
		type: ParamType.COLOR,
		name: string,
		default_value: [number, number, number],
		options?: ParamOptions
	): ColorParam;
	add_param(type: ParamType.FLOAT, name: string, default_value: number | string, options?: ParamOptions): FloatParam;
	add_param(
		type: ParamType.INTEGER,
		name: string,
		default_value: number | string,
		options?: ParamOptions
	): IntegerParam;
	add_param(
		type: ParamType.OPERATOR_PATH,
		name: string,
		default_value: string,
		options?: ParamOptions
	): OperatorPathParam;
	add_param(type: ParamType.RAMP, name: string, default_value: string, options?: ParamOptions): RampParam;
	add_param(type: ParamType.SEPARATOR, name: string, default_value: null, options?: ParamOptions): SeparatorParam;
	add_param(type: ParamType.STRING, name: string, default_value: string, options?: ParamOptions): StringParam;
	add_param(
		type: ParamType.VECTOR2,
		name: string,
		default_value: [number | string, number | string],
		options?: ParamOptions
	): Vector2Param;
	add_param(
		type: ParamType.VECTOR3,
		name: string,
		default_value: [number | string, number | string, number | string],
		options?: ParamOptions
	): Vector3Param;
	add_param(
		type: ParamType.VECTOR4,
		name: string,
		default_value: [number | string, number | string, number | string, number | string],
		options?: ParamOptions
	): Vector4Param;
	add_param(type: ParamType, name: string, default_value: any, options?: ParamOptions): BaseParam {
		return this._params_controller.add_param(type, name, default_value, options);
	}
	within_param_folder(folder_name: string, callback: () => void) {
		this._params_controller.within_param_folder(folder_name, callback);
	}

	// cook
	cook(input_contents: any[]) {}

	// container
	request_container() {
		return this.container_controller.request_container();
	}
	set_container(content: any, message: string = null) {
		// if message?
		this._container.set_content(content); //, this.self.cook_eval_key());
		if (content != null) {
			if (!content.name) {
				content.name = this.full_path();
			}
			if (!content.node) {
				content.node = this;
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

	// emit

	emit(event_name: 'node_created', data: NodeCreatedEmitData): void;
	emit(event_name: 'node_deleted', data: NodeDeletedEmitData): void;
	emit(event_name: 'node_name_update'): void;
	emit(event_name: 'override_clonable_state_update'): void;
	emit(event_name: 'node_named_outputs_updated'): void;
	emit(event_name: 'node_named_inputs_updated'): void;
	emit(event_name: 'node_inputs_updated'): void;
	emit(event_name: 'params_updated'): void;
	emit(event_name: string, data: object = null): void {
		super.emit(event_name, data);
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

// export class BaseNode extends TypedNode<any> {}
