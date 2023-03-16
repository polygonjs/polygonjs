import {Object3D} from 'three';
import {CoreGroup} from '../../core/geometry/Group';
import type {CSGOBJTesselationParams} from '../../core/geometry/csg/CsgCommon';
import type {CADOBJTesselationParams} from '../../core/geometry/cad/CadCommon';
import type {SDFOBJTesselationParams} from '../../core/geometry/sdf/SDFCommon';
interface Params extends CSGOBJTesselationParams, CADOBJTesselationParams, SDFOBJTesselationParams {}

type Hook = (coreGroup: CoreGroup, newObjects: Object3D[], params: Params) => boolean;
type HookByName = Map<string, Hook>;

export class PolySpecializedChildrenController {
	private _map: HookByName = new Map();
	private _hooks: Array<Hook> | undefined;
	registerHook(hookName: string, hook: Hook) {
		this._map.set(hookName, hook);
		this._updateCache();
	}
	private _updateCache() {
		this._hooks = [];
		const hooks = this._hooks;
		this._map.forEach((hook) => {
			hooks.push(hook);
		});
	}
	runHooks(coreGroup: CoreGroup, newObjects: Object3D[], params: Params): boolean {
		let newObjectsAreDifferent = false;
		if (this._hooks) {
			for (let hook of this._hooks) {
				const _newObjectsAreDifferent = hook(coreGroup, newObjects, params);
				if (_newObjectsAreDifferent) {
					newObjectsAreDifferent = true;
				}
			}
		}
		return newObjectsAreDifferent;
	}
}
