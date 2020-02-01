// import {Vector3} from 'three/src/math/Vector3'
// import {Vector2} from 'three/src/math/Vector2'

import {CoreWalker} from 'src/core/Walker';
import {CoreGraphNode} from 'src/core/graph/CoreGraphNode';
// import {NodeScene} from 'src/core/graph/NodeScene';
// import {NamedGraphNode} from 'src/core/graph/NamedGraphNode';
import {BaseNodeType} from 'src/engine/nodes/_Base';

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
// import {Expression} from './concerns/Expression';
// import {Hierarchy} from './concerns/Hierarchy';
// import {Json} from './concerns/Json';
// import {Named} from './concerns/Named';
// import {Node} from './concerns/Node';
// import {Options} from './concerns/Options';
// import {TimeDependent} from './concerns/TimeDependent';
// import {Type} from './concerns/Type';
// import {UIDataOwner} from './concerns/UIDataOwner';
// import {VisitorsBase} from './concerns/visitors/_Base';

import {OptionsController} from './utils/OptionsController';
import {ExpressionController} from './utils/ExpressionController';
import {EmitController} from './utils/EmitController';
import {ParamSerializer} from './utils/Serializer';
import {StatesController} from './utils/StatesController';
import {UIData} from './utils/UIData';

import {TypedMultipleParam} from './_Multiple';
import {FloatParam} from './Float';
import {ParamType} from '../poly/ParamType';
import {ParamEvent} from '../poly/ParamEvent';
import {PolyScene} from '../scene/PolyScene';

import {ParamInitValuesTypeMap, ParamValuesTypeMap} from 'src/engine/nodes/utils/params/ParamsController';

export interface TypedParamVisitor {
	visit_typed_param: (param: BaseParamType) => any;
}

// type ParamTypeElem = ParamType;
type ComputeCallback = (value: void) => void;

export abstract class TypedParam<T extends ParamType> extends CoreGraphNode {
	// protected _raw_input: ParamInitValuesTypeMap[T];
	protected _default_value!: ParamInitValuesTypeMap[T];
	protected _value!: ParamValuesTypeMap[T];
	// protected _expression: string;
	protected _node!: BaseNodeType;
	protected _parent_param: TypedMultipleParam<any> | undefined;
	protected _components: FloatParam[] | undefined;
	protected _compute_resolves: ComputeCallback[] | undefined;

	private _options: OptionsController = new OptionsController(this);
	get options(): OptionsController {
		return (this._options = this._options || new OptionsController(this));
	}
	private _emit_controller: EmitController = new EmitController(this);
	get emit_controller(): EmitController {
		return (this._emit_controller = this._emit_controller || new EmitController(this));
	}
	protected _expression_controller: ExpressionController<T> | undefined;
	get expression_controller(): ExpressionController<T> | undefined {
		return this._expression_controller; // =
		//this._expression_controller || new ExpressionController(this);
	}
	private _serializer: ParamSerializer | undefined;
	get serializer(): ParamSerializer {
		return (this._serializer = this._serializer || new ParamSerializer(this));
	}
	private _states: StatesController | undefined;
	get states(): StatesController {
		return (this._states = this._states || new StatesController(this));
	}
	private _ui_data: UIData | undefined;
	get ui_data(): UIData {
		return (this._ui_data = this._ui_data || new UIData(this.scene, this));
	}

	constructor(scene: PolyScene) {
		super(scene, 'BaseParam');
		this.initialize_param();
	}
	initialize_value() {}
	initialize_param() {}
	// 	// this.add_post_dirty_hook(this._remove_node_param_cache.bind(this))
	// }
	// initialize() {
	// 	this.init_components();
	// 	// this.init_expression()
	// 	// this._init_ui_data()
	// }
	accepts_visitor(visitor: TypedParamVisitor): any {
		return visitor.visit_typed_param(this);
	}

	//
	// init_expression() {}

	// type
	static type(): ParamType {
		return ParamType.FLOAT; // adding a type here, but just to not have a compile error
	}
	get type(): T {
		return (this.constructor as typeof BaseParamClass).type() as T;
	}
	get is_numeric(): boolean {
		return false;
	}

	// name
	set_name(name: string) {
		super.set_name(name);
		// this.self.name_graph_node().set_dirty();
		// this.self.name_graph_node().remove_dirty_state();
	}

	get value(): ParamValuesTypeMap[T] {
		return this._value;
	}
	convert(raw_val: any): ParamValuesTypeMap[T] | null {
		return null;
	}
	set(raw_input: ParamInitValuesTypeMap[T]): void {
		// this._raw_input = raw_input;
		// this.process_raw_input()
	}
	get default_value() {
		return this._default_value;
	}
	get is_default(): boolean {
		return true;
	}

	private _is_computing: boolean = false;
	async compute(): Promise<void> {
		if (this.is_dirty) {
			if (!this._is_computing) {
				this._is_computing = true;
				await this.process_computation();
				this._is_computing = false;

				if (this._compute_resolves) {
					let callback: ComputeCallback | undefined;
					while ((callback = this._compute_resolves.pop())) {
						callback();
					}
				}
			} else {
				return new Promise((resolve, reject) => {
					this._compute_resolves = this._compute_resolves || [];
					this._compute_resolves.push(resolve);
				});
			}
		}
	}
	protected async process_computation(): Promise<void> {}
	// set_default_value(default_value: ParamValuesTypeMap[T]) {
	// 	this._default_value = default_value;
	// }
	set_init_value(init_value: ParamInitValuesTypeMap[T]) {
		this._default_value = init_value; //this.convert(init_value);
		// this._value = this.convert(init_value);
		if (!this.is_multiple) {
			this.set(init_value);
		}
	}
	// eval_p(): Promise<ParamValuesTypeMap[T]> {
	// 	return new Promise((resolve, reject) => {
	// 		resolve();
	// 	});
	// }

	// node
	set_node(node: BaseNodeType | null) {
		if (!node) {
			if (this._node) {
				this._node.params.params_node?.remove_graph_input(this);
			}
		} else {
			this._node = node;
			if (this.options.makes_node_dirty_when_dirty() && !this.parent_param) {
				node.params.params_node?.add_graph_input(this);
			}
		}

		if (this.is_multiple) {
			this.init_components();
			if (this.components) {
				for (let c of this.components) {
					c.set_node(node);
				}
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
	get parent_param(): TypedMultipleParam<any> | undefined {
		return this._parent_param;
	}
	has_parent_param(): boolean {
		return this._parent_param != null;
	}
	full_path(): string {
		return this.node?.full_path() + '/' + this.name;
	}
	path_relative_to(node: BaseNodeType | BaseParamType): string {
		return CoreWalker.relative_path(node, this);
	}

	// emit
	emit(event_name: ParamEvent): void {
		if (this.emit_controller.emit_allowed) {
			this.emit_controller.increment_count(event_name);
			this.scene.events_controller.dispatch(this, event_name);
		}
	}

	// multiple
	get components() {
		return this._components;
	}
	static get component_names(): string[] {
		return [];
	}
	get component_names(): string[] {
		const c = (<unknown>this.constructor) as TypedParam<T>;
		return c.component_names;
	}
	get is_multiple(): boolean {
		return this.component_names.length > 0;
	}
	init_components() {}

	// expression
	// set_expression(expression: string | null) {
	// 	this.expression_controller.set_expression(expression);
	// }
	has_expression(): boolean {
		return this.expression_controller != null && this.expression_controller.active; // use this._expression_controller to avoid creating it
	}

	// serialize
	to_json() {
		return this.serializer.to_json();
	}
}
export type BaseParamType = TypedParam<ParamType>;
export class BaseParamClass extends TypedParam<ParamType> {}
