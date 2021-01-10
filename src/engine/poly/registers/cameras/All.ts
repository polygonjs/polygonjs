import {OrthographicCameraObjNode} from '../../../nodes/obj/OrthographicCamera';
import {PerspectiveCameraObjNode} from '../../../nodes/obj/PerspectiveCamera';

import {PolyEngine} from '../../../Poly';
export class AllCamerasRegister {
	static run(poly: PolyEngine) {
		poly.registerCamera(OrthographicCameraObjNode);
		poly.registerCamera(PerspectiveCameraObjNode);
	}
}
