import {Matrix4, WebGLRenderer} from 'three';
import type {PolyScene} from '../../engine/scene/PolyScene';
import {CoreXRControllerContainer} from './CoreXRControllerContainer';
const tempMatrix = new Matrix4();

export abstract class BaseCoreXRController {
	protected controllerContainers: CoreXRControllerContainer[] = [];
	constructor(protected scene: PolyScene, protected renderer: WebGLRenderer, private canvas: HTMLCanvasElement) {}
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

	private _createController(controllerIndex: number): CoreXRControllerContainer {
		const controllerContainer = new CoreXRControllerContainer(
			this.scene,
			this.renderer,
			controllerIndex,
			this.controllerName(controllerIndex)
		);
		this.controllerContainers.push(controllerContainer);
		this._addControllerEvents(controllerContainer, controllerIndex);
		return controllerContainer;
	}
	protected _addControllerEvents(controllerContainer: CoreXRControllerContainer, controllerIndex: number): void {}
	protected abstract controllerName(controllerIndex: number): string;
	process(frame?: XRFrame) {
		for (let controllerContainer of this.controllerContainers) {
			tempMatrix.identity().extractRotation(controllerContainer.controller.matrixWorld);
			controllerContainer.ray.origin.setFromMatrixPosition(controllerContainer.controller.matrixWorld);
			controllerContainer.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);
		}
	}

	private _onSessionStartBound = this._onSessionStart.bind(this);
	private _onSessionEndBound = this._onSessionEnd.bind(this);
	private _onSessionStart() {
		this.scene.play();
	}
	private _onSessionEnd() {
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
			return;
		}
		const parent = this.canvas.parentElement;
		if (parent) {
			const button = this.createButton();
			parent.prepend(button);
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
