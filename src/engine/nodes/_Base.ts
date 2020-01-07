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
import {CustomNode} from './concerns/CustomNode';
import {Dependencies} from './concerns/Dependencies';
// import {DisplayFlag} from './concerns/DisplayFlag';
// import {Errored} from './concerns/Errored';
import {HierarchyChildrenOwner} from './concerns/HierarchyChildrenOwner';
import {HierarchyParentOwner} from './concerns/HierarchyParentOwner';
import {InputsClonable} from './concerns/InputsClonable';
import {InputsOwner} from './concerns/InputsOwner';
// import {Json} from './concerns/Json';
// import {LifeCycle} from './concerns/old/LifeCycle';
import {Named} from './concerns/Named';
import {OutputsOwner} from './concerns/OutputsOwner';
import {ParamsOwner} from './concerns/ParamsOwner';
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

import CoreSelection from 'src/core/NodeSelection';
import {NodeSerializer} from './utils/Serializer';
import {BaseContainer} from '../containers/_Base';

interface BaseNodeVisitor {
	node: (node: BaseNode) => void;
}

export class BaseNode extends CustomNode(
	Dependencies(
		// DisplayFlag(
		// Errored(
		HierarchyParentOwner(
			HierarchyChildrenOwner(
				InputsClonable(InputsOwner(Named(OutputsOwner(ParamsOwner(NamedGraphNode(NodeScene))))))
			)
		)
		// )
		// )
	)
) {
	parent: BaseNode;
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

	protected _container: BaseContainer;

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
		this._init_outputs();
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
		this._init_graph_node_inputs();
		this._init_params();
	}

	visit(visitor: BaseNodeVisitor) {
		return visitor.node(this.self);
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
				content.name = this.self.full_path();
			}
			if (!content.node) {
				content.node = this;
			}
		}
		//if @_container.has_content()?
		this.self.cook_controller.end_cook(message);
	}

	get container() {
		return this._container;
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
