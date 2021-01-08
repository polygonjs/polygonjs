import {CamerasController} from './utils/CamerasController';
import {Cooker} from './utils/Cooker';
import {CookController} from './utils/CookController';
import {CoreGraph} from '../../core/graph/CoreGraph';
import {CorePerformance} from '../../core/performance/CorePerformance';
import {DispatchController} from './utils/DispatchController';
import {ExpressionsController} from './utils/ExpressionsController';
import {LifeCycleController} from './utils/LifeCycleController';
import {LoadingController} from './utils/LoadingController';
import {MissingReferencesController} from './utils/MissingReferencesController';
import {NodesController} from './utils/NodesController';
import {PolySceneSerializer} from './utils/Serializer';
import {SceneEventsDispatcher} from './utils/events/EventsDispatcher';
import {ReferencesController} from './utils/ReferencesController';
import {TimeController} from './utils/TimeController';
import {UniformsController} from './utils/UniformsController';
import {ViewersRegister} from './utils/ViewersRegister';
import {WebGLController} from './utils/WebGLController';

import {Scene} from 'three/src/scenes/Scene';
import {SceneAssetsController} from './utils/AssetsController';
import {SceneLibsController} from './utils/LibsController';
import {BaseNodeType} from '../nodes/_Base';

export class PolyScene {
	protected _defaultScene = new Scene();
	get defaultScene() {
		return this._defaultScene;
	}
	_uuid!: string;
	setUuid(uuid: string) {
		return (this._uuid = uuid);
	}
	get uuid() {
		return this._uuid;
	}
	_name: string | undefined;
	setName(name: string) {
		return (this._name = name);
	}
	get name() {
		return this._name;
	}

	protected _cameras_controller = new CamerasController(this);
	get camerasController() {
		return this._cameras_controller;
	}

	private _cooker = new Cooker(this);
	get cooker() {
		return this._cooker;
	}

	// private _cube_cameras_controller: CubeCamerasController;
	// get cube_cameras_controller() {
	// 	return (this._cube_cameras_controller = this._cube_cameras_controller || new CubeCamerasController(this));
	// }
	private _assets_controller: SceneAssetsController | undefined;
	get assets() {
		return (this._assets_controller = this._assets_controller || new SceneAssetsController());
	}
	private _libs_controller: SceneLibsController | undefined;
	get libs() {
		return (this._libs_controller = this._libs_controller || new SceneLibsController());
	}

	public readonly cook_controller = new CookController();
	async waitForCooksCompleted() {
		return this.cook_controller.waitForCooksCompleted();
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

	private _lifecycle_controller: LifeCycleController | undefined;
	get lifecycleController() {
		return (this._lifecycle_controller = this._lifecycle_controller || new LifeCycleController(this));
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
	nodesByType(type: string) {
		return this.nodesController.nodesByType(type);
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
	setFrame(frame: number) {
		this.timeController.setFrame(frame);
	}

	get frame() {
		return this.timeController.frame;
	}
	get time() {
		return this.timeController.time;
	}
	get frame_range() {
		return this.timeController.frame_range;
	}
	play() {
		this.timeController.play();
	}
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
	mark_as_read_only(requester: BaseNodeType) {
		if (this._read_only) {
			return;
		}
		this._read_only_requester = requester;
		this._read_only = true;
	}
	read_only() {
		return this._read_only;
	}
	read_only_requester() {
		return this._read_only_requester;
	}

	//
	//
	// uniforms
	//
	//
	private _uniforms_controller: UniformsController | undefined;
	get uniforms_controller() {
		return (this._uniforms_controller = this._uniforms_controller || new UniformsController(this));
	}

	//
	//
	// webgl
	//
	//
	private _webgl_controller: WebGLController | undefined;
	get webgl_controller() {
		return (this._webgl_controller = this._webgl_controller || new WebGLController());
	}

	//
	//
	// constructor
	//
	//
	constructor() {
		this._defaultScene.name = 'defaultScene';
		this._defaultScene.matrixAutoUpdate = false;
		// this.mark_as_loaded()
		this._graph.set_scene(this);
		// this.time_controller.init();
		this.nodesController.init();
	}

	//
	//
	// cooker
	//
	//
	batchUpdates(callback: () => void) {
		this._cooker.block();

		callback();

		this._cooker.unblock();
	}

	//
	//
	// nodes
	//
	//
	node(path: string) {
		return this.nodesController.node(path);
	}
	get root() {
		return this.nodesController.root;
	}
}
