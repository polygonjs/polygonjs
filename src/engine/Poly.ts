import {BaseNodeClass, BaseNodeType} from './nodes/_Base';
import {PolyScene} from './scene/PolyScene';
import {RenderersController} from './poly/RenderersController';
import {PolyLibsController} from './poly/PolyLibsController';
import {
	NodesRegister,
	NodeRegisterOptions,
	OperationRegisterOptions,
	BaseNodeConstructor,
	OperationsRegister,
} from './poly/registers/nodes/NodesRegister';
import {ExpressionRegister} from './poly/registers/expressions/ExpressionRegister';
import {NodeContext} from './poly/NodeContext';
import {AssemblersRegister} from './poly/registers/assemblers/AssemblersRegistry';
import {BaseCoreLogger} from '../core/logger/Base';
import {BaseOperation} from './operations/_Base';
import {PluginsRegister, WrapConfigurePolygonjsCallback} from './poly/registers/plugins/PluginsRegister';
import {CamerasRegister} from './poly/registers/cameras/CamerasRegister';
import {PolyPluginInterface} from './poly/registers/plugins/Plugin';
import {PolyDictionary} from '../types/GlobalTypes';
import {BlobsController} from './poly/BlobsController';
import {AssetUrlsController} from './poly/AssetUrlsController';
// import {SelfContainedScenesLoader} from './poly/SelfContainedSceneLoader';
import {PolyPerformanceformanceController} from './poly/PerformanceController';
import {ScenesRegister} from './poly/ScenesRegister';
import {LogoController} from './poly/LogoController';

declare global {
	interface Window {
		__POLYGONJS_POLY_INSTANCE__: PolyEngine;
	}
}

// having __POLYGONJS_VERSION__ here really adds friction
// for compiling this after exporting from the editor
// declare var __POLYGONJS_VERSION__: string;
// const POLYGONJS_VERSION = __POLYGONJS_VERSION__;
export class PolyEngine {
	// static _instance: Poly | undefined;
	public readonly renderersController: RenderersController = new RenderersController();
	public readonly scenesRegister: ScenesRegister = new ScenesRegister();
	public readonly nodesRegister: NodesRegister = new NodesRegister(this);
	public readonly operationsRegister: OperationsRegister = new OperationsRegister(this);
	public readonly expressionsRegister: ExpressionRegister = new ExpressionRegister();
	public readonly assemblersRegister: AssemblersRegister = new AssemblersRegister();
	public readonly pluginsRegister: PluginsRegister = new PluginsRegister(this);
	public readonly camerasRegister: CamerasRegister = new CamerasRegister(this);
	public readonly blobs: BlobsController = new BlobsController(this);
	public readonly assetUrls: AssetUrlsController = new AssetUrlsController();
	public readonly logo = new LogoController();
	// public readonly selfContainedScenesLoader: SelfContainedScenesLoader = new SelfContainedScenesLoader();
	public readonly performance: PolyPerformanceformanceController = new PolyPerformanceformanceController();
	scenesByUuid: PolyDictionary<PolyScene> = {};
	_env: string | undefined;
	private _playerMode: boolean = true;
	private _logger: BaseCoreLogger | null = null;

	static _instance_() {
		// we are using a window globals to ensure 2 instances can never be created
		// even when the js are compiled by different means,
		// which can happen in the editor.
		if (window.__POLYGONJS_POLY_INSTANCE__) {
			return window.__POLYGONJS_POLY_INSTANCE__;
		} else {
			const instance = new PolyEngine();
			window.__POLYGONJS_POLY_INSTANCE__ = instance;
			// this._instance = instance
			return window.__POLYGONJS_POLY_INSTANCE__;
		}
		// return (this._instance = this._instance || new Poly());
	}
	private constructor() {}

	setPlayerMode(mode: boolean) {
		this._playerMode = mode;
	}
	playerMode() {
		return this._playerMode;
	}

	registerNode(node: BaseNodeConstructor, tab_menu_category?: string, options?: NodeRegisterOptions) {
		this.nodesRegister.register(node, tab_menu_category, options);
	}
	registerOperation(operation: typeof BaseOperation, options?: OperationRegisterOptions) {
		this.operationsRegister.register(operation, options);
	}

	registerCamera(node: BaseNodeConstructor) {
		this.camerasRegister.register(node);
	}
	registerPlugin(plugin: PolyPluginInterface) {
		this.pluginsRegister.register(plugin);
	}
	wrapConfigurePolygonjs(callback: WrapConfigurePolygonjsCallback) {
		this.pluginsRegister.wrapConfigurePolygonjs(callback);
	}

	registeredNodes(parentNode: BaseNodeType): PolyDictionary<typeof BaseNodeClass> {
		return this.nodesRegister.registeredNodes(parentNode);
	}
	registeredOperation(parent_context: NodeContext, operation_type: string): typeof BaseOperation | undefined {
		return this.operationsRegister.registeredOperation(parent_context, operation_type);
	}
	registeredCameraTypes() {
		return this.camerasRegister.registeredTypes();
	}

	inWorkerThread() {
		return false;
	}

	//
	//
	// LIBS
	//
	//
	private _libs_controller: PolyLibsController | undefined;
	get libs() {
		return (this._libs_controller = this._libs_controller || new PolyLibsController());
	}

	//
	//
	// ENV
	//
	//
	setEnv(env: string) {
		this._env = env;
	}
	env() {
		return this._env;
	}

	//
	//
	// LOGGER
	//
	//
	setLogger(logger: BaseCoreLogger | null) {
		this._logger = logger;
	}

	log(message?: any, ...optionalParams: any[]) {
		this._logger?.log(...[message, ...optionalParams]);
	}
	warn(message?: any, ...optionalParams: any[]) {
		this._logger?.warn(...[message, ...optionalParams]);
	}
	error(message?: any, ...optionalParams: any[]) {
		this._logger?.error(...[message, ...optionalParams]);
	}
}

export const Poly = PolyEngine._instance_();
