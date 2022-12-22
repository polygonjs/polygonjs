import {BaseViewerType} from '../_Base';
import {RaycasterForBVH} from '../../operations/sop/utils/Bvh/three-mesh-bvh';
import {Raycaster, Vector2} from 'three';
import {Vector2Like} from '../../../types/GlobalTypes';
function createRaycaster() {
	const raycaster = new Raycaster() as RaycasterForBVH;
	raycaster.firstHitOnly = true;
	return raycaster;
}

export class ViewerRaycastersController {
	private readonly _cursor0 = new Vector2();
	private readonly _raycaster0 = createRaycaster();
	// private readonly _raycaster1 = createRaycaster();
	// private readonly _raycasters: [RaycasterForBVH, RaycasterForBVH] = [this._raycaster0, this._raycaster1];

	constructor(protected viewer: BaseViewerType) {}

	setCursor0(cursor: Vector2Like) {
		this._cursor0.x = cursor.x;
		this._cursor0.y = cursor.y;
	}
	raycaster0() {
		return this._raycaster0;
	}

	update() {
		this._raycaster0.setFromCamera(this._cursor0, this.viewer.camera());
	}
}
