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
import {
	ParamValueSerializedTypeMap,
	ParamValuePreConversionSerializedTypeMap,
} from '../params/types/ParamValueSerializedTypeMap';
import {ParamInitValueSerializedTypeMap} from './types/ParamInitValueSerializedTypeMap';
import {MethodDependency} from '../expressions/MethodDependency';

type ComputeCallback = (value: void) => void;
const TYPED_PARAM_DEFAULT_COMPONENT_NAMES: Readonly<string[]> = [];

export abstract class TypedParam<T extends ParamType> extends CoreGraphNode {
	protected _default_value!: ParamInitValuesTypeMap[T];
	protected _raw_input!: ParamInitValuesTypeMap[T];
	protected _value!: ParamValuesTypeMap[T];
	protected _node: BaseNodeType;
	protected _parent_param: TypedMultipleParam<any> | undefined;
	protected _components: FloatParam[] | undefined;
	protected _compute_resolves: ComputeCallback[] | undefined;

	private _options: OptionsController = new OptionsController(this);
	get options(): OptionsController {
		return (this._options = this._options || new OptionsController(this));
	}
	private _emit_controller: EmitController = new EmitController(this);
	get emitController(): EmitController {
		return (this._emit_controller = this._emit_controller || new EmitController(this));
	}
	protected _expression_controller: ExpressionController<T> | undefined;
	get expressionController(): ExpressionController<T> | undefined {
		return this._expression_controller; // =
		//this._expression_controller || new ExpressionController(this);
	}
	private _serializer: ParamSerializer<T> | undefined;
	get serializer(): ParamSerializer<T> {
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

	constructor(scene: PolyScene, node: BaseNodeType) {
		super(scene, 'BaseParam');
		this._node = node;
		this._initializeParam();
	}
	dispose() {
		// if any direct predecessor is a MethodDependency,
		// it must be disposed here
		const predecessors = this.graphPredecessors();
		for (let predecessor of predecessors) {
			if (predecessor instanceof MethodDependency) {
				predecessor.dispose();
			}
		}
		this.scene().missingExpressionReferencesController.deregisterParam(this);
		this._expression_controller?.dispose();
		super.dispose();
		this._options?.dispose();
	}
	protected _initializeParam() {}
	// 	// this.addPostDirtyHook(this._remove_node_param_cache.bind(this))
	// }
	// initialize() {
	// 	this.initComponents();
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
	type(): T {
		return (this.constructor as typeof BaseParamClass).type() as T;
	}
	isNumeric(): boolean {
		return false;
	}

	// name
	setName(name: string) {
		super.setName(name);
	}

	get value(): ParamValuesTypeMap[T] {
		return this._value;
	}
	abstract defaultValueSerialized(): ParamInitValueSerializedTypeMap[T];
	abstract rawInputSerialized(): ParamInitValueSerializedTypeMap[T];
	abstract valueSerialized(): ParamValueSerializedTypeMap[T];
	copyValue(param: BaseParamType) {
		if (param.type() == this.type()) {
			this._copyValue(param as TypedParam<T>);
		} else {
			console.warn(`cannot copy value from ${param.type()} to ${this.type()}`);
		}
	}
	protected _copyValue(param: TypedParam<T>) {
		throw 'abstract method param._copy_value';
	}
	valuePreConversionSerialized(): ParamValuePreConversionSerializedTypeMap[T] {
		return undefined as never;
	}
	convert(raw_val: any): ParamValuesTypeMap[T] | null {
		return null;
	}
	static areRawInputEqual(val1: any, val2: any) {
		return false;
	}
	isRawInputEqual(other_raw_input: ParamInitValuesTypeMap[T]) {
		return (this.constructor as any).areRawInputEqual(this._raw_input, other_raw_input);
	}
	static areValuesEqual(val1: any, val2: any) {
		return false;
	}
	isValueEqual(other_val: ParamValuesTypeMap[T]) {
		return (this.constructor as any).areValuesEqual(this.value, other_val);
	}
	protected _cloneRawInput(raw_input: ParamInitValuesTypeMap[T]): ParamInitValuesTypeMap[T] {
		return raw_input;
	}
	set(raw_input: ParamInitValuesTypeMap[T]): void {
		this._raw_input = this._cloneRawInput(this._prefilterInvalidRawInput(raw_input));
		this.emitController.emit(ParamEvent.RAW_INPUT_UPDATED);
		this.processRawInput();
	}
	protected _prefilterInvalidRawInput(raw_input: any): ParamInitValuesTypeMap[T] {
		return raw_input as ParamInitValuesTypeMap[T];
	}
	defaultValue() {
		return this._default_value;
	}
	isDefault(): boolean {
		return this._raw_input == this._default_value;
	}
	rawInput() {
		return this._raw_input;
	}

	protected processRawInput() {}
	private _is_computing: boolean = false;
	async compute(): Promise<void> {
		if (this.scene().loadingController.isLoading()) {
			console.warn(`param attempt to compute ${this.path()}`);
		}

		if (this.isDirty()) {
			if (!this._is_computing) {
				this._is_computing = true;
				await this.processComputation();
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
	protected async processComputation(): Promise<void> {}
	// set_default_value(default_value: ParamValuesTypeMap[T]) {
	// 	this._default_value = default_value;
	// }
	setInitValue(init_value: ParamInitValuesTypeMap[T]) {
		this._default_value = this._cloneRawInput(this._prefilterInvalidRawInput(init_value));
		// this._raw_input = this._cloneRawInput(init_value);

		// if (this.isMultiple()) {
		// 	this.initComponents();
		// }

		// this.set(init_value);
	}
	// eval_p(): Promise<ParamValuesTypeMap[T]> {
	// 	return new Promise((resolve, reject) => {
	// 		resolve();
	// 	});
	// }

	// node
	_setupNodeDependencies(node: BaseNodeType | null) {
		if (!node) {
			if (this._node) {
				this._node.params.params_node?.removeGraphInput(this);
			}
		} else {
			// allow callbacks after the value is set,
			// so that the param does not trigger the node to recompute
			// before all params are added
			this.options.allowCallback();

			if (!this.parent_param) {
				if (this.options.makesNodeDirtyWhenDirty()) {
					node.params.params_node?.addGraphInput(this, false);
				} else {
					// if the param does not make the node cook when dirty,
					// we still want it to run its attached callback when dirty
					this.dirtyController.addPostDirtyHook('run callback', async () => {
						await this.compute();
						this.options.executeCallback();
					});
				}
			}
		}

		if (this.components) {
			for (let c of this.components) {
				c._setupNodeDependencies(node);
			}
		}
	}
	get node() {
		return this._node;
	}
	parent() {
		return this.node;
	}

	// hierarchy
	set_parent_param(param: TypedMultipleParam<any>) {
		param.addGraphInput(this, false);
		this._parent_param = param;
	}
	get parent_param(): TypedMultipleParam<any> | undefined {
		return this._parent_param;
	}
	has_parent_param(): boolean {
		return this._parent_param != null;
	}
	path(): string {
		return this.node?.path() + '/' + this.name();
	}
	pathRelativeTo(node: BaseNodeType): string {
		const nodeRelativePath = CoreWalker.relativePath(node, this.node);

		if (nodeRelativePath.length > 0) {
			return `${nodeRelativePath}${CoreWalker.SEPARATOR}${this.name()}`;
		} else {
			return this.name();
		}
	}

	// emit
	emit(event_name: ParamEvent): void {
		if (this.emitController.emitAllowed()) {
			this.emitController.incrementCount(event_name);
			this.scene().dispatchController.dispatch(this, event_name);
		}
	}

	// multiple
	get components() {
		return this._components;
	}
	componentNames(): Readonly<string[]> {
		return TYPED_PARAM_DEFAULT_COMPONENT_NAMES;
	}
	isMultiple(): boolean {
		return this.componentNames().length > 0;
	}
	// create_components() {}
	initComponents() {}

	// expression
	// set_expression(expression: string | null) {
	// 	this.expressionController.set_expression(expression);
	// }
	hasExpression(): boolean {
		return this.expressionController != null && this.expressionController.active(); // use this._expression_controller to avoid creating it
	}

	// serialize
	toJSON() {
		return this.serializer.toJSON();
	}
}
export type BaseParamType = TypedParam<ParamType>;
export class BaseParamClass extends TypedParam<ParamType> {
	defaultValueSerialized() {
		return 'BaseParamClass.defaultValueSerialized overriden';
	}
	rawInputSerialized() {
		return 'BaseParamClass.rawInputSerialized overriden';
	}
	valueSerialized() {
		return 'BaseParamClass.valueSerialized overriden';
	}
}
