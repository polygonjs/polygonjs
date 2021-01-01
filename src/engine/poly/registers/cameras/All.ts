import {OrthographicCameraObjNode} from '../../../nodes/obj/OrthographicCamera';
import {PerspectiveCameraObjNode} from '../../../nodes/obj/PerspectiveCamera';

import {Poly} from '../../../Poly';
export class AllCamerasRegister {
	static run(poly: Poly) {
		poly.registerCamera(OrthographicCameraObjNode);
		poly.registerCamera(PerspectiveCameraObjNode);
	}
}
