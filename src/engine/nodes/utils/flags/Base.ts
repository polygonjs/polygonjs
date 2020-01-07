import {BaseNode} from 'src/engine/nodes/_Base';

export class BaseFlag {
	// protected _available_states: [boolean, boolean] = [];
	protected _state: boolean;
	constructor(protected node: BaseNode) {}

	// set_available_states(states: T[]) {}
	on_update() {}
	set(new_state: boolean) {
		if (this._state != new_state) {
			this._state = new_state;
			this.on_update();
		}
	}
	get active() {
		return this._state;
	}
	toggle() {
		this.set(!this._state);
	}
}
