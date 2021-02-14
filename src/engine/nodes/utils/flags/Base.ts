import {BaseNodeType} from '../../_Base';

type FlagHookCallback = () => void;

export class BaseFlag {
	protected _state: boolean = true;
	protected _hooks: FlagHookCallback[] | null = null;
	constructor(protected node: BaseNodeType) {}

	onUpdate(hook: FlagHookCallback) {
		this._hooks = this._hooks || [];
		this._hooks.push(hook);
	}
	protected _on_update() {}
	set(new_state: boolean) {
		if (this._state != new_state) {
			this._state = new_state;
			this._on_update();
			this.runHooks();
		}
	}
	active() {
		return this._state;
	}
	toggle() {
		this.set(!this._state);
	}
	private runHooks() {
		if (this._hooks) {
			for (let hook of this._hooks) {
				hook();
			}
		}
	}
}
