import {BaseNodeType} from '../nodes/_Base';

type Hook = () => void;
type HookByNode = Map<BaseNodeType, Hook>;

export class PolyOnSceneUpdatedHooksController {
	private _map: HookByNode = new Map();
	registerHook(node: BaseNodeType, hook: Hook) {
		this._map.set(node, hook);
	}
	unregisterHook(node: BaseNodeType) {
		this._map.delete(node);
	}
	runHooks() {
		this._map.forEach((hook) => hook());
	}
}
