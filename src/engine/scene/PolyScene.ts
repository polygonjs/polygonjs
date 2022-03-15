import {ActorsManager} from './utils/ActorsManager';
import {CamerasController} from './utils/CamerasController';
import {Cooker} from './utils/Cooker';
import {SceneCookController} from './utils/CookController';
import {CoreGraph} from '../../core/graph/CoreGraph';
import {CorePerformance} from '../../core/performance/CorePerformance';
import {DispatchController} from './utils/DispatchController';
import {ExpressionsController} from './utils/ExpressionsController';
import {SceneLifeCycleController} from './utils/LifeCycleController';
import {LoadingController} from './utils/LoadingController';
import {MissingReferencesController} from './utils/missingReferences/MissingReferencesController';
import {NodesController} from './utils/NodesController';
import {PolySceneSerializer} from './utils/Serializer';
import {SceneEventsDispatcher} from './utils/events/EventsDispatcher';
import {ObjectsController} from './utils/ObjectsController';
import {ReferencesController} from './utils/ReferencesController';
import {onTimeTickHook, TimeController} from './utils/TimeController';
import {UniformsController} from './utils/UniformsController';
import {ViewersRegister} from './utils/ViewersRegister';
import {SceneWebGLController} from './utils/WebGLController';
import {WindowController} from './utils/WindowController';
import {SceneAssetsController} from './utils/AssetsController';
import {BaseNodeType} from '../nodes/_Base';
import {ObjNodeChildrenMap} from '../poly/registers/nodes/Obj';
import {ParamsInitData} from '../nodes/utils/io/IOController';
import {Constructor, valueof} from '../../types/GlobalTypes';
import {Scene} from 'three/src/scenes/Scene';
import {CoreString} from '../../core/String';
import {Object3D} from 'three/src/core/Object3D';
import {SceneRenderersRegister} from './utils/SceneRenderersRegister';
import {Poly} from '../Poly';

type SceneBatchUpdateCallback = () => void | Promise<void>;

/**
 * PolyScene contains all nodes within a scene.
 *
 */
export class PolyScene {
	/**
	 * Returns the THREE.Scene.
	 *
	 * @remarks
	 *
	 * Read more about how to use a THREE.Scene on [THREE's documentation](https://threejs.org/docs/?q=scene#api/en/scenes/Scene)
	 *
	 */
	threejsScene(): Scene {
		return this.root().object;
	}
	private _uuid!: string;
	setUuid(uuid: string) {
		return (this._uuid = uuid);
	}
	get uuid() {
		return this._uuid;
	}
	private _name: string | undefined;
	setName(newName: string) {
		newName = CoreString.sanitizeName(newName);
		return (this._name = newName);
	}
	name() {
		return this._name;
	}

	protected _cameras_controller = new CamerasController(this);
	get camerasController() {
		return this._cameras_controller;
	}
	/**
	 * Returns the cameraNode that has been set as main
	 *
	 */
	mainCameraNode() {
		return this.camerasController.mainCameraNode();
	}

	private _cooker = new Cooker(this);
	get cooker() {
		return this._cooker;
	}

	// private _cube_cameras_controller: CubeCamerasController;
	// get cube_cameras_controller() {
	// 	return (this._cube_cameras_controller = this._cube_cameras_controller || new CubeCamerasController(this));
	// }
	private _actorsManager: ActorsManager | undefined;
	get actorsManager() {
		return (this._actorsManager = this._actorsManager || new ActorsManager(this));
	}

	private _assets_controller: SceneAssetsController | undefined;
	get assets() {
		return (this._assets_controller = this._assets_controller || new SceneAssetsController());
	}

	public readonly cookController = new SceneCookController();
	/**
	 * Returns a promise to wait for all nodes to have cooked when loading a scene.
	 *
	 */
	async waitForCooksCompleted(): Promise<void> {
		return await this.cookController.waitForCooksCompleted();
	}

	private _dispatch_controller: DispatchController | undefined;
	get dispatchController() {
		return (this._dispatch_controller = this._dispatch_controller || new DispatchController(this));
	}
	private _events_dispatcher: SceneEventsDispatcher | undefined;
	get eventsDispatcher() {
		return (this._events_dispatcher = this._events_dispatcher || new SceneEventsDispatcher(this));
	}

	private _graph = new CoreGraph();
	get graph() {
		return this._graph;
	}

	private _lifecycleController: SceneLifeCycleController | undefined;
	get lifecycleController() {
		return (this._lifecycleController = this._lifecycleController || new SceneLifeCycleController(this));
	}
	private _loading_controller: LoadingController | undefined;
	get loadingController() {
		return (this._loading_controller = this._loading_controller || new LoadingController(this));
	}

	private _missing_expression_references_controller: MissingReferencesController = new MissingReferencesController(
		this
	);
	get missingExpressionReferencesController() {
		return this._missing_expression_references_controller;
	}
	private _expressions_controller: ExpressionsController = new ExpressionsController();
	get expressionsController() {
		return this._expressions_controller;
	}

	protected _nodes_controller = new NodesController(this);
	get nodesController() {
		return this._nodes_controller;
	}

	public readonly renderersRegister = new SceneRenderersRegister(this);
	/**
	 * Creates a new node.
	 *
	 * nodeClass can be either a string or a node class. Both examples below work:
	 *
	 * - polyScene.createNode('box'): returns a BoxSopNode
	 * - polyScene.createNode(boxSopNode): returns a BoxSopNode
	 *
	 */
	createNode<S extends keyof ObjNodeChildrenMap>(
		nodeClass: S,
		paramsInitValueOverrides?: ParamsInitData
	): ObjNodeChildrenMap[S];
	createNode<K extends valueof<ObjNodeChildrenMap>>(
		nodeClass: Constructor<K>,
		paramsInitValueOverrides?: ParamsInitData
	): K;
	createNode<K extends valueof<ObjNodeChildrenMap>>(
		nodeClass: Constructor<K>,
		paramsInitValueOverrides?: ParamsInitData
	): K {
		return this.root().createNode(nodeClass, paramsInitValueOverrides) as K;
	}
	/**
	 * returns all nodes with a given type
	 *
	 * - polyScene.nodesByType('box'): returns all BoxSopNodes
	 */
	nodesByType(type: string): BaseNodeType[] {
		return this.nodesController.nodesByType(type);
	}
	protected _objects_controller = new ObjectsController(this);
	get objectsController() {
		return this._objects_controller;
	}
	/**
	 * returns a THREE.Object3D whose name matches the mask
	 *
	 */
	findObjectByMask(mask: string): Object3D | undefined {
		return this._objects_controller.findObjectByMask(mask);
	}
	/**
	 * returns a list THREE.Object3Ds whose names matche the mask
	 *
	 */
	objectsByMask(mask: string): Object3D[] {
		return this._objects_controller.objectsByMask(mask);
	}

	protected _references_controller = new ReferencesController(this);
	get referencesController() {
		return this._references_controller;
	}

	protected _performance: CorePerformance | undefined;
	get performance() {
		return (this._performance = this._performance || new CorePerformance());
	}

	protected _viewers_register: ViewersRegister | undefined;
	get viewersRegister() {
		return (this._viewers_register = this._viewers_register || new ViewersRegister(this));
	}

	//
	//
	// time
	//
	//
	protected _time_controller = new TimeController(this);
	get timeController() {
		return this._time_controller;
	}
	/**
	 * sets the current frame
	 *
	 */
	setFrame(frame: number) {
		this.timeController.setFrame(frame);
	}
	setFrameToStart() {
		this.timeController.setFrameToStart();
	}

	/**
	 * returns the current frame
	 *
	 */
	frame(): number {
		return this.timeController.frame();
	}
	/**
	 * returns the current time
	 *
	 */
	time(): number {
		return this.timeController.time();
	}
	maxFrame() {
		return this.timeController.maxFrame();
	}
	/**
	 * starts playing the scene
	 *
	 */
	play() {
		this.timeController.play();
	}
	/**
	 * pauses the scene
	 *
	 */
	pause() {
		this.timeController.pause();
	}

	//
	//
	// serializer
	//
	//
	private _serializer: PolySceneSerializer | undefined;
	private get serializer() {
		return (this._serializer = this._serializer || new PolySceneSerializer(this));
	}
	toJSON() {
		return this.serializer.toJSON();
	}
	private _read_only = false;
	private _read_only_requester: BaseNodeType | undefined;
	markAsReadOnly(requester: BaseNodeType) {
		if (this._read_only) {
			return;
		}
		this._read_only_requester = requester;
		this._read_only = true;
	}
	readOnly() {
		return this._read_only;
	}
	readOnlyRequester() {
		return this._read_only_requester;
	}

	//
	//
	// uniforms
	//
	//
	private _uniformsController: UniformsController | undefined;
	get uniformsController() {
		return (this._uniformsController = this._uniformsController || new UniformsController(this));
	}

	//
	//
	// webgl
	//
	//
	private _webgl_controller: SceneWebGLController | undefined;
	get webgl_controller() {
		return (this._webgl_controller = this._webgl_controller || new SceneWebGLController());
	}

	//
	//
	// window
	//
	//
	private _windowController: WindowController | undefined;
	get windowController() {
		return (this._windowController = this._windowController || new WindowController(this));
	}

	//
	//
	// constructor
	//
	//
	constructor() {
		// this.mark_as_loaded()
		this._graph.setScene(this);
		// this.time_controller.init();
		this.nodesController.init();

		Poly.scenesRegister.registerScene(this);
	}

	dispose() {
		this._windowController?.dispose();
		Poly.scenesRegister.deregisterScene(this);
	}

	//
	//
	// cooker
	//
	//
	/**
	 * batchUpdates can be useful to set multiple parameter values without triggering a recook for each update.
	 *
	 */
	async batchUpdates(callback: SceneBatchUpdateCallback) {
		this._cooker.block();

		await callback();

		this._cooker.unblock();
	}

	//
	//
	// nodes
	//
	//
	/**
	 * returns a node based on its path
	 *
	 * - polyScene.node('/geo1')
	 *
	 */
	node(path: string) {
		return this.nodesController.node(path);
	}
	/**
	 * returns the root node
	 *
	 */
	root() {
		return this.nodesController.root();
	}

	//
	//
	// CALLBACKS
	//
	//
	/**
	 * registers a BeforeTick callback. BeforeTick callbacks are run before updating the frame (and therefore before any time dependent node has changed)
	 *
	 */
	registerOnBeforeTick(callbackName: string, callback: onTimeTickHook): void {
		this.timeController.registerOnBeforeTick(callbackName, callback);
	}
	/**
	 * unregisters BeforeTick callback
	 *
	 */
	unRegisterOnBeforeTick(callbackName: string): void {
		this.timeController.unRegisterOnBeforeTick(callbackName);
	}
	/**
	 * Returns the list registered BeforeTick callback names
	 *
	 */
	registeredBeforeTickCallbacks(): Map<string, onTimeTickHook> {
		return this.timeController.registeredBeforeTickCallbacks();
	}
	/**
	 * registers AfterTick callback. AfterTick callbacks are run after updating the frame (and therefore after any time dependent node has changed)
	 *
	 */
	registerOnAfterTick(callbackName: string, callback: onTimeTickHook): void {
		this.timeController.registerOnAfterTick(callbackName, callback);
	}
	/**
	 * unregisters AfterTick callback
	 *
	 */
	unRegisterOnAfterTick(callbackName: string): void {
		this.timeController.unRegisterOnAfterTick(callbackName);
	}
	/**
	 * Returns the list registered AfterTick callback names
	 *
	 */
	registeredAfterTickCallbacks(): Map<string, onTimeTickHook> {
		return this.timeController.registeredAfterTickCallbacks();
	}
}
