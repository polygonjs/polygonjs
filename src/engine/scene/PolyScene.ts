// import {Scene} from 'three/src/scenes/Scene'
// import {CoreGraph} from '../../core/graph/CoreGraph'
// import {CorePerformance} from '../../core/performance/CorePerformance'
// import {Cooker} from '../../core/graph/Cooker'
// import {EmitPayload} from '../../core/graph/NodeScene'
// import {BaseNode} from '../nodes/_Base'

// import {CoreObject} from '../../core/Object';
// import {Debug} from './concerns/Debug';
// import {Env} from './concerns/Env'
// import {ExpressionRegister} from './concerns/ExpressionRegister';
// import {Frame} from './concerns/Frame';
// import {GraphMixin} from './concerns/Graph';
// import {Js} from './concerns/Js';
// import {Json} from './concerns/Json';
// import {LifeCycle} from './concerns/LifeCycle';
// import {Loading} from './concerns/Loading';
// import {Name} from './concerns/Name';
// import {Nodes} from './concerns/Nodes';
// import {ObjectMixin} from './concerns/Object';
// import {PickerNodes} from './concerns/PickerNodes';
// import {PerformanceMixin} from './concerns/Performance';
// import {Renderer} from './concerns/Renderer';
// import {Store} from './concerns/Store';
// import {Uniforms} from './concerns/Uniforms';

// import {CubeCamerasController} from './utils/CubeCamerasController';
import {CamerasController} from './utils/CamerasController';
import {Cooker} from './utils/Cooker';
import {CoreGraph} from '../../core/graph/CoreGraph';
import {CookController} from './utils/CookController';
import {DispatchController} from './utils/DispatchController';
import {SceneEventsController} from './utils/events/EventsController';
import {LifeCycleController} from './utils/LifeCycleController';
import {LoadingController} from './utils/LoadingController';
import {ExpressionsController} from './utils/ExpressionsController';
import {MissingReferencesController} from './utils/MissingReferencesController';
import {NodesController} from './utils/NodesController';
import {CorePerformance} from '../../core/performance/CorePerformance';
import {TimeController} from './utils/TimeController';
import {PolySceneSerializer} from './utils/Serializer';
import {UniformsController} from './utils/UniformsController';
import {WebGLController} from './utils/WebGLController';

import {Scene} from 'three/src/scenes/Scene';

export class PolyScene {
	protected _default_scene = new Scene();
	get default_scene() {
		return this._default_scene;
	}
	_uuid!: string;
	set_uuid(uuid: string) {
		return (this._uuid = uuid);
	}
	get uuid() {
		return this._uuid;
	}
	_name: string | undefined;
	set_name(name: string) {
		return (this._name = name);
	}
	get name() {
		return this._name;
	}

	protected _cameras_controller = new CamerasController(this);
	get cameras_controller() {
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
	public readonly cook_controller = new CookController();
	async wait_for_cooks_completed() {
		return this.cook_controller.wait_for_cooks_completed();
	}

	private _dispatch_controller: DispatchController | undefined;
	get dispatch_controller() {
		return (this._dispatch_controller = this._dispatch_controller || new DispatchController(this));
	}
	private _events_controller: SceneEventsController | undefined;
	get events_controller() {
		return (this._events_controller = this._events_controller || new SceneEventsController(this));
	}

	private _graph = new CoreGraph();
	get graph() {
		return this._graph;
	}

	private _lifecycle_controller: LifeCycleController | undefined;
	get lifecycle_controller() {
		return (this._lifecycle_controller = this._lifecycle_controller || new LifeCycleController(this));
	}
	private _loading_controller: LoadingController | undefined;
	get loading_controller() {
		return (this._loading_controller = this._loading_controller || new LoadingController(this));
	}

	private _missing_expression_references_controller: MissingReferencesController = new MissingReferencesController();
	get missing_expression_references_controller() {
		return this._missing_expression_references_controller;
	}
	private _expressions_controller: ExpressionsController = new ExpressionsController();
	get expressions_controller() {
		return this._expressions_controller;
	}

	protected _nodes_controller = new NodesController(this);
	get nodes_controller() {
		return this._nodes_controller;
	}

	protected _performance: CorePerformance | undefined;
	get performance() {
		return (this._performance = this._performance || new CorePerformance());
	}

	//
	//
	// time
	//
	//
	protected _time_controller = new TimeController(this);
	get time_controller() {
		return this._time_controller;
	}
	set_frame(frame: number) {
		this.time_controller.set_frame(frame);
	}
	get frame() {
		return this.time_controller.frame;
	}
	get time() {
		return this.time_controller.time;
	}
	get frame_range() {
		return this.time_controller.frame_range;
	}
	play() {
		this.time_controller.play();
	}
	pause() {
		this.time_controller.pause();
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
	to_json() {
		return this.serializer.to_json();
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
		// this.mark_as_loaded()
		this._graph.set_scene(this);
		// this.time_controller.init();
		this.nodes_controller.init();
	}

	//
	//
	// cooker
	//
	//
	batch_update(callback: () => void) {
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
		return this.nodes_controller.node(path);
	}
	get root() {
		return this.nodes_controller.root;
	}
}
