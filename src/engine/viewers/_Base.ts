import {BaseCameraObjNodeType} from '../nodes/obj/_BaseCamera';
import {ViewerCamerasController} from './utils/CamerasController';
import {ViewerControlsController} from './utils/ControlsController';
import {ViewerEventsController} from './utils/EventsController';
import {ViewerWebGLController} from './utils/WebglController';
import {ThreejsCameraControlsController} from '../nodes/obj/utils/cameras/ControlsController';
import {Object3D} from 'three/src/core/Object3D';
import {PolyScene} from '../scene/PolyScene';
import {ViewerAudioController} from './utils/AudioController';
import {Poly, PolyEngine} from '../Poly';

const HOVERED_CLASS_NAME = 'hovered';
type ViewerCallback = (delta: number) => void;
type ViewerCallbacksMap = Map<string, ViewerCallback>;
export interface HTMLElementWithViewer<C extends BaseCameraObjNodeType> extends HTMLElement {
	scene: PolyScene;
	viewer: TypedViewer<C>;
	Poly: PolyEngine;
}

export abstract class TypedViewer<C extends BaseCameraObjNodeType> {
	// protected _display_scene: Scene;
	// protected _canvas: HTMLCanvasElement | undefined;
	protected _domElement: HTMLElementWithViewer<C> | undefined;
	protected _active: boolean = false;
	private static _nextViewerId = 0;
	private _id: Readonly<number>;
	protected _renderObjectOverride: Object3D | undefined;
	protected _scene: PolyScene;
	protected _canvas: HTMLCanvasElement | undefined;
	constructor(protected _cameraNode: C) {
		this._id = TypedViewer._nextViewerId++;
		this._scene = this._cameraNode.scene();
	}

	protected _mounted = false;
	mount(element: HTMLElement) {
		this._domElement = element as HTMLElementWithViewer<C>;
		this._domElement.viewer = this;
		this._domElement.scene = this._cameraNode.scene();
		this._domElement.Poly = Poly;
		this._mounted = true;
	}
	unmount() {
		if (!this._domElement) {
			return;
		}
		// let childElement: Element | undefined;
		// while ((childElement = this._domElement.children[0])) {
		// 	this._domElement.removeChild(childElement);
		// }
		// when unmounting, it is very unsafe to remove all HTMLElements
		// that have been created inside _domElement
		// as those could have been created by an app specific code
		// OR... those could have been created when an element is shared by multiple scenes
		// at different times
		this._audioController?.unmount();
		this._domElement.removeChild(this.canvas());

		this._mounted = false;
	}
	protected _canvasIdPrefix() {
		return 'TypedViewer';
	}
	private _createCanvas() {
		const canvas = document.createElement('canvas');
		canvas.id = `${this._canvasIdPrefix()}_${this._id}`;
		canvas.style.display = 'block';
		canvas.style.outline = 'none';
		// we add 100% to the width and height
		// to make it easy for the canvas to not grow larger
		// than its container, without requiring css to enforce this
		canvas.style.width = '100%';
		canvas.style.height = '100%';
		return canvas;
	}
	canvas() {
		return (this._canvas = this._canvas || this._createCanvas());
	}

	setRenderObjectOverride(object?: Object3D | null) {
		if (object) {
			this._renderObjectOverride = object;
		} else {
			this._renderObjectOverride = undefined;
		}
	}

	active() {
		return this._active;
	}
	activate() {
		this._active = true;
	}
	deactivate() {
		this._active = false;
	}

	protected _camerasController: ViewerCamerasController | undefined;
	camerasController(): ViewerCamerasController {
		return (this._camerasController = this._camerasController || new ViewerCamerasController(this));
	}
	protected _controlsController: ViewerControlsController | undefined;
	controlsController() {
		return this._controlsController;
	}
	protected _eventsController: ViewerEventsController | undefined;
	eventsController(): ViewerEventsController {
		return (this._eventsController = this._eventsController || new ViewerEventsController(this));
	}
	protected _webGLController: ViewerWebGLController | undefined;
	webglController(): ViewerWebGLController {
		return (this._webGLController = this._webGLController || new ViewerWebGLController(this));
	}
	private _audioController: ViewerAudioController | undefined;
	audioController(): ViewerAudioController {
		return (this._audioController = this._audioController || new ViewerAudioController(this));
	}

	domElement() {
		return this._domElement;
	}
	scene() {
		return this._scene;
	}

	cameraNode() {
		return this._cameraNode;
	}
	cameraControlsController(): ThreejsCameraControlsController | undefined {
		return undefined;
	}
	id() {
		return this._id;
	}

	dispose() {
		this._scene.viewersRegister.unregisterViewer(this);
		this.eventsController().dispose();
		if (!this._domElement) {
			return;
		}
		let child: Element;
		while ((child = this._domElement.children[0])) {
			this._domElement.removeChild(child);
		}
	}

	// html container class
	resetContainerClass() {
		this.domElement()?.classList.remove(HOVERED_CLASS_NAME);
	}
	setContainerClassHovered() {
		this.domElement()?.classList.add(HOVERED_CLASS_NAME);
	}
	markAsReady() {}

	//
	//
	// CALLBACKS
	//
	//
	// tick callbacks
	private _onBeforeTickCallbacksMap: ViewerCallbacksMap | undefined;
	private _onAfterTickCallbacksMap: ViewerCallbacksMap | undefined;
	protected _onBeforeTickCallbacks: Array<ViewerCallback> = [];
	protected _onAfterTickCallbacks: Array<ViewerCallback> = [];
	// render callbacks
	private _onBeforeRenderCallbacksMap: ViewerCallbacksMap | undefined;
	private _onAfterRenderCallbacksMap: ViewerCallbacksMap | undefined;
	protected _onBeforeRenderCallbacks: Array<ViewerCallback> = [];
	protected _onAfterRenderCallbacks: Array<ViewerCallback> = [];

	registerOnBeforeTick(callbackName: string, callback: ViewerCallback) {
		this._registerCallback(callbackName, callback, this.registeredBeforeTickCallbacks());
	}
	unRegisterOnBeforeTick(callbackName: string) {
		this._unregisterCallback(callbackName, this._onBeforeTickCallbacksMap);
	}
	registeredBeforeTickCallbacks() {
		return (this._onBeforeTickCallbacksMap = this._onBeforeTickCallbacksMap || new Map());
	}
	registerOnAfterTick(callbackName: string, callback: ViewerCallback) {
		this._registerCallback(callbackName, callback, this.registeredAfterTickCallbacks());
	}
	unRegisterOnAfterTick(callbackName: string) {
		this._unregisterCallback(callbackName, this._onAfterTickCallbacksMap);
	}
	registeredAfterTickCallbacks() {
		return (this._onAfterTickCallbacksMap = this._onAfterTickCallbacksMap || new Map());
	}
	registerOnBeforeRender(callbackName: string, callback: ViewerCallback) {
		this._registerCallback(callbackName, callback, this.registeredBeforeRenderCallbacks());
	}
	unRegisterOnBeforeRender(callbackName: string) {
		this._unregisterCallback(callbackName, this._onBeforeRenderCallbacksMap);
	}
	registeredBeforeRenderCallbacks() {
		return (this._onBeforeRenderCallbacksMap = this._onBeforeRenderCallbacksMap || new Map());
	}
	registerOnAfterRender(callbackName: string, callback: ViewerCallback) {
		this._registerCallback(callbackName, callback, this.registeredAfterRenderCallbacks());
	}
	unRegisterOnAfterRender(callbackName: string) {
		this._unregisterCallback(callbackName, this._onAfterRenderCallbacksMap);
	}
	registeredAfterRenderCallbacks() {
		return (this._onAfterRenderCallbacksMap = this._onAfterRenderCallbacksMap || new Map());
	}
	private _registerCallback<C extends ViewerCallback>(callbackName: string, callback: C, map: ViewerCallbacksMap) {
		if (map.has(callbackName)) {
			console.warn(`callback ${callbackName} already registered`);
			return;
		}
		map.set(callbackName, callback);
		this._updateCallbacks();
	}
	private _unregisterCallback(callbackName: string, map?: ViewerCallbacksMap) {
		if (!map) {
			return;
		}
		map.delete(callbackName);
		this._updateCallbacks();
	}
	private _updateCallbacks() {
		this._onBeforeTickCallbacks = [];
		this._onBeforeTickCallbacksMap?.forEach((callback) => {
			this._onBeforeTickCallbacks.push(callback);
		});
		this._onAfterTickCallbacks = [];
		this._onAfterTickCallbacksMap?.forEach((callback) => {
			this._onAfterTickCallbacks.push(callback);
		});
		this._onBeforeRenderCallbacks = [];
		this._onBeforeRenderCallbacksMap?.forEach((callback) => {
			this._onBeforeRenderCallbacks.push(callback);
		});
		this._onAfterRenderCallbacks = [];
		this._onAfterRenderCallbacksMap?.forEach((callback) => {
			this._onAfterRenderCallbacks.push(callback);
		});
	}
	private _runCallbacks(callbacks: ViewerCallback[], delta: number) {
		for (const callback of callbacks) {
			callback(delta);
		}
	}
	protected _runOnBeforeTickCallbacks(delta: number) {
		this._runCallbacks(this._onBeforeTickCallbacks, delta);
	}
	protected _runOnAfterTickCallbacks(delta: number) {
		this._runCallbacks(this._onAfterTickCallbacks, delta);
	}
	protected _runOnBeforeRenderCallbacks(delta: number) {
		this._runCallbacks(this._onBeforeRenderCallbacks, delta);
	}
	protected _runOnAfterRenderCallbacks(delta: number) {
		this._runCallbacks(this._onAfterRenderCallbacks, delta);
	}
}

export type BaseViewerType = TypedViewer<BaseCameraObjNodeType>;
