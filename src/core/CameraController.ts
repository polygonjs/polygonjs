import {Object3D} from 'three/src/core/Object3D';

enum EVENT {
	CHANGE = 'change',
	MOVEEND = 'moveend',
}

type CameraControllerCallback = (target: Object3D) => void;

export class CameraController {
	private _updateAlways: boolean = true;
	private _listener: any;
	private _target: Object3D | undefined;
	private _listenerAdded: boolean = false;

	constructor(private _callback: CameraControllerCallback) {
		this._listener = this._executeCallback.bind(this);
	}

	removeTarget() {
		this.setTarget(undefined);
	}
	setTarget(target: Object3D | undefined) {
		if (!target) {
			this._removeCameraEvent();
		}

		const old_target = this._target;
		this._target = target;

		if (this._target != null) {
			this._executeCallback();
		}

		if (
			(this._target != null ? this._target.uuid : undefined) !==
			(old_target != null ? old_target.uuid : undefined)
		) {
			this._addCameraEvent();
		}
	}

	setUpdateAlways(newUpdateAlways: boolean) {
		this._removeCameraEvent();

		this._updateAlways = newUpdateAlways;

		this._addCameraEvent();
	}

	private _currentEventName() {
		if (this._updateAlways) {
			return EVENT.CHANGE;
		} else {
			return EVENT.MOVEEND;
		}
	}

	private _addCameraEvent() {
		if (this._listenerAdded) {
			return;
		}

		if (this._target != null) {
			this._target.addEventListener(this._currentEventName(), this._listener);
			this._listenerAdded = true;
		}
	}

	private _removeCameraEvent() {
		if (this._listenerAdded !== true) {
			return;
		}

		if (this._target != null) {
			this._target.removeEventListener(this._currentEventName(), this._listener);
			this._listenerAdded = false;
		}
	}

	private _executeCallback() {
		if (this._target != null) {
			this._callback(this._target);
		}
	}
}
