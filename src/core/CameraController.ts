import {Object3D} from 'three/src/core/Object3D'

enum EVENT {
	CHANGE = 'change',
	MOVEEND = 'moveend',
}

type CameraControllerCallback = (target: Object3D) => void

export class CameraController {
	private _update_always: boolean = true
	private _listener: any
	private _target: Object3D
	private _listener_added: boolean

	constructor(private _callback: CameraControllerCallback) {
		this._listener = this._execute_callback.bind(this)
	}

	remove_target() {
		this.set_target(null)
	}
	set_target(target: Object3D) {
		if (target == null) {
			this._remove_camera_event()
		}

		const old_target = this._target
		this._target = target

		if (this._target != null) {
			this._execute_callback()
		}

		if (
			(this._target != null ? this._target.uuid : undefined) !==
			(old_target != null ? old_target.uuid : undefined)
		) {
			this._add_camera_event()
		}
	}

	set_update_always(new_update_always: boolean) {
		this._remove_camera_event()

		this._update_always = new_update_always

		this._add_camera_event()
	}

	private _current_event_name() {
		if (this._update_always) {
			return EVENT.CHANGE
		} else {
			return EVENT.MOVEEND
		}
	}

	private _add_camera_event() {
		if (this._listener_added === true) {
			return
		}

		if (this._target != null) {
			this._target.addEventListener(
				this._current_event_name(),
				this._listener
			)
			this._listener_added = true
		}
	}

	private _remove_camera_event() {
		if (this._listener_added !== true) {
			return
		}

		if (this._target != null) {
			this._target.removeEventListener(
				this._current_event_name(),
				this._listener
			)
			this._listener_added = false
		}
	}

	private _execute_callback() {
		if (this._target != null) {
			this._callback(this._target)
		}
	}
}
