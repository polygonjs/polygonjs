import {Vector3} from 'three';
import {CadLoader} from './CadLoader';
export function cadAxis(axisVector3: Vector3) {
	// const oc = CadLoader.oc();
	const axis = CadLoader.gp_Ax2;
	const dir = CadLoader.gp_Dir;
	dir.SetCoord_2(axisVector3.x, axisVector3.y, axisVector3.z);
	axis.SetDirection(dir);
	return axis;
}

const tmpV3 = new Vector3();
export function cadPlaneXY() {
	return cadPlaneFromAxis(tmpV3.set(0, 0, 1));
}
export function cadPlaneFromAxis(axisVector3: Vector3) {
	// const oc = CadLoader.oc();
	const axis = CadLoader.gp_Ax1;
	const dir = CadLoader.gp_Dir;
	dir.SetCoord_2(axisVector3.x, axisVector3.y, axisVector3.z);
	axis.SetDirection(dir);

	const plane = CadLoader.gp_Pln;
	plane.SetAxis(axis);
	return plane;
}
