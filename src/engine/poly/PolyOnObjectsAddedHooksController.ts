import {Object3D} from 'three';

type Hook = (object: Object3D) => void;
type HookByName = Map<string, Hook>;

export class PolyOnObjectsAddedHooksController {
	private _map: HookByName = new Map();
	registerHook(hookName: string, hook: Hook) {
		this._map.set(hookName, hook);
	}
	runHooks(objects: Object3D[]) {
		for (let object of objects) {
			this._map.forEach((hook) => hook(object));
		}
	}
}
