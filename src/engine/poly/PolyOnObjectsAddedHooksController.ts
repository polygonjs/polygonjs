import {Object3D} from 'three';

type Hook = (object: Object3D, parent: Object3D) => void;
type HookByName = Map<string, Hook>;

export class PolyOnObjectsAddedHooksController {
	private _map: HookByName = new Map();
	registerHook(hookName: string, hook: Hook) {
		this._map.set(hookName, hook);
	}
	runHooks(sopGroup: Object3D) {
		const children = sopGroup.children;
		for (let child of children) {
			this._map.forEach((hook) => hook(child, sopGroup));
		}
	}
}
