import {BaseNodeType} from '../../_Base';

type FlagHookCallback = () => void;

export class BaseFlag {
	// protected _available_states: [boolean, boolean] = [];
	protected _state: boolean = true;
	protected _hooks: FlagHookCallback[] | null = null;
	constructor(protected node: BaseNodeType) {}

	// set_available_states(states: T[]) {}
	add_hook(hook: FlagHookCallback) {
		this._hooks = this._hooks || [];
		this._hooks.push(hook);
	}
	protected on_update() {}
	set(new_state: boolean) {
		if (this._state != new_state) {
			this._state = new_state;
			this.on_update();
			this.run_hooks();
		}
	}
	active() {
		return this._state;
	}
	toggle() {
		this.set(!this._state);
	}
	run_hooks() {
		if (this._hooks) {
			for (let hook of this._hooks) {
				hook();
			}
		}
	}
}
