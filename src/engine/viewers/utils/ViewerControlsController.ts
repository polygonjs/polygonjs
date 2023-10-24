import {Camera, Vector3, EventDispatcher} from 'three';
import {CameraControls} from '../../nodes/event/_BaseCameraControls';
import type {OrbitControls} from '../../nodes/event/CameraOrbitControls';
import {TypedViewer} from '../_Base';

type UpdateControlsFunc = (delta: number) => void;

export enum CameraControlsEvent {
	start = 'start',
	end = 'end',
}
export const CAMERA_CONTROLS_EVENTS: CameraControlsEvent[] = [CameraControlsEvent.start, CameraControlsEvent.end];
const START_EVENT = {type: CameraControlsEvent.start};
const END_EVENT = {type: CameraControlsEvent.end};

export class ViewerControlsController<C extends Camera> extends EventDispatcher {
	protected _active: boolean = false;
	private _updateControlsFunc: UpdateControlsFunc | undefined;
	protected _controls: CameraControls | undefined;
	private _mounted = false;
	constructor(private viewer: TypedViewer<C>) {
		super();
	}

	controls() {
		return this._controls;
	}

	mount() {
		if (this._mounted) {
			return;
		}
		this._mounted = true;
		const controlsNode = this.viewer.controlsNode();
		const camera = this.viewer.camera();
		if (!(controlsNode && camera)) {
			return;
		}
		controlsNode.applyControls(camera, this.viewer).then((controls) => {
			this._controls = controls;
			// make sure that the function is (delta) => controls.update(delta)
			// and not just "controls.update", as this would prevent the controls from binding "this" properly.
			// This messes up with the FirstPersoControls for instance.
			this._updateControlsFunc = controls ? (delta) => controls.update(delta) : undefined;

			for (const eventName of CAMERA_CONTROLS_EVENTS) {
				controls.addEventListener(eventName, this._boundEventHandler[eventName]);
			}

			if (!this._mounted) {
				this._disposeControls();
			}
		});
	}
	unmount() {
		if (!this._mounted) {
			return;
		}
		this._mounted = false;
		this._disposeControls();
		// dispose controls
		// this._controlsNode = undefined;
	}
	private _disposeControls() {
		if (this._controls) {
			for (const eventName of CAMERA_CONTROLS_EVENTS) {
				this._controls.removeEventListener(eventName, this._boundEventHandler[eventName]);
			}
			this._controls.dispose();
			// this._controls = undefined;
			// this._updateControlsFunc = undefined;
		}
		this._updateControlsFunc = undefined;
	}
	update(delta: number) {
		if (this._updateControlsFunc) {
			this._updateControlsFunc(delta);
		}
	}
	setActive(active: boolean) {
		if (active) {
			this.mount();
		} else {
			this.unmount();
		}
	}
	setTarget(target: Vector3) {
		if (!this._controls) {
			return;
		}
		const orbitControls = this._controls as OrbitControls;
		if (!orbitControls.target) {
			return;
		}
		orbitControls.target.copy(target);
	}
	private _boundEventHandler: Record<CameraControlsEvent, () => void> = {
		[CameraControlsEvent.start]: () => this.dispatchEvent(START_EVENT),
		[CameraControlsEvent.end]: () => this.dispatchEvent(END_EVENT),
	};
}
