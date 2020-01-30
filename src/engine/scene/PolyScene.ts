// import {Scene} from 'three/src/scenes/Scene'
// import {CoreGraph} from 'src/core/graph/CoreGraph'
// import {CorePerformance} from 'src/core/performance/CorePerformance'
// import {Cooker} from 'src/core/graph/Cooker'
// import {EmitPayload} from 'src/core/graph/NodeScene'
// import {BaseNode} from '../nodes/_Base'

// import {CoreObject} from 'src/core/Object';
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
// import {Store} from './concerns/Store'; // TODO: typescript
// import {Uniforms} from './concerns/Uniforms'; // TODO: typescript

// import {CubeCamerasController} from './utils/CubeCamerasController';
import {CamerasController} from './utils/CamerasController';
import {Cooker} from './utils/Cooker';
import {CoreGraph} from 'src/core/graph/CoreGraph';
import {EventsController} from './utils/EventsController';
import {LifeCycleController} from './utils/LifeCycleController';
import {LoadingController} from './utils/LoadingController';
import {MissingReferencesController} from 'src/engine/expressions/MissingReferencesController';
import {NodesController} from './utils/NodesController';
import {CorePerformance} from 'src/core/performance/CorePerformance';
import {TimeController} from './utils/TimeController';
import {Serializer} from './utils/Serializer';
import {UniformsController} from './utils/UniformsController';
import {WebGLController} from './utils/WebGLController';

import {Scene} from 'three/src/scenes/Scene';

export class PolyScene {
	protected _display_scene = new Scene();
	get display_scene() {
		return this._display_scene;
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

	private _cooker = new Cooker();
	get cooker() {
		return this._cooker;
	}

	// private _cube_cameras_controller: CubeCamerasController;
	// get cube_cameras_controller() {
	// 	return (this._cube_cameras_controller = this._cube_cameras_controller || new CubeCamerasController(this));
	// }

	private _events_controller: EventsController | undefined;
	get events_controller() {
		return (this._events_controller = this._events_controller || new EventsController(this));
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

	protected _nodes_controller = new NodesController(this);
	get nodes_controller() {
		return this._nodes_controller;
	}

	protected _performance: CorePerformance | undefined;
	get performance() {
		return (this._performance = this._performance || new CorePerformance());
	}

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
	get frame_range() {
		return this.time_controller.frame_range;
	}
	play() {
		this.time_controller.play();
	}
	pause() {
		this.time_controller.pause();
	}

	private _serializer: Serializer | undefined;
	get serializer() {
		return (this._serializer = this._serializer || new Serializer(this));
	}
	to_json() {
		return this.serializer.to_json();
	}

	private _uniforms_controller: UniformsController | undefined;
	get uniforms_controller() {
		return (this._uniforms_controller = this._uniforms_controller || new UniformsController(this));
	}

	private _webgl_controller: WebGLController | undefined;
	get webgl_controller() {
		return (this._webgl_controller = this._webgl_controller || new WebGLController());
	}

	constructor() {
		// this.mark_as_loaded()
		this._graph.set_scene(this);
		// this.time_controller.init();
		this.nodes_controller.init();
	}

	// cooker
	batch_update(callback: () => void) {
		this._cooker.block();

		callback();

		this._cooker.unblock();
	}

	// nodes
	node(path: string) {
		return this.nodes_controller.node(path);
	}
	get root() {
		return this.nodes_controller.root;
	}
}

// export function ClassDecorator<T>(beanName: string): Function {
// 	return (classConstructor: any) => {
// 		console.log('classConstructor')
// 		console.log(classConstructor)
// 		// const props = getOrCreateProps(classConstructor)
// 		// props.beanName = beanName
// 	}
// }

// export function Param(param_type: string, default_value: number): Function {
// 	return (
// 		target: any,
// 		propertyKey: string,
// 		descriptor: PropertyDescriptor
// 	) => {
// 		console.log('Param')
// 		console.log(target, propertyKey, descriptor)
// 		// Object.assign(target, `_param_${propertyKey}`, 'ta')
// 		// const props = getOrCreateProps(classConstructor)
// 		// props.beanName = beanName
// 	}
// }
// export function ParamFloat(default_value: number, options: object = {}): Function {
// 	return (target: any, propertyKey: string) => {
// 		console.log('Param Float', default_value)
// 		const param_name = propertyKey.substring(7) // removes _param_
// 		console.log('param_name', param_name)
// 		// target.prepare_param_on_init('Float', param_name, default_value)
// 		// console.log(target, propertyKey)
// 		// Object.assign(target, `_param_${propertyKey}`, 'ta')
// 		// const props = getOrCreateProps(classConstructor)
// 		// props.beanName = beanName
// 	}
// }
// export function ClassMethod(value: boolean): Function {
// 	return (
// 		target: any,
// 		propertyKey: string,
// 		descriptor: PropertyDescriptor
// 	) => {
// 		console.log('ClassMethod')
// 		console.log(target, propertyKey, descriptor)
// 		Object.assign(target, `_param_${propertyKey}`, 'ta')
// 		// const props = getOrCreateProps(classConstructor)
// 		// props.beanName = beanName
// 	}
// }

// // @ClassDecorator('bla')
// export class PolyScene {
// 	_display_scene: Scene = new Scene()
// 	_graph: CoreGraph
// 	_performance: CorePerformance
// 	_cooker: Cooker

// 	// @ParamFloat(3, {visible_if: {test: 2}}) _param_radius: number

// 	// constructor() {
// 	// 	const co = new CoreObject()
// 	// 	console.log('CoreObject', co)
// 	// }
// 	graph() {
// 		return this._graph
// 	}
// 	performance() {
// 		return this._performance
// 	}
// 	cooker() {
// 		return this._cooker
// 	}
// 	store_commit(event_name: string, payload: EmitPayload) {}
// 	emit_allowed() {
// 		return true
// 	}
// 	node(path: string): BaseNode {
// 		return null
// 	}

// 	display_scene() {
// 		return this._display_scene
// 	}

// 	is_loading() {
// 		return true
// 	}
// 	loaded(): boolean {
// 		return true
// 	}
// 	root(): BaseNode {
// 		return null
// 	}
// 	context(): any {}

// 	uuid() {
// 		return 'test-uuid'
// 	}
// }
