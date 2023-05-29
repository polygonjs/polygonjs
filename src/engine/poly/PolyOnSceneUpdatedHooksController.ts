import {BaseNodeType} from '../nodes/_Base';

type Hook = () => void;
type HookByNode = Map<BaseNodeType, Hook>;

export class PolyOnSceneUpdatedHooksController {
	private _map: HookByNode = new Map();
	private _hooks: Hook[] | undefined;
	registerHook(node: BaseNodeType, hook: Hook) {
		this._map.set(node, hook);
		this._updateCache();
		console.log('register hook', node.path());
	}
	unregisterHook(node: BaseNodeType) {
		this._map.delete(node);
		this._updateCache();
		console.log('unregisterHook hook', node.path());
	}
	runHooks() {
		const hooks = this._hooks;
		if (!hooks) {
			return;
		}
		for (let hook of hooks) {
			hook();
		}
	}
	hookedNodes() {
		return Array.from(this._map.keys());
	}
	private _updateCache() {
		if (this._map.size == 0) {
			this._hooks = undefined;
		} else {
			this._hooks = this._hooks || [];
			this._hooks.length = 0;
			const hooks = this._hooks;
			this._map.forEach((hook) => hooks.push(hook));
		}
	}
}
