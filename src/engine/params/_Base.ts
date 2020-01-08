// import {Vector3} from 'three/src/math/Vector3'
// import {Vector2} from 'three/src/math/Vector2'

import {CoreWalker} from 'src/core/Walker';
import {NodeScene} from 'src/core/graph/NodeScene';
import {NamedGraphNode} from 'src/core/graph/NamedGraphNode';
import {BaseNode} from 'src/engine/nodes/_Base';

// import {CallbackOption} from './concerns/options/Callback'
// import {ColorOption} from './concerns/options/Color'
// import {CookOption} from './concerns/options/Cook'
// import {DesktopOption} from './concerns/options/Desktop'
// import {ExpressionOption} from './concerns/options/Expression'
// import {MenuOption} from './concerns/options/Menu'
// import {NodeSelectionOption} from './concerns/options/NodeSelection'
// import {RangeOption} from './concerns/options/Range'
// import {AssetReferenceOption} from './concerns/options/AssetReference'
// import {SpareOption} from './concerns/options/Spare'
// import {MultilineOption} from './concerns/options/Multiline'
// import {TextureOption} from './concerns/options/Texture'
// import {VisibleOption} from './concerns/options/Visible'

// import {Emit} from './concerns/Emit';
// import {Errored} from './concerns/Errored';
// import {Eval} from './concerns/Eval';
import {Expression} from './concerns/Expression';
// import {Hierarchy} from './concerns/Hierarchy';
// import {Json} from './concerns/Json';
// import {Named} from './concerns/Named';
// import {Node} from './concerns/Node';
// import {Options} from './concerns/Options';
// import {TimeDependent} from './concerns/TimeDependent';
// import {Type} from './concerns/Type';
// import {UIDataOwner} from './concerns/UIDataOwner';
import {VisitorsBase} from './concerns/visitors/_Base';

import {OptionsController} from './utils/OptionsController';
import {EmitController} from './utils/EmitController';
import {ParamSerializer} from './utils/Serializer';
import {StatesController} from './utils/StatesController';
import {UIData} from './utils/UIData';

import {TypedMultipleParam} from './_Multiple';
import {FloatParam} from './Float';

export class TypedParam<T> extends VisitorsBase(Expression(NamedGraphNode(NodeScene))) {
	protected _raw_input: T;
	protected _default_value: T;
	protected _value: T;
	protected _expression: string;
	protected _node: BaseNode;
	protected _parent_param: TypedMultipleParam<any>;
	protected _components: FloatParam[];

	private _options: OptionsController;
	get options(): OptionsController {
		return (this._options = this._options || new OptionsController(this));
	}
	private _emit_controller: EmitController;
	get emit_controller(): EmitController {
		return (this._emit_controller = this._emit_controller || new EmitController(this));
	}
	private _serializer: ParamSerializer;
	get serializer(): ParamSerializer {
		return (this._serializer = this._serializer || new ParamSerializer(this));
	}
	private _states: StatesController;
	get states(): StatesController {
		return (this._states = this._states || new StatesController(this));
	}
	private _ui_data: UIData;
	get ui_data(): UIData {
		return (this._ui_data = this._ui_data || new UIData(this));
	}

	constructor() {
		super();

		// this.add_post_dirty_hook(this._remove_node_param_cache.bind(this))
	}
	initialize() {
		this.init_components();
		// this.init_expression()
		// this._init_ui_data()
	}
	init_components() {}
	//
	// init_expression() {}

	// type
	static type(): ParamType {
		// throw "type to be overriden";
		return null;
	}
	type(): ParamType {
		return (this.constructor as typeof BaseParam).type();
	}
	is_numeric(): boolean {
		return false;
	}
	is_multiple(): boolean {
		return false;
	}
	// name

	name() {
		return this._name;
	}
	set_name(name: string): void {
		this._name = name;
		this.self.name_graph_node().set_dirty();
		this.self.name_graph_node().remove_dirty_state();
	}

	// TODO: typescript
	value(): T {
		return null;
	}
	set(new_value: T): void {}
	default_value() {
		return this._default_value;
	}
	is_raw_input_default(value: T): boolean {
		return true;
	}
	set_default_value(default_value: T) {
		this._default_value = default_value;
	}
	eval_p(): Promise<T> {
		return new Promise((resolve, reject) => {
			resolve();
		});
	}

	// node
	set_node(node: BaseNode) {
		if (!node) {
			if (this._node) {
				this._node.params_node().remove_graph_input(this);
			}
		} else {
			this._node = node;
			if (this.options.makes_node_dirty_when_dirty()) {
				node.params_node().add_graph_input(this);
			}
		}

		if (this.is_multiple()) {
			for (let c of this.self.components()) {
				c.set_node(node);
			}
		}
	}
	get node() {
		return this._node;
	}
	get parent() {
		return this.node;
	}

	// hierarchy
	set_parent_param(param: TypedMultipleParam<any>) {
		param.add_graph_input(this);
		this._parent_param = param;
	}
	parent_param(): BaseParam {
		return this._parent_param;
	}
	has_parent_param(): boolean {
		return this._parent_param != null;
	}
	full_path(): string {
		return this.self.node.full_path() + '/' + this.self.name();
	}
	path_relative_to(node: BaseNode | BaseParam): string {
		return CoreWalker.relative_path(node, this.self);
	}

	components() {
		return this._components;
	}

	// emit
	emit(event_name: 'param_visible_updated'): void;
	emit(event_name: 'param_updated'): void;
	emit(event_name: 'param_deleted'): void;
	emit(event_name: string, data: object = null): void {
		if (this.emit_controller.emit_allowed()) {
			super.emit(event_name, data);
		}
	}

	to_json() {
		return this.serializer.to_json();
	}
}
export abstract class BaseParam extends TypedParam<any> {}
