import {PolyScene} from '../scene/PolyScene';
import {CoreGraphNode} from '../../core/graph/CoreGraphNode';
import {UIData} from './utils/UIData';
import {FlagsController, FlagsControllerD} from './utils/FlagsController';
import {NodeStatesController} from './utils/StatesController';
import {HierarchyParentController} from './utils/hierarchy/ParentController';
import {HierarchyChildrenController, NodeCreateOptions} from './utils/hierarchy/ChildrenController';
import {NodeLifeCycleController} from './utils/LifeCycleController';
import {TypedContainerController} from './utils/ContainerController';
import {NodeCookController, OnCookCompleteHook} from './utils/CookController';
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
import {BaseNodeByContextMap, NodeContext} from '../poly/NodeContext';
import {ParamsAccessorType, ParamsAccessor} from './utils/params/ParamsAccessor';
// import {ContainerMap, ContainerType} from '../containers/utils/ContainerMap';
import {ContainableMap} from '../containers/utils/ContainableMap';
import {ParamOptions} from '../params/utils/OptionsController';
import {ParamType} from '../poly/ParamType';
import {DisplayNodeController} from './utils/DisplayNodeController';
// import {NodeTypeMap} from '../containers/utils/ContainerMap';
import {ParamInitValueSerialized} from '../params/types/ParamInitValueSerialized';
import {ModuleName} from '../poly/registers/modules/Common';
import {BasePersistedConfig} from './utils/BasePersistedConfig';
import {AssemblerName} from '../poly/registers/assemblers/_BaseRegister';
import {PolyNodeController} from './utils/poly/PolyNodeController';
import {CoreGraphNodeId} from '../../core/graph/CoreGraph';
import {PolyDictionary} from '../../types/GlobalTypes';
import {SetInputsOptions} from './utils/io/InputsController';
import {OnNodeRegisterCallback} from '../poly/registers/nodes/NodesRegister';
import {EventDispatcher, BaseEvent, EventListener} from 'three';
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

export interface BaseNodeEvent extends BaseEvent {
	target?: BaseNodeType;
	// [attachment: string]: any;
}
export const DEFAULT_DATA_TYPE = 'default';

/**
 *
 *
 * TypedNode is the base class that all nodes inherit from. This inherits from [CoreGraphNode](/docs/api/CoreGraphNode).
 *
 */
export class TypedNode<NC extends NodeContext, K extends NodeParamsConfig> extends CoreGraphNode {
	containerController: TypedContainerController<NC> = new TypedContainerController<NC>(this);

	private _parent_controller: HierarchyParentController | undefined;

	private _uiData: UIData | undefined;

	private _states: NodeStatesController<NC> | undefined;
	private _lifecycle: NodeLifeCycleController | undefined;
	private _serializer: NodeSerializer | undefined;
	private _cookController: NodeCookController<NC> | undefined;
	public readonly flags: FlagsController | undefined;
	public readonly displayNodeController: DisplayNodeController | undefined;
	public readonly persisted_config: BasePersistedConfig | undefined;

	private _paramsController: ParamsController | undefined;
	readonly paramsConfig: K | undefined;
	readonly pv: ParamsValueAccessorType<K> = (<unknown>new ParamsValueAccessor<K>()) as ParamsValueAccessorType<K>;
	// readonly pv: ParamsValueAccessor<K> = new ParamsValueAccessor<K>(this);
	readonly p: ParamsAccessorType<K> = (<unknown>new ParamsAccessor<K>()) as ParamsAccessorType<K>;
	copy_param_values(node: TypedNode<NC, K>) {
		const non_spare = this.params.non_spare;
		for (let param of non_spare) {
			const other_param = node.params.get(param.name());
			if (other_param) {
				param.copyValue(other_param);
			}
		}
	}
	dataType(): string {
		return DEFAULT_DATA_TYPE;
	}

	private _nameController: NameController | undefined;
	get parentController(): HierarchyParentController {
		return (this._parent_controller = this._parent_controller || new HierarchyParentController(this));
	}
	static displayedInputNames(): string[] {
		return [];
	}
	displayedInputNames(): string[] {
		return (this.constructor as any as TypedNode<NC, K>).displayedInputNames();
	}

	private _childrenController: HierarchyChildrenController | undefined;
	protected _childrenControllerContext: NodeContext | undefined;
	childrenControllerContext() {
		return this._childrenControllerContext;
	}
	private _create_childrenController(): HierarchyChildrenController | undefined {
		if (this._childrenControllerContext) {
			return new HierarchyChildrenController(this, this._childrenControllerContext);
		}
	}
	get childrenController(): HierarchyChildrenController | undefined {
		return (this._childrenController = this._childrenController || this._create_childrenController());
	}
	childrenAllowed(): boolean {
		return this._childrenControllerContext != null;
	}
	sceneReadonly(): boolean {
		return false;
	}

	get uiData(): UIData {
		return (this._uiData = this._uiData || new UIData(this));
	}

	get states(): NodeStatesController<NC> {
		return (this._states = this._states || new NodeStatesController(this));
	}
	get lifecycle(): NodeLifeCycleController {
		return (this._lifecycle = this._lifecycle || new NodeLifeCycleController(this));
	}
	get serializer(): NodeSerializer {
		return (this._serializer = this._serializer || new NodeSerializer(this));
	}

	get cookController(): NodeCookController<NC> {
		return (this._cookController = this._cookController || new NodeCookController(this));
	}
	protected _io: IOController<NC> | undefined;
	get io(): IOController<NC> {
		return (this._io = this._io || new IOController(this));
	}
	get nameController(): NameController {
		return (this._nameController = this._nameController || new NameController(this));
	}
	/**
	 * sets the name of a node. Note that if a sibling node already has that name, it will be updated to be unique.
	 *
	 */
	override setName(name: string) {
		this.nameController.setName(name);
	}
	_setCoreName(name: string) {
		this._name = name;
	}

	get params(): ParamsController {
		return (this._paramsController = this._paramsController || new ParamsController(this));
	}
	// get processing_context(): ProcessingContext {
	// 	return (this._processing_context = this._processing_context || new ProcessingContext(this));
	// }

	constructor(scene: PolyScene, nodeName: string = 'BaseNode', public createOptions?: NodeCreateOptions) {
		super(scene, nodeName);
	}

	private _initialized: boolean = false;
	public initializeBaseAndNode() {
		if (!this._initialized) {
			this._initialized = true;

			this.displayNodeController?.initializeNode();

			this.initializeBaseNode(); // for base classes of Sop, Obj...
			this.initializeNode(); // for Derivated node clases, like BoxSop, TransformSop...
			if (this.polyNodeController) {
				this.polyNodeController.initializeNode();
			}
		} else {
			console.warn('node already initialized');
		}
	}
	protected initializeBaseNode() {}
	protected initializeNode() {}

	static type(): string {
		throw 'type to be overriden';
	}
	static onRegister: OnNodeRegisterCallback | undefined;
	/**
	 * returns the type of the node.
	 *
	 */
	type() {
		const c = this.constructor as typeof BaseNodeClass;
		return c.type();
	}
	static context(): NodeContext {
		console.error('node has no node_context', this);
		throw 'context requires override';
	}
	/**
	 * returns the context.
	 *
	 */
	context(): NodeContext {
		const c = this.constructor as typeof BaseNodeClass;
		return c.context();
	}

	static require_webgl2(): boolean {
		return false;
	}
	require_webgl2(): boolean {
		const c = this.constructor as typeof BaseNodeClass;
		return c.require_webgl2();
	}

	setParent(parent: BaseNodeType | null) {
		this.parentController.setParent(parent);
	}
	/**
	 * returns the parent.
	 *
	 */
	parent() {
		return this.parentController.parent();
	}
	insideALockedParent(): boolean {
		return this.lockedParent() != null;
	}
	lockedOrInsideALockedParent(): boolean {
		return this.polyNodeController?.locked() || this.insideALockedParent();
	}
	selfOrLockedParent(): BaseNodeType | null {
		if (this.polyNodeController?.locked()) {
			return this;
		}
		return this.lockedParent();
	}
	lockedParent(): BaseNodeType | null {
		const parent = this.parent();
		if (!parent) {
			return null;
		}
		if (parent.polyNodeController && parent.polyNodeController.locked()) {
			return parent;
		}
		return parent.lockedParent();
	}
	firstAncestorWithContext<N extends NodeContext>(context: N) {
		return this.parentController.firstAncestorWithContext(context);
	}
	root() {
		return this._scene.root();
	}
	/**
	 * returns the path.
	 *
	 */
	path(relative_to_parent?: BaseNodeType): string {
		return this.parentController.path(relative_to_parent);
	}

	// params
	createParams() {}
	addParam<T extends ParamType>(
		type: T,
		name: string,
		default_value: ParamInitValuesTypeMap[T],
		options?: ParamOptions
	): ParamConstructorMap[T] | undefined {
		return this._paramsController?.addParam(type, name, default_value, options);
	}
	paramDefaultValue(name: string): ParamInitValueSerialized {
		return null;
	}

	// cook
	cook(input_contents: any[]): any {
		return null;
	}
	/**
	 * registers a callback that will be run every time the node finishes cooking.
	 *
	 */
	onCookEnd(callbackName: string, callback: OnCookCompleteHook) {
		this.cookController.registerOnCookEnd(callbackName, callback);
	}

	/**
	 * returns a promise that will be resolved when the node finishes cooking.
	 *
	 */
	async compute() {
		if (this.isDirty() || this.flags?.bypass?.active()) {
			return await this.containerController.compute();
		} else {
			return this.containerController.container();
		}
	}
	_setContainer(content: ContainableMap[NC] /*, message: string | null = null*/) {
		// TODO: typescript: why is this a type of never
		this.containerController.container().set_content(content as never); //, this.self.cook_eval_key());
		if (content != null) {
			if (!(content as any).name) {
				(content as any).name = this.path();
			}
			if (!(content as any).node) {
				(content as any).node = this;
			}
		}
		this.cookController.endCook(/*message*/);
	}

	/**
	 * create a node.
	 *
	 */
	createNode(nodeClass: any, options?: NodeCreateOptions) {
		return this.childrenController?.createNode(nodeClass, options);
	}
	createOperationContainer(type: string, operation_container_name: string, options?: NodeCreateOptions) {
		return this.childrenController?.createOperationContainer(type, operation_container_name, options);
	}
	/**
	 * removes a child node
	 *
	 */
	removeNode(node: BaseNodeType) {
		this.childrenController?.removeNode(node);
	}
	override dispose() {
		super.dispose();
		this.setParent(null);
		if (this._nameController) {
			this._nameController.dispose();
			this._nameController = undefined;
		}
		if (this._io) {
			this._io.dispose();
			this._io = undefined;
		}
		if (this._lifecycle) {
			this._lifecycle.dispose();
			this._lifecycle = undefined;
		}
		if (this.displayNodeController) {
			this.displayNodeController.dispose();
			// this.displayNodeController = undefined
		}
		if (this._childrenController) {
			this._childrenController.dispose();
			this._childrenController = undefined;
		}
		if (this._paramsController) {
			this._paramsController.dispose();
			this._paramsController = undefined;
		}
		if (this._cookController) {
			this._cookController.dispose();
			this._cookController = undefined;
		}
		if (this._serializer) {
			this._serializer.dispose();
			this._serializer = undefined;
		}
		if (this._uiData) {
			this._uiData.dispose();
			this._uiData = undefined;
		}
	}

	/**
	 * returns the list of children
	 *
	 */
	children() {
		return this.childrenController?.children() || [];
	}
	/**
	 * returns a child node
	 *
	 */
	node(path: string) {
		return this.parentController?.findNode(path) || null;
	}
	/**
	 * returns a sibling node
	 *
	 */
	nodeSibling(name: string): BaseNodeByContextMap[NC] | null {
		const parent = this.parent();
		if (parent) {
			const node = parent.childrenController?.childByName(name);
			if (node) {
				return node as BaseNodeByContextMap[NC];
			}
		}
		return null;
	}
	/**
	 * returns the children matching the type
	 *
	 */
	nodesByType(type: string) {
		return this.childrenController?.nodesByType(type) || [];
	}

	/**
	 * sets a node as input
	 *
	 */
	setInput(
		inputIndexOrName: number | string,
		node: BaseNodeByContextMap[NC] | null,
		outputIndexOrName?: number | string,
		options?: SetInputsOptions
	) {
		this.io.inputs.setInput(inputIndexOrName, node, outputIndexOrName, options);
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
	emit(event_name: NodeEvent.POLY_NODE_LOCK_STATE_UPDATED): void;
	emit(event_name: NodeEvent, data: object | null = null): void {
		this.scene().dispatchController.dispatch(this, event_name, data);
	}
	private __eventsDispatcher: EventDispatcher<BaseNodeEvent> | undefined;
	private _eventsDispatcher() {
		return (this.__eventsDispatcher = this.__eventsDispatcher || new EventDispatcher());
	}
	dispatchEvent(event: {type: string}) {
		this._eventsDispatcher().dispatchEvent(event);
	}
	addEventListener(type: string, listener: EventListener<BaseNodeEvent, string, EventDispatcher<BaseNodeEvent>>) {
		this._eventsDispatcher().addEventListener(type, listener);
	}
	removeEventListener(type: string, listener: EventListener<BaseNodeEvent, string, EventDispatcher<BaseNodeEvent>>) {
		this._eventsDispatcher().removeEventListener(type, listener);
	}

	// serializer
	toJSON(include_param_components: boolean = false) {
		return this.serializer.toJSON(include_param_components);
	}

	// modules
	public async requiredModules(): Promise<ModuleName[] | void> {}
	public usedAssembler(): AssemblerName | void {}
	public integrationData(): IntegrationData | void {}

	// poly nodes
	public readonly polyNodeController: PolyNodeController | undefined;
}

export type BaseNodeType = TypedNode<any, any>;
export class BaseNodeClass extends TypedNode<any, any> {}

export class BaseNodeClassWithDisplayFlag extends TypedNode<any, any> {
	public override readonly flags: FlagsControllerD = new FlagsControllerD(this);
}
