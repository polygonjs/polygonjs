import {Object3D} from 'three';
import {CoreGroup} from '../../core/geometry/Group';
import {BaseSopNodeType} from '../nodes/sop/_Base';
import type {CSGOBJTesselationParams} from '../../core/geometry/modules/csg/CsgCommon';
import type {CADOBJTesselationParams} from '../../core/geometry/modules/cad/CadCommon';
import type {QUADOBJTesselationParams} from '../../core/geometry/modules/quad/QuadCommon';
import type {TetOBJTesselationParams} from '../../core/geometry/modules/tet/TetCommon';
// import type {SDFOBJTesselationParams} from '../../core/geometry/modules/sdf/SDFCommon';
interface Params
	extends CSGOBJTesselationParams,
		CADOBJTesselationParams,
		QUADOBJTesselationParams /*, SDFOBJTesselationParams*/,
		TetOBJTesselationParams {}

export type SpecializedChildrenHook = (
	displayNode: BaseSopNodeType,
	coreGroup: CoreGroup,
	newObjects: Object3D[],
	params: Params
) => boolean;
type HookByName = Map<string, SpecializedChildrenHook>;

export class PolySpecializedChildrenController {
	private _map: HookByName = new Map();
	private _hooks: Array<SpecializedChildrenHook> | undefined;
	registerHook(hookName: string, hook: SpecializedChildrenHook) {
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
	runHooks(displayNode: BaseSopNodeType, coreGroup: CoreGroup, newObjects: Object3D[], params: Params): boolean {
		let newObjectsAreDifferent = false;
		if (this._hooks) {
			for (let hook of this._hooks) {
				const _newObjectsAreDifferent = hook(displayNode, coreGroup, newObjects, params);
				if (_newObjectsAreDifferent) {
					newObjectsAreDifferent = true;
				}
			}
		}
		return newObjectsAreDifferent;
	}
}
