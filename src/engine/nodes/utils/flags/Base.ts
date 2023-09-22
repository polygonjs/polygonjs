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
	protected _onUpdate() {}
	set(newState: boolean) {
		if (this._state != newState) {
			if (this.node.insideALockedParent()) {
				const lockedParent = this.node.lockedParent();
				console.warn(
					`node '${this.node.path()}' cannot have its flag changed, since it is inside '${
						lockedParent ? lockedParent.path() : ''
					}', which is locked`
				);
				return;
			}
			this._state = newState;
			this._onUpdate();
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
			for (const hook of this._hooks) {
				hook();
			}
		}
	}
}
