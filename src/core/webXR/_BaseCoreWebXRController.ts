import {Camera, Matrix4, WebGLRenderer} from 'three';
import type {PolyScene} from '../../engine/scene/PolyScene';
import {CoreWebXRControllerContainer} from './CoreWebXRControllerContainer';
const tempMatrix = new Matrix4();
const webXRButtonsContainerClass = 'polygonjs-webxr-buttons-container';

export type OnWebXRSessionStartedCallback = (session: XRSession) => Promise<void>;
export abstract class BaseCoreWebXRController {
	protected controllerContainers: CoreWebXRControllerContainer[] = [];
	constructor(
		protected scene: PolyScene,
		protected renderer: WebGLRenderer,
		protected camera: Camera,
		private canvas: HTMLCanvasElement
	) {
		console.log('RENDERER:');
		renderer.xr.enabled = true;
	}
	getController(controllerIndex: number) {
		return this.controllerContainers[controllerIndex] || this._createController(controllerIndex);
	}

	mount() {
		this.renderer.xr.addEventListener('sessionstart', this._onSessionStartBound);
		this.renderer.xr.addEventListener('sessionend', this._onSessionEndBound);
		this._mountButton();
	}
	unmount() {
		this.renderer.xr.removeEventListener('sessionstart', this._onSessionStartBound);
		this.renderer.xr.removeEventListener('sessionend', this._onSessionEndBound);
		this._unmountButton();
	}
	abstract requestSession(sessionInit: XRSessionInit, callback: OnWebXRSessionStartedCallback): void;

	private _createController(controllerIndex: number): CoreWebXRControllerContainer {
		const controllerContainer = new CoreWebXRControllerContainer(this.renderer, controllerIndex);
		controllerContainer.initialize(this.camera);
		this.controllerContainers.push(controllerContainer);
		this._addControllerEvents(controllerContainer, controllerIndex);
		return controllerContainer;
	}
	protected _addControllerEvents(controllerContainer: CoreWebXRControllerContainer, controllerIndex: number): void {}
	process(frame?: XRFrame) {
		for (let controllerContainer of this.controllerContainers) {
			tempMatrix.identity().extractRotation(controllerContainer.controller.matrixWorld);
			controllerContainer.ray.origin.setFromMatrixPosition(controllerContainer.controller.matrixWorld);
			controllerContainer.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);
		}
	}

	private _onSessionStartBound = this._onSessionStart.bind(this);
	private _onSessionEndBound = this._onSessionEnd.bind(this);
	protected _onSessionStart() {
		for (let controllerContainer of this.controllerContainers) {
			controllerContainer.initialize(this.camera);
		}
		this.scene.play();
	}
	protected _onSessionEnd() {
		for (let controllerContainer of this.controllerContainers) {
			controllerContainer.initialize(null);
		}
		this.scene.pause();
	}

	/**
	 *
	 * BUTTONS
	 *
	 */
	private _buttonByCanvasId: Map<string, HTMLElement> = new Map();
	abstract createButton(): HTMLElement;

	private _mountButton() {
		if (!this.renderer.xr.enabled) {
			console.warn('renderer.xr is not enabled, not mounting webXR button');
			return;
		}
		const parent = this.canvas.parentElement;
		if (parent) {
			let buttonsContainer: HTMLElement | null = parent.querySelector(`.${webXRButtonsContainerClass}`);
			if (!buttonsContainer) {
				buttonsContainer = document.createElement('div');
				buttonsContainer.classList.add(webXRButtonsContainerClass);
				parent.prepend(buttonsContainer);
				buttonsContainer.style.position = 'absolute';
				buttonsContainer.style.bottom = '20px';
				buttonsContainer.style.textAlign = 'center';
				buttonsContainer.style.width = '100%';
			}
			const button = this.createButton();
			buttonsContainer.prepend(button);
			this._buttonByCanvasId.set(this.canvas.id, button);
		} else {
			console.warn('canvas has no parent');
		}
	}
	private _unmountButton() {
		const button = this._buttonByCanvasId.get(this.canvas.id);
		if (!button) {
			return;
		}
		button.parentElement?.removeChild(button);
	}
}
