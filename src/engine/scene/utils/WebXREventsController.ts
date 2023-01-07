import {Camera, WebGLRenderer} from 'three';
import {CoreWebXRARControllerOptions} from '../../../core/webXR/CommonAR';
import {CoreWebXRVRControllerOptions} from '../../../core/webXR/CommonVR';
import type {CoreWebXRARController} from '../../../core/webXR/CoreWebXRARController';
import type {CoreWebXRVRController} from '../../../core/webXR/CoreWebXRVRController';
import type {BaseCoreWebXRController} from '../../../core/webXR/_BaseCoreWebXRController';
import type {PolyScene} from '../PolyScene';

type ARControllerCreateFunction = (
	renderer: WebGLRenderer,
	camera: Camera,
	canvas: HTMLCanvasElement,
	options: CoreWebXRARControllerOptions
) => CoreWebXRARController;
type VRControllerCreateFunction = (
	renderer: WebGLRenderer,
	camera: Camera,
	canvas: HTMLCanvasElement,
	options: CoreWebXRVRControllerOptions
) => CoreWebXRVRController;
export class SceneWebXRController {
	constructor(protected scene: PolyScene) {}

	/**
	 *
	 * WebXR
	 *
	 */
	private _activeXRController: BaseCoreWebXRController | null = null;
	private _setActiveXRController(controller: BaseCoreWebXRController | null): void {
		this._activeXRController = controller;
	}
	activeXRController(): BaseCoreWebXRController | null {
		return this._activeXRController;
	}

	/**
	 *
	 * WebXR AR
	 *
	 */
	private _ARControllerCreateFunction: ARControllerCreateFunction | undefined;
	private _activeARController: CoreWebXRARController | null = null;
	setARControllerCreationFunction(func: ARControllerCreateFunction) {
		this._ARControllerCreateFunction = func;
	}
	ARControllerCreateFunction() {
		return this._ARControllerCreateFunction;
	}
	setActiveARController(ARController: CoreWebXRARController | null) {
		this._activeARController = ARController;
		this._setActiveXRController(ARController);
	}
	activeARController() {
		return this._activeARController;
	}

	/**
	 *
	 * WebXR VR
	 *
	 */
	private _VRControllerCreateFunction: VRControllerCreateFunction | undefined;
	private _activeVRController: CoreWebXRVRController | null = null;
	setVRControllerCreationFunction(func: VRControllerCreateFunction) {
		this._VRControllerCreateFunction = func;
	}
	VRControllerCreateFunction() {
		return this._VRControllerCreateFunction;
	}
	setActiveVRController(VRController: CoreWebXRVRController | null) {
		this._activeVRController = VRController;
		this._setActiveXRController(VRController);
	}
	activeVRController() {
		return this._activeVRController;
	}
}
