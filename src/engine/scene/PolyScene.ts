import {ActorsManager} from './utils/ActorsManager';
import {SceneCamerasController} from './utils/SceneCamerasController';
import {Cooker} from './utils/Cooker';
import {SceneCookController} from './utils/CookController';
import {CoreGraph} from '../../core/graph/CoreGraph';
import {CorePerformance} from '../../core/performance/CorePerformance';
import {DispatchController} from './utils/DispatchController';
import {ExpressionsController} from './utils/ExpressionsController';
import {SceneLifeCycleController} from './utils/LifeCycleController';
import {LoadingController} from './utils/LoadingController';
import {MissingReferencesController} from './utils/missingReferences/MissingReferencesController';
import {GraphNodesController} from './utils/GraphNodesController';
import {NodesController} from './utils/NodesController';
// import {PolySceneSerializer} from './utils/Serializer';
import {SceneEventsDispatcher} from './utils/events/EventsDispatcher';
import {ObjectsController} from './utils/ObjectsController';
import {ScenePerformanceMonitor} from './utils/ScenePerformanceMonitor';
import {ReferencesController} from './utils/ReferencesController';
import {
	onTimeTickHook,
	TimeController,
	TimeControllerUpdateTimeOptions,
	TIME_CONTROLLER_UPDATE_TIME_OPTIONS_DEFAULT,
} from './utils/TimeController';
import {UniformsController} from './utils/UniformsController';
import {ViewersRegister} from './utils/ViewersRegister';
import {SceneWebGLController} from './utils/WebGLController';
import {WindowController} from './utils/WindowController';
import {SceneAssetsController} from './utils/AssetsController';
import {SceneTraverserController} from './utils/SceneTraverser';
import {BaseNodeType} from '../nodes/_Base';
import {ObjNodeChildrenMap} from '../poly/registers/nodes/Obj';
import {Constructor, valueof} from '../../types/GlobalTypes';
import {Raycaster, Scene, WebGLRenderer} from 'three';
import {CoreString} from '../../core/String';
import {SceneRenderersRegister, RegisterRendererOptions} from './utils/SceneRenderersRegister';
import {Poly} from '../Poly';
import {NodeCreateOptions} from '../nodes/utils/hierarchy/ChildrenController';
import {SceneWebXRController} from './utils/WebXREventsController';
import {CoreObjectType, ObjectContent} from '../../core/geometry/ObjectContent';
import {CoreParamSerializer} from '../params/utils/CoreParamSerializer';
import type {ParamType} from '../poly/ParamType';

interface PolySceneCreateOptions {
	root: NodeCreateOptions;
	paramsSerializerClass?: typeof CoreParamSerializer<ParamType>;
}

type SceneBatchUpdateCallback = () => void | Promise<void>;
interface UpdateState {
	scene: Scene;
}

/**
 *
 *
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
		return (this._name = PolyScene.sanitizeName(newName));
	}
	static sanitizeName(newName: string) {
		newName = CoreString.sanitizeName(newName);
		// force lower case for now, as the editor export uses this
		// and it may be safer to use lowercase to make it work across OSes
		newName = newName.toLowerCase();
		return newName;
	}
	name() {
		return this._name;
	}

	protected _camerasController: SceneCamerasController | undefined;
	get camerasController() {
		return (this._camerasController = this._camerasController || new SceneCamerasController(this));
	}
	/**
	 * Returns the camera object that has been set as main
	 *
	 */
	mainCamera() {
		return this.camerasController.mainCamera();
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

	private _assetsController: SceneAssetsController | undefined;
	get assets() {
		return (this._assetsController = this._assetsController || new SceneAssetsController());
	}

	public readonly cookController = new SceneCookController();
	/**
	 * Returns a promise to wait for all nodes to have cooked when loading a scene.
	 *
	 */
	async waitForCooksCompleted(): Promise<void> {
		return await this.cookController.waitForCooksCompleted();
	}

	private _dispatchController: DispatchController | undefined;
	get dispatchController() {
		return (this._dispatchController = this._dispatchController || new DispatchController(this));
	}
	private _eventsDispatcher: SceneEventsDispatcher | undefined;
	get eventsDispatcher() {
		return (this._eventsDispatcher = this._eventsDispatcher || new SceneEventsDispatcher(this));
	}
	private _webXRController: SceneWebXRController | undefined;
	get webXR() {
		return (this._webXRController = this._webXRController || new SceneWebXRController(this));
	}
	/**
	 * When using Polygonjs viewers, a raycaster is created to use mouse events and detect if there are any object under the cursor.
	 * But if no viewer is created, such as when [importing a scene in react three fiber](/docs/integrations/react_three_fiber),
	 * It is then useful to give a raycaster.
	 *
	 */
	setRaycaster(raycaster: Raycaster) {
		this.eventsDispatcher.setRaycaster(raycaster);
	}

	private _graph = new CoreGraph();
	get graph() {
		return this._graph;
	}

	private _lifecycleController: SceneLifeCycleController | undefined;
	get lifecycleController() {
		return (this._lifecycleController = this._lifecycleController || new SceneLifeCycleController(this));
	}
	private _loadingController: LoadingController | undefined;
	get loadingController() {
		return (this._loadingController = this._loadingController || new LoadingController(this));
	}

	private _missingExpressionReferencesController: MissingReferencesController = new MissingReferencesController(this);
	get missingExpressionReferencesController() {
		return this._missingExpressionReferencesController;
	}
	private _expressions_controller: ExpressionsController = new ExpressionsController();
	get expressionsController() {
		return this._expressions_controller;
	}

	protected _nodesController = new NodesController(this);
	get nodesController() {
		return this._nodesController;
	}
	protected _graphNodesController = new GraphNodesController(this);
	get graphNodesController() {
		return this._graphNodesController;
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
	createNode<S extends keyof ObjNodeChildrenMap>(nodeClass: S, options?: NodeCreateOptions): ObjNodeChildrenMap[S];
	createNode<K extends valueof<ObjNodeChildrenMap>>(nodeClass: Constructor<K>, options?: NodeCreateOptions): K;
	createNode<K extends valueof<ObjNodeChildrenMap>>(nodeClass: Constructor<K>, options?: NodeCreateOptions): K {
		return this.root().createNode(nodeClass, options) as K;
	}
	/**
	 * returns all nodes with a given type
	 *
	 * - polyScene.nodesByType('box'): returns all BoxSopNodes
	 */
	nodesByType(type: string): BaseNodeType[] {
		return this.nodesController.nodesByType(type);
	}
	protected _objectsController = new ObjectsController(this);
	get objectsController() {
		return this._objectsController;
	}
	/**
	 * returns a THREE.Object3D whose name matches the mask
	 *
	 */
	findObjectByMask<T extends CoreObjectType>(mask: string): ObjectContent<T> | undefined {
		return this._objectsController.findObjectByMask(mask);
	}
	/**
	 * returns a list THREE.Object3Ds whose names matche the mask
	 *
	 */
	objectsByMask<T extends CoreObjectType>(mask: string, parent?: ObjectContent<T>): ObjectContent<T>[] {
		return this._objectsController.objectsByMask(mask, parent);
	}

	protected _referencesController = new ReferencesController(this);
	get referencesController() {
		return this._referencesController;
	}

	protected _performance: CorePerformance | undefined;
	get performance() {
		return (this._performance = this._performance || new CorePerformance());
	}
	public readonly perfMonitor = new ScenePerformanceMonitor(this);

	protected _viewersRegister: ViewersRegister | undefined;
	get viewersRegister() {
		return (this._viewersRegister = this._viewersRegister || new ViewersRegister(this));
	}
	public readonly sceneTraverser = new SceneTraverserController(this);
	/**
	 * updates Polygonjs scene internals. This is called automatically when using Polygonjs viewers,
	 * but you would need to call it yourself in the render loop when adding your scene to threejs or react-three-fiber.
	 * See [https://polygonjs.com/docs/integrations](https://polygonjs.com/docs/integrations)
	 *
	 */
	update(delta: number, state?: UpdateState) {
		// setDelta is necessary here, as this function is most likely called from an integration with threejs, using a custom render loop
		this.timeController.setDelta(delta);
		this.timeController.incrementTimeIfPlaying(TIME_CONTROLLER_UPDATE_TIME_OPTIONS_DEFAULT);
		this.sceneTraverser.traverseScene(state?.scene);
	}

	//
	//
	// time
	//
	//
	readonly timeController = new TimeController(this);
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
	/**
	 * increments the time
	 *
	 */
	incrementTime(options?: TimeControllerUpdateTimeOptions) {
		this.timeController.incrementTime(options);
	}
	/**
	 * increments the time if the scene is playing()
	 *
	 */
	incrementTimeIfPlaying(options?: TimeControllerUpdateTimeOptions) {
		this.timeController.incrementTimeIfPlaying(options);
	}
	/**
	 * registers a renderer
	 *
	 */
	registerRenderer(renderer: WebGLRenderer, options?: RegisterRendererOptions) {
		return this.renderersRegister.registerRenderer(renderer, options);
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
	private _webglController: SceneWebGLController | undefined;
	get webgl_controller() {
		return (this._webglController = this._webglController || new SceneWebGLController());
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
	constructor(options?: PolySceneCreateOptions) {
		this._graph.setScene(this);
		this._paramSerializerClass = options?.paramsSerializerClass;
		this.nodesController.createRoot(options?.root);
		Poly.scenesRegister.registerScene(this);
	}

	private _disposed = false;
	dispose() {
		if (this._disposed == true) {
			return;
		}
		this._disposed = true;
		this.batchUpdates(() => {
			this.nodesController.traverseNodes((node) => {
				node.parent()?.removeNode(node);
			});
		});
		this._windowController?.dispose();
		this.renderersRegister.dispose();
		Poly.scenesRegister.deregisterScene(this);
	}

	private _paramSerializerClass: typeof CoreParamSerializer<ParamType> | undefined;
	paramSerializerClass() {
		return this._paramSerializerClass;
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
	/**
	 * traverse all nodes and runs a callback for each
	 *
	 */
	traverseNodes(callback: (node: BaseNodeType) => void) {
		this._nodesController.traverseNodes(callback);
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
	 * return true if a callback is registered with that name
	 *
	 */
	hasBeforeTickCallback(callbackName: string): boolean {
		return this.timeController.hasBeforeTickCallback(callbackName);
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
	/**
	 * return true if a callback is registered with that name
	 *
	 */
	hasAfterTickCallback(callbackName: string): boolean {
		return this.timeController.hasAfterTickCallback(callbackName);
	}
}
