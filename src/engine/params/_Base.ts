import {CoreWalker} from '../../core/Walker';
import {CoreGraphNode} from '../../core/graph/CoreGraphNode';
import {BaseNodeType} from '../nodes/_Base';
import {OptionsController} from './utils/OptionsController';
import {ExpressionController} from './utils/ExpressionController';
import {EmitController} from './utils/EmitController';
import {ParamSerializer} from './utils/Serializer';
import {StatesController} from './utils/StatesController';
import {TypedMultipleParam} from './_Multiple';
import {FloatParam} from './Float';
import {ParamType} from '../poly/ParamType';
import {ParamEvent} from '../poly/ParamEvent';
import {PolyScene} from '../scene/PolyScene';
import {ParamInitValuesTypeMap} from '../params/types/ParamInitValuesTypeMap';
import {ParamValuesTypeMap} from '../params/types/ParamValuesTypeMap';
import {ParamValueSerializedTypeMap} from '../params/types/ParamValueSerializedTypeMap';
import {ParamInitValueSerializedTypeMap} from './types/ParamInitValueSerializedTypeMap';

// type ParamTypeElem = ParamType;
type ComputeCallback = (value: void) => void;
const TYPED_PARAM_DEFAULT_COMPONENT_NAMES: Readonly<string[]> = [];

export abstract class TypedParam<T extends ParamType> extends CoreGraphNode {
	// protected _raw_input: ParamInitValuesTypeMap[T];
	protected _default_value!: ParamInitValuesTypeMap[T];
	protected _raw_input!: ParamInitValuesTypeMap[T];
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
	// private _ui_data: UIData | undefined;
	// get ui_data(): UIData {
	// 	return (this._ui_data = this._ui_data || new UIData(this.scene, this));
	// }

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
	// accepts_visitor<T extends ParamVisitor>(visitor: T): ReturnType<T['visit_param']> {
	// 	return visitor.visit_param(this);
	// }

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
	}

	get value(): ParamValuesTypeMap[T] {
		return this._value;
	}
	abstract get default_value_serialized(): ParamInitValueSerializedTypeMap[T];
	abstract get raw_input_serialized(): ParamInitValueSerializedTypeMap[T];
	abstract get value_serialized(): ParamValueSerializedTypeMap[T];
	convert(raw_val: any): ParamValuesTypeMap[T] | null {
		return null;
	}
	static are_raw_input_equal(val1: any, val2: any) {
		return false;
	}
	is_raw_input_equal(other_raw_input: ParamInitValuesTypeMap[T]) {
		return (this.constructor as any).are_raw_input_equal(this._raw_input, other_raw_input);
	}
	static are_values_equal(val1: any, val2: any) {
		return false;
	}
	is_value_equal(other_val: ParamValuesTypeMap[T]) {
		return (this.constructor as any).are_values_equal(this.value, other_val);
	}
	protected _clone_raw_input(raw_input: ParamInitValuesTypeMap[T]): ParamInitValuesTypeMap[T] {
		return raw_input;
	}
	set(raw_input: ParamInitValuesTypeMap[T]): void {
		this._raw_input = this._clone_raw_input(this._prefilter_invalid_raw_input(raw_input));
		this.emit_controller.emit(ParamEvent.RAW_INPUT_UPDATED);
		this.process_raw_input();
	}
	protected _prefilter_invalid_raw_input(raw_input: any): ParamInitValuesTypeMap[T] {
		return raw_input as ParamInitValuesTypeMap[T];
	}
	get default_value() {
		return this._default_value;
	}
	get is_default(): boolean {
		return this._raw_input == this.default_value;
	}
	get raw_input() {
		return this._raw_input;
	}

	protected process_raw_input() {}
	private _is_computing: boolean = false;
	async compute(): Promise<void> {
		if (this.scene.loading_controller.is_loading) {
			console.warn(`param attempt to compute ${this.full_path()}`);
		}

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
		this._default_value = this._clone_raw_input(this._prefilter_invalid_raw_input(init_value));
		// this._raw_input = this._clone_raw_input(init_value);

		// if (this.is_multiple) {
		// 	this.init_components();
		// }

		// this.set(init_value);
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
				node.params.params_node?.add_graph_input(this, false);
			}
		}

		if (this.components) {
			for (let c of this.components) {
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
		param.add_graph_input(this, false);
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
			this.scene.dispatch_controller.dispatch(this, event_name);
		}
	}

	// multiple
	get components() {
		return this._components;
	}
	get component_names(): Readonly<string[]> {
		return TYPED_PARAM_DEFAULT_COMPONENT_NAMES;
	}
	get is_multiple(): boolean {
		return this.component_names.length > 0;
	}
	// create_components() {}
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
export class BaseParamClass extends TypedParam<ParamType> {
	get default_value_serialized() {
		return 'BaseParamClass.default_value_serialized overriden';
	}
	get raw_input_serialized() {
		return 'BaseParamClass.raw_input_serialized overriden';
	}
	get value_serialized() {
		return 'BaseParamClass.value_serialized overriden';
	}
}
